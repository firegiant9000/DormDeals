import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
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
// Firebase Auth uses LOCAL persistence by default, which stores sessions in localStorage/indexedDB
// This means users will stay logged in after page refresh
// Explicitly set persistence to LOCAL to ensure sessions persist across page refreshes
// This must be done before any auth operations
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error);
  });
}
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

