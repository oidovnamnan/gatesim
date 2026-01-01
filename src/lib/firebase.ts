import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAwNMPl5FROejDL-ibERM757pNSjpzIIqw",
    authDomain: "gatesim.firebaseapp.com",
    projectId: "gatesim",
    storageBucket: "gatesim.firebasestorage.app",
    messagingSenderId: "1029954251264",
    appId: "1:1029954251264:web:fc37c06dedd01d6c1546e5",
    measurementId: "G-7WVEF3MFG3"
};

// Initialize Firebase
// Singleton pattern to avoid re-initialization error in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
