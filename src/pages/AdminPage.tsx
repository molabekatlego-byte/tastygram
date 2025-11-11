// src/pages/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { User, Recipe } from '../types';
import './AdminPage.css';

type Tab = 'users' | 'recipes' | 'reviews' | 'analytics';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  const [users, setUsers] = useState<User[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [reviews, setReviews] = useState<any[]>([]); // reviews will include recipeId

  const [loading, setLoading] = useState(true);

  // Fetch users
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedUsers: User[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setUsers(fetchedUsers);
    });
    return () => unsubscribe();
  }, []);

  // Fetch recipes
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'recipes'), (snapshot) => {
      const fetchedRecipes: Recipe[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setRecipes(fetchedRecipes);
    });
    return () => unsubscribe();
  }, []);

  // Fetch reviews across all recipes
  useEffect(() => {
    const fetchAllReviews = async () => {
      const recipesSnapshot = await getDocs(collection(db, 'recipes'));
      let allReviews: any[] = [];

      for (const recipeDoc of recipesSnapshot.docs) {
        const reviewsCol = collection(db, 'recipes', recipeDoc.id, 'reviews');
        const reviewsSnapshot = await getDocs(reviewsCol);
        const recipeReviews = reviewsSnapshot.docs.map((r) => ({
          ...r.data(),
          id: r.id,
          recipeId: recipeDoc.id,
          recipeTitle: recipeDoc.data().title ?? '',
        }));
        allReviews = [...allReviews, ...recipeReviews];
      }
      setReviews(allReviews);
      setLoading(false);
    };
    fetchAllReviews();
  }, []);

  // Delete handlers
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    await deleteDoc(doc(db, 'users', id));
    alert('User deleted!');
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    await deleteDoc(doc(db, 'recipes', id));
    alert('Recipe deleted!');
  };

  const handleDeleteReview = async (recipeId: string, reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    await deleteDoc(doc(db, 'recipes', recipeId, 'reviews', reviewId));
    alert('Review deleted!');
  };

  // Analytics
  const totalUsers = users.length;
  const totalRecipes = recipes.length;
  const totalReviews = reviews.length;

  return (
    <main className="admin-page">
      <h1 className="page-title">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="tabs">
        {(['users', 'recipes', 'reviews', 'analytics'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'tab active' : 'tab'}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {/* Users */}
        {activeTab === 'users' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Username</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.username || u.name}</td>
                  <td>
                    <button onClick={() => handleDeleteUser(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Recipes */}
        {activeTab === 'recipes' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.title}</td>
                  <td>{r.author}</td>
                  <td>{r.category}</td>
                  <td>
                    <button onClick={() => handleDeleteRecipe(r.id!)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Recipe</th>
                <th>Username</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr key={rev.id}>
                  <td>{rev.id}</td>
                  <td>{rev.recipeTitle}</td>
                  <td>{rev.username}</td>
                  <td>{rev.rating}</td>
                  <td>{rev.comment}</td>
                  <td>
                    <button onClick={() => handleDeleteReview(rev.recipeId, rev.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div className="analytics">
            <h2>Overall Metrics</h2>
            <ul>
              <li>Total Users: {totalUsers}</li>
              <li>Total Recipes: {totalRecipes}</li>
              <li>Total Reviews: {totalReviews}</li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminPage;
