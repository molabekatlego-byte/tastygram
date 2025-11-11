const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const defaultRecipes = require('./defaultRecipes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/recipesDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Recipe Schema & Model
const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  imageUrl: { type: String },
  ingredients: { type: [String], required: true },
  steps: { type: String, required: true },
  author: { type: String, required: true },
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

// Seed default recipes if DB is empty
const seedDefaultRecipes = async () => {
  try {
    const count = await Recipe.countDocuments();
    if (count === 0) {
      await Recipe.insertMany(defaultRecipes);
      console.log('Default recipes added to DB!');
    }
  } catch (err) {
    console.error('Error seeding default recipes:', err);
  }
};

// Routes
app.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.post('/recipes', async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    const savedRecipe = await newRecipe.save();
    res.json(savedRecipe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save recipe' });
  }
});

app.put('/recipes/:id', async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRecipe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

app.delete('/recipes/:id', async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Start server and seed defaults
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedDefaultRecipes();
});
