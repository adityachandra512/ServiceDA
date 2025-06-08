// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAV0VBmeeSlos3Di1ThUoZexrLbhqdu9p8",
  authDomain: "serviceda-70b75.firebaseapp.com",
  projectId: "serviceda-70b75",
  storageBucket: "serviceda-70b75.firebasestorage.app",
  messagingSenderId: "838359869048",
  appId: "1:838359869048:web:692a65bcf139da45726f8d",
  measurementId: "G-7H6W2NQ5FB"
};

// Check if we have a valid configuration
const isValidConfig = firebaseConfig.apiKey && 
                     !firebaseConfig.apiKey.includes('xxxx') && 
                     !firebaseConfig.projectId.includes('your-project');

if (!isValidConfig) {
  console.error('❌ Firebase configuration is using placeholder values!');
  console.error('Please replace the values in src/firebase/config.js with your actual Firebase project credentials');
  console.error('Get your config from: https://console.firebase.google.com -> Project Settings -> General -> Your apps');
}

// Initialize Firebase App
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
} catch (error) {
  console.error('❌ Firebase app initialization failed:', error);
  throw error;
}

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export the app as default
export default app;

// Debug info for development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.firebaseDebug = {
    app,
    auth,
    db,
    storage,
    config: firebaseConfig,
    isValidConfig
  };
  console.log('🔧 Firebase debug info available at window.firebaseDebug');
}

// Initialize Firebase
const analytics = getAnalytics(app);