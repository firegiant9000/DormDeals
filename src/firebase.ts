import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Read optional storage bucket
const BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;

// Initialize Firebase app once
const app = getApps().length ? getApp() : initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: undefined // do NOT hardcode here; we'll pass to getStorage
});

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = BUCKET ? getStorage(app, BUCKET) : getStorage(app);

// PROD-safe debug log
if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')) {
  console.log('[FB CONFIG]', {
    projectId: app.options.projectId,
    storageBucketOption: app.options.storageBucket,
    bucketEnv: BUCKET,
    usingBucket: BUCKET ?? app.options.storageBucket
  });
}

export default app;

