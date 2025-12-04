// Re-export Firebase services from config for convenience
// This allows imports like: import { auth, db, storage } from '@/firebase'
export { auth, db, storage } from './config/firebase';
export { default as app } from './config/firebase';

