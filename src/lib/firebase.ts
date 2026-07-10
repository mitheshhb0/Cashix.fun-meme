import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Validate that env vars are present — logs a warning in production if missing
const requiredVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

if (typeof window !== "undefined") {
  const missing = requiredVars.filter(
    (key) => !process.env[key] || process.env[key]?.startsWith("AIzaSyFake")
  );
  if (missing.length > 0) {
    console.warn(
      "[Firebase] Missing or fake environment variables:",
      missing,
      "\nSet these in your deployment platform (Vercel/Netlify env settings) or .env.local for local dev."
    );
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC9YaqRM0z0w6-3Rr4AmdWuQRKcsflghHg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "cashix-fun-38012.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "cashix-fun-38012",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "cashix-fun-38012.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "686526131303",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:686526131303:web:bccb20e9d1551ef850f8c2",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Request profile + email scopes explicitly (needed for some OAuth flows)
googleProvider.addScope("profile");
googleProvider.addScope("email");

export { app, auth, googleProvider };
