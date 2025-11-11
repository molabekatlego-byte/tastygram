import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Recipe, Review } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  darkMode?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, darkMode = false }) => {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  // ✅ Safe fallback recipe object
  const safeRecipe = {
    id: recipe.id || '',
    title: recipe.title || 'Untitled Recipe',
    description: recipe.description || 'No description available.',
    category: recipe.category || 'Uncategorized',
    author: recipe.author || 'Anonymous Chef',
    imageUrl:
      recipe.imageUrl && recipe.imageUrl.trim() !== ''
        ? recipe.imageUrl
        : '/assets/placeholder.jpg', // ✅ Use /public/assets path
    reviews: recipe.reviews || [],
  };

  // ✅ Load liked state from localStorage
  useEffect(() => {
    const savedLikes = JSON.parse(localStorage.getItem('likedRecipes') || '{}');
    setLiked(!!savedLikes[safeRecipe.id]);
  }, [safeRecipe.id]);

  const toggleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLiked((prev) => {
      const newState = !prev;
      const savedLikes = JSON.parse(localStorage.getItem('likedRecipes') || '{}');
      savedLikes[safeRecipe.id] = newState;
      localStorage.setItem('likedRecipes', JSON.stringify(savedLikes));
      return newState;
    });
  };

  // ✅ Compute average rating
  const averageRating =
    safeRecipe.reviews.length > 0
      ? (
          safeRecipe.reviews.reduce(
            (sum: number, r: Review) => sum + (r.rating || 0),
            0
          ) / safeRecipe.reviews.length
        ).toFixed(1)
      : null;

  return (
    <Link
      to={`/recipe/${safeRecipe.id}`}
      state={{ recipe: safeRecipe }}
      style={{ textDecoration: 'none', color: 'inherit' }}
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
        {/* ✅ Image Section */}
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
          />

          {/* Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)',
            }}
          ></div>

          {/* Title */}
          <h3
            style={{
              position: 'absolute',
              bottom: 12,
              left: 16,
              color: '#fff',
              margin: 0,
              fontWeight: 700,
              fontSize: '1.4rem',
              textShadow: '0 2px 6px rgba(0,0,0,0.6)',
            }}
          >
            {safeRecipe.title}
          </h3>
        </div>

        {/* ✅ Info Section */}
        <div
          style={{
            padding: '1.2rem 1.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.7rem',
          }}
        >
          <p
            style={{
              fontSize: '0.9rem',
              color: darkMode ? '#f0c6a0' : '#7d5a50',
              fontWeight: 600,
              margin: 0,
            }}
          >
            {safeRecipe.category} • {safeRecipe.author}
          </p>

          <p
            style={{
              fontSize: '0.95rem',
              color: darkMode ? '#ddd' : '#444',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {safeRecipe.description.length > 100
              ? safeRecipe.description.substring(0, 100) + '...'
              : safeRecipe.description}
          </p>

          {/* Rating + Like */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.3rem',
            }}
          >
            {averageRating ? (
              <p
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  color: darkMode ? '#ffd479' : '#e6a157',
                  fontWeight: 600,
                }}
              >
                ⭐ {averageRating}{' '}
                <span style={{ color: darkMode ? '#aaa' : '#888' }}>
                  ({safeRecipe.reviews.length})
                </span>
              </p>
            ) : (
              <p
                style={{
                  margin: 0,
                  color: darkMode ? '#999' : '#bbb',
                  fontSize: '0.9rem',
                }}
              >
                ⭐ No reviews yet
              </p>
            )}

            <button
              onClick={toggleLike}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.6rem',
                transition: 'transform 0.2s ease',
                transform: liked ? 'scale(1.1)' : 'scale(1)',
              }}
              aria-label={liked ? 'Unlike recipe' : 'Like recipe'}
            >
              {liked ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Reviews Section */}
          {safeRecipe.reviews.length > 0 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowReviews((prev) => !prev);
                }}
                style={{
                  marginTop: '0.6rem',
                  background: darkMode ? '#333' : '#fafafa',
                  border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                  padding: '0.4rem 0.8rem',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: darkMode ? '#fff' : '#333',
                  alignSelf: 'flex-start',
                  transition: 'background 0.2s ease',
                }}
              >
                {showReviews ? 'Hide Reviews' : 'Show Reviews'}
              </button>

              {showReviews && (
                <div
                  style={{
                    marginTop: '0.6rem',
                    background: darkMode ? '#2a2a2a' : '#f8f8f8',
                    borderRadius: 8,
                    padding: '0.6rem',
                    maxHeight: 150,
                    overflowY: 'auto',
                  }}
                >
                  {safeRecipe.reviews.map((r: Review, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        borderBottom: `1px solid ${
                          darkMode ? '#444' : '#e0e0e0'
                        }`,
                        paddingBottom: '0.4rem',
                        marginBottom: '0.4rem',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          color: darkMode ? '#f0c6a0' : '#7d5a50',
                        }}
                      >
                        {r.username || 'Anonymous'}
                      </p>
                      <p
                        style={{
                          margin: '0.2rem 0',
                          fontSize: '0.85rem',
                          color: darkMode ? '#ccc' : '#555',
                        }}
                      >
                        ⭐ {r.rating}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          color: darkMode ? '#aaa' : '#666',
                        }}
                      >
                        {r.comment || 'No comment provided.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
