// src/types.ts

export interface Review {
  username: string;
  rating: number; // e.g., 1-5
  comment: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  category?: string;
  ingredients: string[];
  steps?: string;
  imageUrl?: string;
  author?: string;
  cookingTime?: number;
  reviews?: Review[];
}

// Updated User interface
// src/types.ts
export interface User {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  userType?: string;
  bio?: string;
  name?: string; // make sure this exists
}

