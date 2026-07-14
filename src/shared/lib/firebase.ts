import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_FIREBASE_API_KEY : ""),
  authDomain: "wellirecord-b977f.firebaseapp.com",
  projectId: "wellirecord-b977f",
  storageBucket: "wellirecord-b977f.firebasestorage.app",
  messagingSenderId: "898120818136",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_FIREBASE_APP_ID : ""),
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
