// src/components/RecipeList.tsx

import React from 'react';
import { Recipe } from '../types';

interface RecipeListProps {
  recipes: Recipe[];
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes }) => {
  if (recipes.length === 0) {
    return <p>No recipes found.</p>;
  }

  return (
    <div style={styles.listContainer}>
      {recipes.map((recipe) => (
        <div key={recipe.id} style={styles.card}>
          {recipe.imageUrl && (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              style={styles.image}
              loading="lazy"
            />
          )}
          <h3 style={styles.title}>{recipe.title}</h3>
          <p style={styles.description}>
            <strong>Category:</strong> {recipe.category} <br />
            <strong>Author:</strong> {recipe.author} <br />
            <strong>Ingredients:</strong> {recipe.ingredients.join(', ')} <br />
            <strong>Steps:</strong> {recipe.steps}
          </p>
        </div>
      ))}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  listContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    padding: '10px',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '6px',
    marginBottom: '10px',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '1.2rem',
    color: '#333',
  },
  description: {
    margin: 0,
    fontSize: '1rem',
    color: '#666',
  },
};

export default RecipeList;