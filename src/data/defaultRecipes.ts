// src/data/defaultRecipes.ts

import { Recipe } from '../types';

// ✅ Import images from assets
import carbonaraImg from '../assets/Spaghetti-carbonara.jpg';
import butterChickenImg from '../assets/Butter-Chicken.jpg';
import sushiImg from '../assets/sushi.jpg';
import tacosImg from '../assets/ttacos.jpg';
import burgerImg from '../assets/burger.jpeg';
import bobotieImg from '../assets/bobotie.jpeg';

export const defaultRecipes: Recipe[] = [
  {
    id: "1",
    title: "Spaghetti Carbonara",
    description: "Classic creamy Italian pasta with pancetta and Parmesan.",
    category: "Italian",
    imageUrl: carbonaraImg,
    author: "Chef Luigi",
    ingredients: ["Spaghetti", "Eggs", "Pancetta", "Parmesan Cheese", "Black Pepper"],
    steps: "Cook spaghetti until al dente. Fry pancetta until crispy. Mix eggs and cheese, then combine everything off heat. Season with pepper.",
  },
  {
    id: "2",
    title: "Butter Chicken",
    description: "Rich and creamy chicken curry with butter and spices.",
    category: "Indian",
    imageUrl: butterChickenImg,
    author: "Chef Priya",
    ingredients: ["Chicken", "Butter", "Tomatoes", "Cream", "Spices"],
    steps: "Marinate chicken. Prepare butter sauce with tomatoes and spices. Cook chicken in sauce until tender. Add cream and simmer.",
  },
  {
    id: "3",
    title: "Sushi Platter",
    description: "Fresh assorted sushi rolls and sashimi.",
    category: "Japanese",
    imageUrl: sushiImg,
    author: "Chef Haruto",
    ingredients: ["Sushi Rice", "Nori", "Fish", "Vegetables", "Soy Sauce", "Wasabi"],
    steps: "Prepare sushi rice. Slice fish and vegetables. Assemble rolls and serve with soy sauce and wasabi.",
  },
  {
    id: "4",
    title: "Tacos al Pastor",
    description: "Tacos with marinated pork, pineapple, and cilantro.",
    category: "Mexican",
    imageUrl: tacosImg,
    author: "Chef Carlos",
    ingredients: ["Pork", "Pineapple", "Tortillas", "Onion", "Cilantro"],
    steps: "Marinate pork. Grill with pineapple. Serve on tortillas with onion and cilantro.",
  },
  {
    id: "5",
    title: "Cheeseburger",
    description: "Juicy beef burger with cheddar cheese and lettuce.",
    category: "American",
    imageUrl: burgerImg,
    author: "Chef John",
    ingredients: ["Beef Patty", "Cheese", "Lettuce", "Tomato", "Burger Bun"],
    steps: "Grill beef patty. Assemble with cheese, lettuce, tomato on bun.",
  },
  {
    id: "6",
    title: "Bobotie",
    description: "Spiced minced meat baked with an egg-based topping.",
    category: "South African",
    imageUrl: bobotieImg,
    author: "Chef Thabo",
    ingredients: ["Minced Meat", "Curry Powder", "Bread", "Milk", "Eggs"],
    steps: "Prepare curried mince. Place in dish. Top with egg mixture and bake until golden.",
  },
];