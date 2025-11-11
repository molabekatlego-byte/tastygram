// server/index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import recipesRouter from './routes/recipes.js'; // Import recipe routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------- MIDDLEWARE -----------------
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// ----------------- MONGODB CONNECTION -----------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// ----------------- ROUTES -----------------
app.use('/api/recipes', recipesRouter); // All recipe routes under /api/recipes

// Test route to check server is running
app.get('/', (req, res) => {
  res.send('Tastygram backend is running!');
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// ----------------- START SERVER -----------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
