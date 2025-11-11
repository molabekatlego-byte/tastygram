import React, { useState } from 'react';
import { Recipe } from '../types';

interface Props {
  recipes: Recipe[];
}

const RecipeBook: React.FC<Props> = ({ recipes }) => {
  // Group recipes by category, fallback to 'Uncategorized'
  const grouped = recipes.reduce((acc, recipe) => {
    const category = recipe.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(recipe);
    return acc;
  }, {} as Record<string, Recipe[]>);

  // State for saved bookmarks (by recipe id)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-10">
      {Object.entries(grouped).map(([category, catRecipes]) => (
        <section key={category}>
          <h2 className="text-2xl font-semibold mb-2 flex justify-between items-center">
            {category}
            <span className="text-gray-500 text-sm">
              {catRecipes.length} {catRecipes.length === 1 ? 'recipe' : 'recipes'}
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {catRecipes.map(recipe => (
              <div
                key={recipe.id}
                className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer group"
              >
                <img
                  src={recipe.imageUrl || 'https://via.placeholder.com/150?text=No+Image'}
                  alt={recipe.title}
                  className="w-full h-40 object-cover transition-transform group-hover:scale-105"
                />
                {/* Bookmark icon */}
                <button
                  onClick={() => toggleBookmark(recipe.id)}
                  aria-label="Bookmark recipe"
                  className={`absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition ${
                    bookmarks.has(recipe.id) ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                >
                  {bookmarks.has(recipe.id) ? '★' : '☆'}
                </button>
                <div className="p-2 bg-white">
                  <h3 className="text-sm font-semibold truncate">{recipe.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default RecipeBook;