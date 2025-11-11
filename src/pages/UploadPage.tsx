// src/pages/UploadPage.tsx
import React, { useState, useEffect } from 'react';
import { User, Recipe } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import './UploadPage.css';
import { API_BASE_URL } from '../api';

interface UploadPageProps {
  user?: User | null;
  darkMode?: boolean;
  onRecipeSaved?: (recipe: Recipe) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ user, darkMode = false, onRecipeSaved }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Load recipe for editing
  useEffect(() => {
    const state = location.state as { recipe?: Recipe };
    if (state?.recipe) {
      const r = state.recipe;
      setEditingId(r.id || null); // Use `id` instead of `_id`
      setTitle(r.title || '');
      setDescription(r.description || '');
      setCategory(r.category || '');
      setImagePreview(r.imageUrl || null);
      setIngredients(r.ingredients?.join(', ') || '');
      setSteps(r.steps || '');
    }
  }, [location.state]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('You must be logged in to submit a recipe.');

    const recipeData = {
      title,
      description,
      category,
      ingredients: ingredients.split(',').map(i => i.trim()),
      steps,
      author: user.username,
      imageUrl: imagePreview || '',
    };

    try {
      const url = editingId
        ? `${API_BASE_URL}/recipes/${editingId}`
        : `${API_BASE_URL}/recipes`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });

      if (!res.ok) throw new Error(`Failed to ${editingId ? 'update' : 'submit'} recipe`);

      const savedRecipe: Recipe = await res.json();

      alert(`Recipe ${editingId ? 'updated' : 'submitted'} successfully!`);

      if (onRecipeSaved) onRecipeSaved(savedRecipe);

      navigate('/my-recipes');
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving the recipe.');
    }
  };

  if (!user) {
    return (
      <div className={`upload-container ${darkMode ? 'dark-mode' : ''}`}>
        <h1>Please log in to upload a recipe.</h1>
      </div>
    );
  }

  return (
    <div className={`upload-container ${darkMode ? 'dark-mode' : ''}`}>
      <h1 className="upload-title">{editingId ? 'Edit Recipe' : 'Upload a New Recipe'}</h1>
      <form className="upload-form" onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          placeholder="Recipe title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Description</label>
        <textarea
          placeholder="Short description of the recipe"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Select a category</option>
          <option value="African Traditional Food">African Traditional Food</option>
          <option value="Desserts">Desserts</option>
          <option value="Italian">Italian</option>
          <option value="Indian">Indian</option>
          <option value="Mexican">Mexican</option>
          <option value="Other">Other</option>
        </select>

        <label>Upload Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
          </div>
        )}

        <label>Ingredients (comma-separated)</label>
        <input
          type="text"
          placeholder="e.g. rice, tomatoes, onions"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
        />

        <label>Steps</label>
        <textarea
          placeholder="Explain the recipe steps"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          required
        />

        <button type="submit">{editingId ? 'Update Recipe' : 'Submit Recipe'}</button>
      </form>
    </div>
  );
};

export default UploadPage;
