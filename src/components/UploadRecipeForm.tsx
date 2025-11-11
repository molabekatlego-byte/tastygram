import React, { useState } from 'react';
import { useRecipeContext } from '../context/RecipeContext';
import { Recipe } from '../types';
import { v4 as uuidv4 } from 'uuid';

const categories = ['Italian', 'Indian', 'Chinese', 'Mexican', 'American', 'Other'];

const UploadRecipeForm = () => {
  const { addRecipe, user } = useRecipeContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [author, setAuthor] = useState(user ? user.username : '');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file); // convert to Base64 for preview and storage
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !author || !ingredients || !steps) {
      alert('Please fill in all required fields.');
      return;
    }

    const newRecipe: Recipe = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      category,
      author: author.trim(),
      ingredients: ingredients
        .split(',')
        .map((ing) => ing.trim())
        .filter((ing) => ing.length > 0),
      steps: steps.trim(),
      imageUrl: imagePreview || '', // store the Base64 image
    };

    addRecipe(newRecipe);

    // Reset form
    setTitle('');
    setDescription('');
    setCategory(categories[0]);
    setIngredients('');
    setSteps('');
    setImageFile(null);
    setImagePreview(null);
  };

  if (!user) {
    return <p>Please log in to upload a recipe.</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Upload a New Recipe</h2>

      <label>
        Title:<br />
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={styles.input} />
      </label>

      <label>
        Description:<br />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={2} style={styles.textarea} />
      </label>

      <label>
        Category:<br />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </label>

      <label>
        Ingredients (comma separated):<br />
        <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} required rows={3} style={styles.textarea} />
      </label>

      <label>
        Steps:<br />
        <textarea value={steps} onChange={(e) => setSteps(e.target.value)} required rows={4} style={styles.textarea} />
      </label>

      <label>
        Upload Image:<br />
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </label>

      {imagePreview && (
        <div style={{ margin: '0.5rem 0' }}>
          <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
        </div>
      )}

      <button type="submit" style={styles.button}>Add Recipe</button>
    </form>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  form: { maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { width: '100%', padding: '8px', fontSize: '1rem' },
  select: { width: '100%', padding: '8px', fontSize: '1rem' },
  textarea: { width: '100%', padding: '8px', fontSize: '1rem', resize: 'vertical' },
  button: { padding: '10px', fontSize: '1.1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' },
};

export default UploadRecipeForm;
