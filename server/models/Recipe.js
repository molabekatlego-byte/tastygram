// server/models/Recipe.js
import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'Uncategorized' },
    imageUrl: { type: String, default: '' },
    author: { type: String, required: true }, // store username or user ID
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;
