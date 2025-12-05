import { db, auth } from '@/firebase';
import { collection, doc, getDocs, getDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { normalizeListing, Listing } from '@/utils/helpers';

export async function fetchCart(): Promise<Listing[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  
  const itemsRef = collection(db, 'users', uid, 'cart');
  const snap = await getDocs(itemsRef);
  const listingIds = snap.docs.map(d => (d.data() as any).listingId || d.id).filter(Boolean);
  if (!listingIds.length) return [];
  const out: Listing[] = [];
  for (const listingId of listingIds) {
    try {
      const listingDoc = await getDoc(doc(db, 'listings', listingId));
      if (listingDoc.exists()) {
        out.push(normalizeListing(listingDoc.data(), listingDoc.id));
      }
    } catch (e) {
      // Skip if listing doesn't exist
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
