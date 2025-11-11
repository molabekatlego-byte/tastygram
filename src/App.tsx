// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import WelcomePage from './pages/WelcomePage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import GuestPage from './pages/GuestPage';
import MyRecipesPage from './pages/MyRecipesPage';
import UploadPage from './pages/UploadPage';
import { Recipe, User } from './types';
import AdminPage from './pages/AdminPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';


// firebase imports
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);

  // Auth listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Build a user object that includes required fields (e.g., username)
        const usernameFallback =
          firebaseUser.displayName ??
          (firebaseUser.email ? firebaseUser.email.split('@')[0] : '') ??
          '';

        // If your User interface requires extra fields, add them here.
        // Use the "unknown then User" cast pattern when intentionally coercing.
        setUser(
          ({
            id: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            name: firebaseUser.displayName ?? '',
            username: usernameFallback,
            // add additional properties here if your User type requires them
          } as unknown) as User
        );
      } else {
        setUser(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Firestore: subscribe to "recipes" collection in real time
  useEffect(() => {
    setLoadingRecipes(true);
    const recipesCol = collection(db, 'recipes');
    // If you don't have a 'title' index, remove orderBy or create the index in Firestore
    const q = query(recipesCol, orderBy('title'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs: Recipe[] = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            title: data.title ?? '',
            description: data.description ?? '',
            category: data.category ?? '',
            imageUrl: data.imageUrl ?? '',
            ingredients: data.ingredients ?? [],
            steps: data.steps ?? '',
            author: data.author ?? '',
            // include any extra fields if used elsewhere
          } as Recipe;
        });
        setRecipes(docs);
        setLoadingRecipes(false);
      },
      (error) => {
        console.error('Failed to fetch recipes from Firestore:', error);
        setLoadingRecipes(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className={darkMode ? 'bg-gray-900 min-h-screen text-white' : 'bg-gray-100 min-h-screen text-black'}>
        <Navbar
          onSearch={setSearchQuery}
          user={user}
          setUser={setUser}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <Routes>
          <Route path="/" element={<WelcomePage darkMode={darkMode} />} />
          <Route path="/login" element={<LoginPage setUser={setUser} darkMode={darkMode} />} />
          <Route path="/signup" element={<SignupPage setUser={setUser} darkMode={darkMode} />} />
          <Route path="/guest" element={<GuestPage setUser={setUser} darkMode={darkMode} />} />
          {/* removed 'loading' prop to match RecipesPage's props type */}
          <Route
            path="/recipes"
            element={<RecipesPage recipes={recipes} searchQuery={searchQuery} darkMode={darkMode} user={user} />}
          />
          <Route
            path="/recipe/:id"
            element={<RecipeDetailPage recipes={recipes} user={user} darkMode={darkMode} />}
          />
          <Route path="/upload" element={<UploadPage user={user} darkMode={darkMode} />} />
          <Route path="/my-recipes" element={<MyRecipesPage user={user} darkMode={darkMode} />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute user={user}>
                <AdminPage />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
