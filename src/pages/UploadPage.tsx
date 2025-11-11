import React, { useState, useEffect } from "react";
import { User, Recipe } from "../types";
import { useNavigate, useLocation } from "react-router-dom";
import "./UploadPage.css";
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

interface UploadPageProps {
  user?: User | null;
  darkMode?: boolean;
  onRecipeSaved?: (recipe: Recipe) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({
  user,
  darkMode = false,
  onRecipeSaved,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Load recipe for editing
  useEffect(() => {
    const state = location.state as { recipe?: Recipe };
    if (state?.recipe) {
      const r = state.recipe;
      setEditingId(r.id || null);
      setTitle(r.title || "");
      setDescription(r.description || "");
      setCategory(r.category || "");
      setImageUrl(r.imageUrl || "");
      setIngredients(r.ingredients?.join(", ") || "");
      setSteps(r.steps || "");
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to submit a recipe.");

    const recipeData: Recipe = {
      id: editingId || "",
      title,
      description,
      category,
      ingredients: ingredients.split(",").map((i) => i.trim()),
      steps,
      imageUrl,
      author: user.username,
    };

    try {
      if (editingId) {
        const recipeRef = doc(db, "recipes", editingId);
        const { id, ...updateData } = recipeData;
        await updateDoc(recipeRef, updateData);
        alert("Recipe updated successfully!");
      } else {
        const docRef = await addDoc(collection(db, "recipes"), recipeData);
        recipeData.id = docRef.id;
        alert("Recipe submitted successfully!");
      }

      if (onRecipeSaved) onRecipeSaved(recipeData);
      navigate("/recipes");
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className={`upload-container ${darkMode ? "dark-mode" : ""}`}>
        <h1>Please log in to upload a recipe.</h1>
      </div>
    );
  }

  return (
    <div className={`upload-container ${darkMode ? "dark-mode" : ""}`}>
      <h1 className="upload-title">
        {editingId ? "Edit Recipe" : "Upload a New Recipe"}
      </h1>
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
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select a category</option>
          <option value="African Traditional Food">
            African Traditional Food
          </option>
          <option value="Desserts">Desserts</option>
          <option value="Italian">Italian</option>
          <option value="Indian">Indian</option>
          <option value="Mexican">Mexican</option>
          <option value="Other">Other</option>
        </select>

        <label>Image URL</label>
        <input
          type="url"
          placeholder="Paste the image link (e.g., https://example.com/image.jpg)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        {imageUrl && (
          <div className="image-preview">
            <img src={imageUrl} alt="Preview" />
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

        <button type="submit">
          {editingId ? "Update Recipe" : "Submit Recipe"}
        </button>
      </form>
    </div>
  );
};

export default UploadPage;
