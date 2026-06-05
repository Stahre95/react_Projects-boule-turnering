import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAuVwLFbrZVM-ySuy03bgUJbW4IpM8TX-4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "boule-tournament-camping.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "boule-tournament-camping",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "boule-tournament-camping.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "533516181129",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:533516181129:web:7867456acbd53d47303058",
};

console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
});

// Initialize Firebase - prevent multiple initializations
let app;
if (getApps().length === 0) {
  console.log('Initializing Firebase app');
  app = initializeApp(firebaseConfig);
} else {
  console.log('Firebase app already initialized');
  app = getApp();
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
console.log('Initialized auth:', auth);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
console.log('Initialized db:', db);

// Offline persistence is disabled by default to avoid stale cached Firestore state.

console.log('Firestore offline persistence is disabled.');