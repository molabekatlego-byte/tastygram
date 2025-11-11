import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Recipe } from "../types";

import spiceImg from "../assets/spice.png";
import leafImg from "../assets/leaf.png";
import forkImg from "../assets/fork.png";

import "./RecipeDetailPage.css";

interface RecipeDetailPageProps {
  recipes: Recipe[];
  darkMode: boolean;
}

interface Review {
  username: string;
  rating: number;
  comment: string;
}

const RecipeDetailPage: React.FC<RecipeDetailPageProps> = ({
  recipes,
  darkMode,
}) => {
  const { id } = useParams<{ id: string }>();
  const recipe = recipes.find((r) => r.id === id);

  const [liked, setLiked] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [username, setUsername] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!recipe) return;
    const savedLikes = JSON.parse(
      localStorage.getItem("likedRecipes") || "{}"
    );
    setLiked(!!savedLikes[recipe.id]);

    const savedReviews = JSON.parse(
      localStorage.getItem(`reviews_${recipe.id}`) || "[]"
    );
    setReviews(savedReviews);
  }, [recipe]);

  const toggleLike = () => {
    if (!recipe) return;
    setLiked((prev) => {
      const newState = !prev;
      const savedLikes = JSON.parse(
        localStorage.getItem("likedRecipes") || "{}"
      );
      savedLikes[recipe.id] = newState;
      localStorage.setItem("likedRecipes", JSON.stringify(savedLikes));
      return newState;
    });
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !comment) return;

    const newReview = { username, rating, comment };
    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${recipe?.id}`, JSON.stringify(updatedReviews));

    setUsername("");
    setComment("");
    setRating(5);
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
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
          1
        )
      : null;

  return (
    <main className={`recipe-page ${darkMode ? "dark" : "light"}`}>
      {/* Floating illustrations */}
      <div className="floating-illustrations">
        <div
          className="illust spice"
          style={{ backgroundImage: `url(${spiceImg})` }}
        />
        <div
          className="illust leaf"
          style={{ backgroundImage: `url(${leafImg})` }}
        />
        <div
          className="illust fork"
          style={{ backgroundImage: `url(${forkImg})` }}
        />
      </div>

      {/* Hero Banner (Full Width) */}
      <div className="recipe-hero">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} />
        ) : (
          <div className="no-image">No image available</div>
        )}
      </div>

      {/* Main Content (Contained Width) */}
      <div className="recipe-page-container">
        {/* Header: Title, Category */}
        <div className="recipe-header-content">
          <p>{recipe.category || "Uncategorized"}</p>
          <h1>{recipe.title}</h1>
        </div>

        {/* Meta Bar: Author, Likes */}
        <div className="recipe-meta-bar">
          <span>
            <span className="meta-icon">👤</span>
            By {recipe.author || "Anonymous"}
          </span>
          <button onClick={toggleLike} className={`like-button ${liked ? "liked" : ""}`}>
            {liked ? "❤️ Liked" : "🤍 Like"}
          </button>
        </div>

        {recipe.description && (
          <p className="recipe-description">{recipe.description}</p>
        )}

        {/* Body Grid: Ingredients & Steps */}
        <div className="recipe-body-grid">
          <section className="recipe-section ingredients">
            <h2>Ingredients</h2>
            {recipe.ingredients.length > 0 ? (
              <ul>
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            ) : (
              <p>No ingredients listed.</p>
            )}
          </section>

          <section className="recipe-section steps">
            <h2>Steps</h2>
            {stepList.length > 0 ? (
              <ol>
                {stepList.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            ) : (
              <p>No steps provided.</p>
            )}
          </section>
        </div>

        {/* Reviews */}
        <section className="recipe-reviews">
          <h2>
            Reviews {averageRating && <span className="avg-rating">⭐ {averageRating}</span>}
          </h2>
          {reviews.length > 0 ? (
            <ul className="reviews-list">
              {reviews.map((rev, idx) => (
                <li key={idx} className="review-item">
                  <div className="review-header">
                    <strong>{rev.username}</strong>
                    <span className="review-rating">{"⭐".repeat(rev.rating)}</span>
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reviews yet. Be the first to review!</p>
          )}

          <form onSubmit={submitReview} className="review-form">
            <h3>Leave a Review</h3>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} {"⭐".repeat(r)}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Write your review"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <button type="submit">Submit Review</button>
          </form>
        </section>

        {/* Actions */}
        <div className="recipe-actions">
          <Link to="/recipes" className="action-btn">← Back to Recipes</Link>
          <button onClick={() => window.print()} className="action-btn primary">
            🖨️ Print Recipe
          </button>
        </div>
      </div>
    </main>
  );
};

export default RecipeDetailPage;