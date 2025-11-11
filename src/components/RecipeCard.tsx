// src/components/RecipeCard.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Recipe, Review, User } from '../types';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

interface RecipeCardProps {
  recipe: Recipe;
  darkMode?: boolean;
  user?: User | null;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, darkMode = false, user }) => {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [reviewsCount, setReviewsCount] = useState<number>(
    Array.isArray(recipe.reviews) ? recipe.reviews.length : 0
  );
  const [busy, setBusy] = useState(false);

  // Robust user id detection (some user shapes use `id` some `uid`)
  const userId = (user as any)?.id ?? (user as any)?.uid ?? null;

  // Normalize recipe and image path (works with records like "/assets/foo.jpg", "foo.jpg", or external URLs)
  const safeRecipe = useMemo(() => {
    const imgRaw = recipe.imageUrl ? String(recipe.imageUrl).trim() : '';
    let imageUrl = '/assets/placeholder.jpg';
    if (imgRaw) {
      if (/^https?:\/\//i.test(imgRaw)) imageUrl = imgRaw; // external URL
      else if (imgRaw.startsWith('/')) imageUrl = imgRaw; // already absolute from public
      else if (imgRaw.startsWith('assets/') || imgRaw.startsWith('public/assets/')) imageUrl = `/${imgRaw.replace(/^public\//, '')}`;
      else imageUrl = `/assets/${imgRaw}`; // filename only
    }

    return {
      id: recipe.id ?? '',
      title: recipe.title ?? 'Untitled Recipe',
      description: recipe.description ?? 'No description available.',
      category: recipe.category ?? 'Uncategorized',
      author: recipe.author ?? 'Anonymous Chef',
      imageUrl,
      reviews: recipe.reviews ?? ([] as Review[]),
    };
  }, [recipe]);

  // Real-time subscription for likes count and reviews count + whether this user liked
  useEffect(() => {
    if (!safeRecipe.id) return;

    const likesCol = collection(db, 'recipes', safeRecipe.id, 'likes');
    const reviewsCol = collection(db, 'recipes', safeRecipe.id, 'reviews');

    const unsubLikes = onSnapshot(
      likesCol,
      (snap) => {
        setLikesCount(snap.size);
        if (userId) {
          setLiked(snap.docs.some((d) => d.id === String(userId)));
        } else {
          setLiked(false);
        }
      },
      (err) => {
        console.error('likes onSnapshot error:', err);
      }
    );

    const unsubReviews = onSnapshot(
      reviewsCol,
      (snap) => {
        setReviewsCount(snap.size);
      },
      (err) => {
        console.error('reviews onSnapshot error:', err);
      }
    );

    return () => {
      unsubLikes();
      unsubReviews();
    };
  }, [safeRecipe.id, userId]);

  // Toggle like (creates/deletes doc at recipes/{id}/likes/{userId} and mirror at users/{userId}/likes/{recipeId})
  const toggleLike = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      // prevent navigation when clicking in the card (it's wrapped in a Link)
      e.preventDefault();
      e.stopPropagation();

      if (!safeRecipe.id) return;
      if (!userId) {
        // if you want a gentler UX you could open a modal or route to /login instead
        alert('Please log in to like recipes.');
        return;
      }
      if (busy) return;
      setBusy(true);

      try {
        const likeRef = doc(db, 'recipes', safeRecipe.id, 'likes', String(userId));
        const userLikeRef = doc(db, 'users', String(userId), 'likes', safeRecipe.id);

        const existing = await getDoc(likeRef);
        if (existing.exists()) {
          // unlike
          await deleteDoc(likeRef);
          // best-effort delete mirror
          try {
            await deleteDoc(userLikeRef);
          } catch (err) {
            console.warn('mirror delete failed', err);
          }
          // optimistic local update — onSnapshot will reconcile
          setLiked(false);
          setLikesCount((n) => Math.max(0, n - 1));
        } else {
          // like
          await setDoc(likeRef, {
            userId: String(userId),
            username: (user as any)?.username ?? (user as any)?.name ?? '',
            createdAt: serverTimestamp(),
          });
          await setDoc(userLikeRef, {
            recipeId: safeRecipe.id,
            title: safeRecipe.title ?? '',
            createdAt: serverTimestamp(),
          });
          setLiked(true);
          setLikesCount((n) => n + 1);
        }
      } catch (err) {
        console.error('Error toggling like:', err);
        alert('Could not update like — please try again.');
      } finally {
        setBusy(false);
      }
    },
    [safeRecipe.id, safeRecipe.title, userId, user, busy]
  );

  // Local derived average rating (if recipe carries embedded reviews array)
  const averageRating = useMemo(() => {
    if (!Array.isArray(safeRecipe.reviews) || safeRecipe.reviews.length === 0) return null;
    const sum = safeRecipe.reviews.reduce((s, r) => s + (r.rating ?? 0), 0);
    return (sum / safeRecipe.reviews.length).toFixed(1);
  }, [safeRecipe.reviews]);

  return (
    <Link
      to={`/recipe/${safeRecipe.id}`}
      state={{ recipe: safeRecipe }}
      style={{ textDecoration: 'none', color: 'inherit' }}
      aria-label={`Open ${safeRecipe.title}`}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          maxWidth: 360,
          background: darkMode ? '#1e1e1e' : '#fff',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: hovered
            ? darkMode
              ? '0 14px 32px rgba(0,0,0,0.55)'
              : '0 14px 32px rgba(0,0,0,0.15)'
            : darkMode
            ? '0 5px 14px rgba(0,0,0,0.4)'
            : '0 5px 14px rgba(0,0,0,0.08)',
          transform: hovered ? 'translateY(-6px) scale(1.02)' : 'none',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Poppins', 'Segoe UI', sans-serif",
        }}
      >
        {/* Image */}
        <div
          style={{
            position: 'relative',
            height: 220,
            width: '100%',
            overflow: 'hidden',
            borderBottom: `1px solid ${darkMode ? '#333' : '#eee'}`,
          }}
        >
          <img
            src={safeRecipe.imageUrl}
            alt={safeRecipe.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
            }}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/assets/placeholder.jpg';
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)',
            }}
          />

          <h3
            style={{
              position: 'absolute',
              bottom: 12,
              left: 16,
              color: '#fff',
              margin: 0,
              fontWeight: 700,
              fontSize: '1.35rem',
              textShadow: '0 2px 6px rgba(0,0,0,0.6)',
            }}
          >
            {safeRecipe.title}
          </h3>
        </div>

        {/* Content */}
        <div style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <p style={{ fontSize: '0.9rem', color: darkMode ? '#f0c6a0' : '#7d5a50', fontWeight: 600, margin: 0 }}>
            {safeRecipe.category} • {safeRecipe.author}
          </p>

          <p style={{ fontSize: '0.95rem', color: darkMode ? '#ddd' : '#444', margin: 0, lineHeight: 1.5 }}>
            {safeRecipe.description.length > 110 ? safeRecipe.description.substring(0, 110) + '...' : safeRecipe.description}
          </p>

          {/* Rating / counts / like button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {/* Show review count & average if reviews exist, otherwise "No reviews" */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {reviewsCount > 0 ? (
                  <span style={{ fontSize: '0.95rem', color: darkMode ? '#ffd479' : '#e6a157', fontWeight: 600 }}>
                    {averageRating ? `⭐ ${averageRating}` : '⭐'} <span style={{ color: darkMode ? '#aaa' : '#888', fontWeight: 500 }}>({reviewsCount})</span>
                  </span>
                ) : (
                  <span style={{ fontSize: '0.9rem', color: darkMode ? '#999' : '#bbb' }}>⭐ No reviews</span>
                )}
              </div>
            </div>

            {/* Like button with count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 14, color: darkMode ? '#ffd479' : '#e6a157', fontWeight: 700 }}>
                {likesCount}
              </div>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!user) return; // user must exist, else don't like

                  if (busy) return;
                  setBusy(true);

                  try {
                    const userId = user.id;
                    const likeRef = doc(db, 'recipes', safeRecipe.id, 'likes', userId);
                    const userLikeRef = doc(db, 'users', userId, 'likes', safeRecipe.id);
                    const existing = await getDoc(likeRef);

                    if (existing.exists()) {
                      // Unlike
                      await deleteDoc(likeRef);
                      await deleteDoc(userLikeRef).catch(() => {});
                      setLiked(false);
                      setLikesCount((n) => Math.max(0, n - 1));
                    } else {
                      // Like
                      await setDoc(likeRef, {
                        userId,
                        username: user.username ?? user.name ?? '',
                        createdAt: serverTimestamp(),
                      });
                      await setDoc(userLikeRef, {
                        recipeId: safeRecipe.id,
                        title: safeRecipe.title,
                        createdAt: serverTimestamp(),
                      });
                      setLiked(true);
                      setLikesCount((n) => n + 1);
                    }
                  } catch (err) {
                    console.error('Error toggling like:', err);
                  } finally {
                    setBusy(false);
                  }
                }}
                disabled={busy}
                aria-pressed={liked}
                aria-label={liked ? 'Unlike recipe' : 'Like recipe'}
                title={liked ? 'Unlike' : 'Like'}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.45rem',
                  transform: liked ? 'scale(1.08)' : 'scale(1)',
                  color: liked ? 'red' : undefined, // heart turns red when liked
                }}
              >
                {liked ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
