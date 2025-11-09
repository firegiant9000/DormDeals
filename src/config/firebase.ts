import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// These values should be set as environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// Validate Firebase configuration (only warn, don't fail build)
// This allows the app to build even if Firebase config is missing
// The app will show warnings but won't crash
const hasRequiredConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

if (!hasRequiredConfig) {
  if (typeof window !== 'undefined') {
    // Only warn in browser console, not during build
    console.warn(
      '⚠️ Firebase configuration is incomplete. Please set the required environment variables:\n' +
      'VITE_FIREBASE_API_KEY\n' +
      'VITE_FIREBASE_AUTH_DOMAIN\n' +
      'VITE_FIREBASE_PROJECT_ID\n' +
      'VITE_FIREBASE_STORAGE_BUCKET\n' +
      'VITE_FIREBASE_MESSAGING_SENDER_ID\n' +
      'VITE_FIREBASE_APP_ID\n\n' +
      'Firebase features will not work until these are configured.'
    );
  }
}

// Initialize Firebase
// If config is missing, Firebase will still initialize but won't work
// This allows the build to succeed even if Firebase env vars aren't set
let app;
try {
  // Only initialize if we have at least the minimum required config
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
  } else {
    // Initialize with empty config to prevent runtime errors
    // This allows the app to build and run, but Firebase features won't work
    app = initializeApp({
      apiKey: 'dummy-key',
      authDomain: 'dummy.firebaseapp.com',
      projectId: 'dummy-project',
      storageBucket: 'dummy-project.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abcdef'
    });
  }
} catch (error) {
  // If initialization fails completely, try with minimal config
  // This should rarely happen, but prevents build failures
  if (typeof window !== 'undefined') {
    console.error('Firebase initialization failed:', error);
  }
  app = initializeApp({
    apiKey: 'dummy-key',
    authDomain: 'dummy.firebaseapp.com',
    projectId: 'dummy-project',
    storageBucket: 'dummy-project.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef'
  });
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

