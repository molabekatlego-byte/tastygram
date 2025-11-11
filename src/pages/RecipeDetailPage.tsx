import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Recipe, User } from "../types";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

import spiceImg from "../assets/spice.png";
import leafImg from "../assets/leaf.png";
import forkImg from "../assets/fork.png";

import "./RecipeDetailPage.css";

interface RecipeDetailPageProps {
  recipes: Recipe[];
  darkMode: boolean;
  user?: User | null;
}

interface Review {
  id?: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const RecipeDetailPage: React.FC<RecipeDetailPageProps> = ({
  recipes,
  darkMode,
  user,
}) => {
  const { id } = useParams<{ id: string }>();
  const recipe = recipes.find((r) => r.id === id);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingLikes, setLoadingLikes] = useState(true);

  // fetch reviews
  useEffect(() => {
    if (!recipe?.id) return;

    let mounted = true;
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const reviewsRef = collection(db, "recipes", recipe.id, "reviews");
        const q = query(reviewsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        })) as Review[];
        if (mounted) setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        if (mounted) setLoadingReviews(false);
      }
    };

    fetchReviews();
    return () => {
      mounted = false;
    };
  }, [recipe?.id]);

  // fetch likes count and whether current user liked
  const refreshLikes = useCallback(async () => {
    if (!recipe?.id) return;
    setLoadingLikes(true);
    try {
      const likesRef = collection(db, "recipes", recipe.id, "likes");
      const snapshot = await getDocs(likesRef);
      setLikesCount(snapshot.size);

      if (user?.id) {
        const likeDocRef = doc(db, "recipes", recipe.id, "likes", user.id);
        const likeDoc = await getDoc(likeDocRef);
        setLiked(likeDoc.exists());
      } else {
        setLiked(false);
      }
    } catch (err) {
      console.error("Error fetching likes:", err);
    } finally {
      setLoadingLikes(false);
    }
  }, [recipe?.id, user?.id]);

  useEffect(() => {
    refreshLikes();
  }, [recipe?.id, user?.id, refreshLikes]);

  // local toggle but also update Firestore
  const toggleLike = async () => {
    if (!recipe?.id) return alert("No recipe selected");
    if (!user?.id) return alert("You must be logged in to like recipes.");

    try {
      const likeRef = doc(db, "recipes", recipe.id, "likes", user.id);
      const userLikeRef = doc(db, "users", user.id, "likes", recipe.id);

      const existing = await getDoc(likeRef);
      if (existing.exists()) {
        // remove like
        await deleteDoc(likeRef);
        await deleteDoc(userLikeRef);
        setLiked(false);
        setLikesCount((n) => Math.max(0, n - 1));
      } else {
        // create like document (use serverTimestamp)
        await setDoc(likeRef, {
          userId: user.id,
          username: user.username ?? user.name ?? "",
          createdAt: serverTimestamp(),
        });
        // mirror under user for quick per-user lookup
        await setDoc(userLikeRef, {
          recipeId: recipe.id,
          title: recipe.title ?? "",
          createdAt: serverTimestamp(),
        });
        setLiked(true);
        setLikesCount((n) => n + 1);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      alert("Failed to update like. Try again.");
    }
  };

  // Submit new review
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to leave a review.");
    if (!comment.trim()) return;

    try {
      const reviewsRef = collection(db, "recipes", recipe!.id!, "reviews");
      const newReview = {
        username: user.username || user.name || "Anonymous",
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
        userId: user.id,
      };
      // addDoc will return reference
      const docRef = await addDoc(reviewsRef, newReview);
      // push new review locally (convert createdAt to toDate later if needed)
      setReviews((prev) => [{ id: docRef.id, ...newReview } as any, ...prev]);
      setComment("");
      setRating(5);
    } catch (err) {
      console.error("Error adding review:", err);
      alert("Failed to submit review. Please try again.");
    }
  };

  if (!recipe)
    return (
      <p className={`recipe-not-found ${darkMode ? "dark" : ""}`}>
        Recipe not found
      </p>
    );

  const stepList =
    recipe.steps
      ?.split(/\.|\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0) ?? [];

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <main className={`recipe-page ${darkMode ? "dark" : "light"}`}>
      {/* Floating illustrations */}
      <div className="floating-illustrations" aria-hidden>
        <div className="illust spice" style={{ backgroundImage: `url(${spiceImg})` }} />
        <div className="illust leaf" style={{ backgroundImage: `url(${leafImg})` }} />
        <div className="illust fork" style={{ backgroundImage: `url(${forkImg})` }} />
      </div>

      {/* Hero Banner */}
      <div className="recipe-hero">
        {recipe.imageUrl ? <img src={recipe.imageUrl} alt={recipe.title} /> : <div className="no-image">No image available</div>}
      </div>

      <div className="recipe-page-container">
        {/* Header */}
        <div className="recipe-header-content">
          <p>{recipe.category || "Uncategorized"}</p>
          <h1>{recipe.title}</h1>
        </div>

        {/* Meta */}
        <div className="recipe-meta-bar">
          <span>
            <span className="meta-icon">👤</span>
            By {recipe.author || "Anonymous"}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: darkMode ? "#ffd479" : "#e6a157", fontWeight: 700 }}>
              {loadingLikes ? "…" : `${likesCount} ${likesCount === 1 ? "like" : "likes"}`}
            </div>

            <button onClick={toggleLike} className={`like-button ${liked ? "liked" : ""}`}>
              {liked ? "❤️ Liked" : "🤍 Like"}
            </button>
          </div>
        </div>

        {recipe.description && <p className="recipe-description">{recipe.description}</p>}

        {/* Body */}
        <div className="recipe-body-grid">
          <section className="recipe-section ingredients">
            <h2>Ingredients</h2>
            {recipe.ingredients.length > 0 ? <ul>{recipe.ingredients.map((ing, idx) => <li key={idx}>{ing}</li>)}</ul> : <p>No ingredients listed.</p>}
          </section>

          <section className="recipe-section steps">
            <h2>Steps</h2>
            {stepList.length > 0 ? <ol>{stepList.map((step, idx) => <li key={idx}>{step}</li>)}</ol> : <p>No steps provided.</p>}
          </section>
        </div>

        {/* Reviews Section */}
        <section className="recipe-reviews">
          <h2>
            Reviews {averageRating && <span className="avg-rating">⭐ {averageRating}</span>}
          </h2>

          {loadingReviews ? (
            <p>Loading reviews...</p>
          ) : reviews.length > 0 ? (
            <ul className="reviews-list">
              {reviews.map((rev) => (
                <li key={rev.id ?? `${rev.username}-${rev.createdAt}`} className="review-item">
                  <div className="review-header">
                    <strong>{rev.username}</strong>
                    <span className="review-rating">{"⭐".repeat(rev.rating)}</span>
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                  <span className="review-date">{rev.createdAt ? new Date(rev.createdAt).toLocaleString() : ""}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reviews yet. Be the first to review!</p>
          )}

          {user ? (
            <form onSubmit={submitReview} className="review-form">
              <h3>Leave a Review</h3>
              <div className="form-grid">
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} {"⭐".repeat(r)}
                    </option>
                  ))}
                </select>
              </div>
              <textarea placeholder="Write your review..." value={comment} onChange={(e) => setComment(e.target.value)} required />
              <button type="submit">Submit Review</button>
            </form>
          ) : (
            <p>
              <Link to="/login">Log in</Link> to write a review.
            </p>
          )}
        </section>

        {/* Actions */}
        <div className="recipe-actions">
          <Link to="/recipes" className="action-btn">← Back to Recipes</Link>
          <button onClick={() => window.print()} className="action-btn primary">🖨️ Print Recipe</button>
        </div>
      </div>
    </main>
  );
};

export default RecipeDetailPage;
