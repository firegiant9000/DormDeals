import { db, auth } from '@/firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { normalizeListing, Listing } from '@/utils/helpers';

export async function fetchFavorites(): Promise<Listing[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  
  // favorites are stored at users/{uid}/favorites with docId === listingId
  const favsRef = collection(db, 'users', uid, 'favorites');
  const snap = await getDocs(favsRef);
  const ids = snap.docs.map(d => d.id);
  if (!ids.length) return [];

  // Read listings by ids
  const out: Listing[] = [];
  for (const listingId of ids) {
    try {
      const listingDoc = await getDoc(doc(db, 'listings', listingId));
      if (listingDoc.exists()) {
        out.push(normalizeListing(listingDoc.data(), listingDoc.id));
      }
    } catch (e) {
      // Skip if listing doesn't exist
    }
  }
  // newest first
  out.sort((a,b)=>((b.createdAt as any)?.seconds ?? 0) - ((a.createdAt as any)?.seconds ?? 0));
  return out;
}

export async function addFavorite(listingId: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  
  await setDoc(doc(db, 'users', uid, 'favorites', listingId), {
    addedAt: serverTimestamp()
  });
}

export async function removeFavorite(listingId: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  
  await deleteDoc(doc(db, 'users', uid, 'favorites', listingId));
}

