export interface Recipe {
  id: string;
  title: string;
  category: string;
  author: string;
  ingredients: string[];
  steps: string;
  imageUrl?: string;
  description?: string;
  cookingTime?: number;
}

// src/types.ts
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

