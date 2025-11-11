// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// <-- use the config you provided
const firebaseConfig = {
  apiKey: "AIzaSyBb2iqW9mWqIHvGgwJugY-Ko-Ncm9IGXW8",
  authDomain: "tastygram-ad1f4.firebaseapp.com",
  projectId: "tastygram-ad1f4",
  storageBucket: "tastygram-ad1f4.appspot.com", // adjusted to standard bucket name; confirm in console
  messagingSenderId: "906292250511",
  appId: "1:906292250511:web:a5ad72f155dcb6bedb2dfa"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
