import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
};

// Initialize Firebase app once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Read optional storage bucket
const BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = BUCKET ? getStorage(app, BUCKET) : getStorage(app);

// PROD-safe debug log
if (typeof window !== 'undefined') {
  try {
    if (new URLSearchParams(window.location.search).has('debug')) {
      console.log('[FB CONFIG]', {
        projectId: app.options.projectId,
        authDomain: app.options.authDomain,
        storageBucketOption: BUCKET,
        bucketEnv: BUCKET,
        usingBucket: BUCKET || "<default>",
      });
    }
  } catch (e) {
    // Silent fail - never throw
  }
}

export default app;

