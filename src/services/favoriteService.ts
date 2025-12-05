import { db } from '@/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { normalizeListing } from '@/utils/normalizers';
import { Listing } from '@/types/commerce';

export async function fetchFavorites(userId: string): Promise<Listing[]> {
  // favorites are stored at users/{uid}/favorites with docId === listingId
  const favsRef = collection(db, 'users', userId, 'favorites');
  const snap = await getDocs(favsRef);
  const ids = snap.docs.map(d => d.id);
  if (!ids.length) return [];

  // Read listings by ids
  const out: Listing[] = [];
  for (const listingId of ids) {
    try {
      const listingDoc = await getDoc(doc(db, 'listings', listingId));
      if (listingDoc.exists()) {
        out.push(normalizeListing({ id: listingDoc.id, ...listingDoc.data() } as any));
      }
    } catch (e) {
      // Skip if listing doesn't exist
    }
  }
  // newest first
  out.sort((a,b)=>((b.createdAt as any)?.seconds ?? 0) - ((a.createdAt as any)?.seconds ?? 0));
  return out;
}

