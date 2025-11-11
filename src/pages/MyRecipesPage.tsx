import React, { useEffect, useState } from 'react';
import { Recipe, User } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import './MyRecipesPage.css';

interface MyRecipesPageProps {
  user?: User | null;
  darkMode?: boolean;
}

const MyRecipesPage: React.FC<MyRecipesPageProps> = ({ user, darkMode = false }) => {
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const recipesRef = collection(db, 'recipes');
        const q = query(recipesRef, where('author', '==', user.username));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Recipe[];
        setMyRecipes(data);
      } catch (err) {
        console.error('Error fetching recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [user]);

  const handleDelete = async (recipeId: string) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      await deleteDoc(doc(db, 'recipes', recipeId));
      setMyRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      alert('Recipe deleted successfully.');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  const handleEdit = (recipe: Recipe) => {
    navigate('/upload', { state: { recipe } });
  };

  if (!user) {
    return (
      <main className={`my-recipes-page ${darkMode ? 'dark-mode' : ''}`}>
        <p>
          Please <Link to="/login">log in</Link> to view your recipes.
        </p>
      </main>
    );
  }

  return (
    <main className={`my-recipes-page ${darkMode ? 'dark-mode' : ''}`}>
      <h1 className="my-recipes-title">{user.username}'s Uploaded Recipes</h1>

      {loading ? (
        <p className="loading-text">Loading your recipes...</p>
      ) : myRecipes.length === 0 ? (
        <p className="no-recipes-msg">
          You haven't uploaded any recipes yet. <Link to="/upload">Upload one now!</Link>
        </p>
      ) : (
        <div className="recipes-grid">
          {myRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className={`recipe-card-modern ${darkMode ? 'dark' : ''}`}
            >
              <div className="recipe-card-img-container">
                <img
                  src={
                    recipe.imageUrl?.trim()
                      ? recipe.imageUrl
                      : '/assets/placeholder.jpg'
                  }
                  alt={recipe.title}
                  className="recipe-card-img"
                  loading="lazy"
                />
                <div className="recipe-card-overlay">
                  <h2>{recipe.title}</h2>
                </div>
              </div>

              <div className="recipe-card-content">
                <p className="recipe-meta">
                  {recipe.category || 'Uncategorized'} • {recipe.author}
                </p>
                <p className="recipe-desc">
                  {(recipe.description ?? '').length > 100
                    ? (recipe.description ?? '').substring(0, 100) + '...'
                    : recipe.description}
                </p>

                <div className="recipe-card-actions">
                  <Link to={`/recipe/${recipe.id}`} className="recipe-view-btn">
                    View
                  </Link>
                  <button
                    className="recipe-edit-btn"
                    onClick={() => handleEdit(recipe)}
                  >
                    Edit
                  </button>
                  <button
                    className="recipe-delete-btn"
                    onClick={() => handleDelete(recipe.id!)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyRecipesPage;
