import { db } from '@/firebase';
import { collection, doc, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import { normalizeListing } from '@/utils/normalizers';
import { Listing } from '@/types/commerce';

export async function fetchCart(userId: string): Promise<Listing[]> {
  const itemsRef = collection(db, 'users', userId, 'cart');
  const snap = await getDocs(itemsRef);
  const listingIds = snap.docs.map(d => (d.data() as any).listingId || d.id).filter(Boolean);
  if (!listingIds.length) return [];
  const out: Listing[] = [];
  for (const listingId of listingIds) {
    try {
      const listingDoc = await getDoc(doc(db, 'listings', listingId));
      if (listingDoc.exists()) {
        out.push(normalizeListing({ id: listingDoc.id, ...listingDoc.data() } as any));
      }
    } catch (e) {
      // Skip if listing doesn't exist
    }
  }
  return out;
}

export async function removeFromCart(userId: string, listingId: string): Promise<void> {
  const col = collection(db, 'users', userId, 'cart');
  // we stored cart items with docId == listingId (if not, adjust: query then delete)
  await deleteDoc(doc(col, listingId));
}
