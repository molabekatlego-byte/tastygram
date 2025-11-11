import React, { useState, useEffect } from 'react';
import Filter from '../components/Filter';
import RecipeCard from '../components/RecipeCard';
import { Recipe } from '../types';
import './RecipesPage.css';

interface RecipesPageProps {
  recipes: Recipe[];
  searchQuery?: string;
  darkMode?: boolean;
}

const categories = [
  'Breakfast',
  'Italian',
  'Indian',
  'Chinese',
  'Mexican',
  'American',
  'South African',
  'Other',
  'Desserts',
];

const RecipesPage: React.FC<RecipesPageProps> = ({ recipes = [], searchQuery = '', darkMode = false }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [mostLoved, setMostLoved] = useState<Recipe[]>([]);

  // Filter recipes based on category & search
  useEffect(() => {
    let updated = Array.isArray(recipes) ? [...recipes] : [];

    if (selectedCategory) {
      const catLower = selectedCategory.toLowerCase();
      updated = updated.filter((r) => (r.category || '').toLowerCase().includes(catLower));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      updated = updated.filter((r) => (r.title || '').toLowerCase().includes(q));
    }

    setFilteredRecipes(updated);
  }, [selectedCategory, searchQuery, recipes]);

  // Compute Most Loved recipes (based on localStorage likes)
  useEffect(() => {
    let savedLikes: Record<string, any> = {};
    try {
      savedLikes = JSON.parse(localStorage.getItem('likedRecipes') || '{}');
    } catch {
      savedLikes = {};
    }

    const sorted = [...(recipes || [])].sort((a, b) => {
      const likesA = savedLikes[a?.id] ?? 0;
      const likesB = savedLikes[b?.id] ?? 0;
      return likesB - likesA;
    });

    setMostLoved(sorted.slice(0, 4));
  }, [recipes]);

  return (
    <main className={`recipes-page ${darkMode ? 'dark' : 'light'}`}>
      {/* Most Loved Section */}
      <section className="section most-loved">
        <h2 className="recipes-page-title">Most Loved Recipes ❤️</h2>
        <div className="recipes-grid">
          {mostLoved.length > 0 ? (
            mostLoved.map((r) => <RecipeCard key={r.id ?? r.title} recipe={r} darkMode={darkMode} />)
          ) : (
            <p className="no-recipes-message">No loved recipes yet.</p>
          )}
        </div>
      </section>

      {/* Category Filter */}
      <Filter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(c) => setSelectedCategory(c)}
      />

      {/* All Recipes */}
      <section className="section all-recipes">
        <h2 className="recipes-page-title">All Recipes</h2>
        <div className="recipes-grid">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((r) => <RecipeCard key={r.id ?? r.title} recipe={r} darkMode={darkMode} />)
          ) : (
            <p className="no-recipes-message">No recipes found.</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default RecipesPage;
