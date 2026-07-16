import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2k1iCQ8Z4O1YiHyF04Ec_oyHrTfm9RaQ",
  authDomain: "wellirecord-b977f.firebaseapp.com",
  projectId: "wellirecord-b977f",
  storageBucket: "wellirecord-b977f.firebasestorage.app",
  messagingSenderId: "898120818136",
  appId: "1:898120818136:web:237dcb9165e3c9796266ad",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
