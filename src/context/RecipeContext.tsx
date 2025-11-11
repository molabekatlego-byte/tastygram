// src/context/RecipeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Recipe, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface RecipeContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // <-- added
  login: (username: string, password: string) => boolean;
  signup: (username: string, password: string) => void;
  logout: () => void;
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
}

// Extend User type locally to include password for demo purposes
interface UserWithPassword extends User {
  password: string;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<UserWithPassword[]>([]);

  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: 'r1',
      title: 'Spaghetti Bolognese',
      description: 'Classic Italian pasta with rich meat sauce',
      category: 'Italian',
      author: 'Chef John',
      ingredients: ['Pasta', 'Beef', 'Tomato Sauce'],
      steps: 'Cook pasta. Prepare sauce. Mix together.',
      imageUrl: 'https://source.unsplash.com/featured/?pasta',
    },
    {
      id: 'r2',
      title: 'Chicken Curry',
      description: 'Spicy and creamy Indian chicken curry',
      category: 'Indian',
      author: 'Chef Anjali',
      ingredients: ['Chicken', 'Curry spices', 'Coconut milk'],
      steps: 'Cook chicken. Add spices and coconut milk. Simmer.',
      imageUrl: 'https://source.unsplash.com/featured/?curry',
    },
  ]);

  // Signup new user
  const signup = (username: string, password: string) => {
    const existing = registeredUsers.find((u) => u.username === username);
    if (existing) {
      alert('Username already exists');
      return;
    }

    const newUser: UserWithPassword = {
      id: uuidv4(),
      username,
      password,
    };
    setRegisteredUsers((prev) => [...prev, newUser]);
    setUser(newUser);
  };

  // Login existing user
  const login = (username: string, password: string) => {
    const existingUser = registeredUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (existingUser) {
      setUser(existingUser);
      return true;
    }
    return false;
  };

  // Logout user
  const logout = () => {
    setUser(null);
  };

  // Add a recipe and associate with current user
  const addRecipe = (recipe: Recipe) => {
    if (!user) return; // only logged-in users can upload

    const newRecipe: Recipe = {
      ...recipe,
      id: uuidv4(),
      author: user.username,
    };

    setRecipes((prev) => [...prev, newRecipe]);
  };

  return (
    <RecipeContext.Provider
      value={{ user, setUser, login, signup, logout, recipes, addRecipe }}
    >
      {children}
    </RecipeContext.Provider>
  );
};

// Custom hook for consuming context
export const useRecipeContext = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipeContext must be used within a RecipeProvider');
  }
  return context;
};
