import { db, auth } from '@/firebase';
import { collection, doc, getDoc, setDoc, deleteDoc, serverTimestamp, query, where, documentId } from 'firebase/firestore';
import { normalizeListing } from '@/utils/helpers';
import { traceQuery } from '@/utils/traceQuery';
import { dlog } from '@/utils/debug';
import type { Listing } from '@/types/commerce';

export async function fetchFavorites(): Promise<Listing[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    dlog('[FAV] no uid');
    return [];
  }
  
  dlog('[FAV PATH]', `users/${uid}/favorites`);
  // favorites are stored at users/{uid}/favorites with docId === listingId
  const favsRef = collection(db, 'users', uid, 'favorites');
  const snap = await traceQuery('FAVORITES', query(favsRef));
  const ids = snap.docs.map((d: any) => d.id);
  if (!ids.length) return [];

  // Batch fetch with 'in' query (max 10 per batch)
  const out: Listing[] = [];
  const chunks = [];
  for (let i = 0; i < ids.length; i += 10) {
    chunks.push(ids.slice(i, i + 10));
  }
  
  for (const chunk of chunks) {
    try {
      const q = query(collection(db, 'listings'), where(documentId(), 'in', chunk));
      const listingSnap = await traceQuery('FAVORITES_LISTINGS', q);
      listingSnap.forEach((doc: any) => {
        out.push(normalizeListing({ id: doc.id, ...doc.data() }));
      });
    } catch (e) {
      // Fallback to individual fetches if 'in' query fails
      for (const listingId of chunk) {
        try {
          const listingDoc = await getDoc(doc(db, 'listings', listingId));
          if (listingDoc.exists()) {
            out.push(normalizeListing({ id: listingDoc.id, ...listingDoc.data() }));
          }
        } catch {
          // Skip if listing doesn't exist
        }
      }
    }
  }
  // newest first
  out.sort((a,b)=>((b.createdAt as any)?.seconds ?? 0) - ((a.createdAt as any)?.seconds ?? 0));
  dlog('[FAVORITES] items', out);
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

