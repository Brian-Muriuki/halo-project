// app/lib/firebase.js - Enhanced configuration
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
let analytics = null;
let messaging = null;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    throw new Error("Firebase initialization failed: " + error.message);
  }
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Only initialize analytics and messaging on client side
if (typeof window !== 'undefined') {
  // Initialize Analytics
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error('Analytics initialization error:', error);
  }
  
  // Initialize Messaging (for notifications)
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Messaging initialization error:', error);
  }
}

export { auth, db, app, analytics, storage, messaging };