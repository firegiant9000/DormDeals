import { db, auth } from '@/firebase';
import { collection, doc, getDocs, getDoc, deleteDoc, setDoc, serverTimestamp, query, where, documentId } from 'firebase/firestore';
import { normalizeListing } from '@/utils/helpers';
import type { Listing } from '@/types/commerce';

export async function fetchCart(): Promise<Listing[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  
  const itemsRef = collection(db, 'users', uid, 'cart');
  const snap = await getDocs(itemsRef);
  const listingIds = snap.docs.map(d => (d.data() as any).listingId || d.id).filter(Boolean);
  if (!listingIds.length) return [];
  
  // Batch fetch with 'in' query (max 10 per batch)
  const out: Listing[] = [];
  const chunks = [];
  for (let i = 0; i < listingIds.length; i += 10) {
    chunks.push(listingIds.slice(i, i + 10));
  }
  
  for (const chunk of chunks) {
    try {
      const q = query(collection(db, 'listings'), where(documentId(), 'in', chunk));
      const listingSnap = await getDocs(q);
      listingSnap.forEach(doc => {
        out.push(normalizeListing({ id: doc.id, ...doc.data() } as any));
      });
    } catch {
      // Fallback to individual fetches if 'in' query fails
      for (const listingId of chunk) {
        try {
          const listingDoc = await getDoc(doc(db, 'listings', listingId));
          if (listingDoc.exists()) {
            out.push(normalizeListing({ id: listingDoc.id, ...listingDoc.data() } as any));
          }
        } catch {
          // Skip if listing doesn't exist
        }
      }
    }
  }
  return out;
}

export async function addToCart(listingId: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  
  await setDoc(doc(db, 'users', uid, 'cart', listingId), {
    listingId,
    addedAt: serverTimestamp()
  });
}

export async function removeFromCart(listingId: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  
  await deleteDoc(doc(db, 'users', uid, 'cart', listingId));
}
