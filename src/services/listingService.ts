import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, doc, serverTimestamp, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { normalizeListing } from '@/utils/helpers';
import type { Listing } from '@/types/commerce';

const storage = getStorage();

export async function createListing(input: {
  title: string; description: string; price: number;
  category: string; condition: string; images: File[];
}): Promise<Listing> {
  const user = auth.currentUser;
  if (!user) throw new Error('not-authenticated');

  const debug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');

  // Upload images under listings/<uid>/<listingId>/fileName
  // 1) create doc id first (draft)
  const listRef = doc(collection(db, 'listings'));
  const listingId = listRef.id;

  if (debug) {
    console.log('[LISTING] upload:start', { listingId, imageCount: input.images.length });
  }

  const uploadedUrls: string[] = [];
  for (let i = 0; i < (input.images?.length ?? 0); i++) {
    const f = input.images[i];
    const path = `listings/${user.uid}/${listingId}/${Date.now()}_${i}_${f.name}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, f, { contentType: f.type || 'application/octet-stream' });
    const url = await getDownloadURL(fileRef);
    uploadedUrls.push(url);
    
    if (debug) {
      console.log('[LISTING] upload:file', { index: i, url });
    }
  }

  if (debug) {
    console.log('[LISTING] upload:done', { count: uploadedUrls.length, urls: uploadedUrls });
  }

  const payload = {
    title: input.title,
    description: input.description,
    price: Number(input.price),
    category: input.category,
    condition: input.condition,
    ownerId: user.uid,
    status: 'active' as const,
    createdAt: serverTimestamp(),
    imageUrls: uploadedUrls
  };

  await setDoc(listRef, payload);
  
  if (debug) {
    console.log('[LISTING] write', {
      id: listingId,
      ownerId: user.uid,
      count: uploadedUrls.length,
      firstUrl: uploadedUrls[0] || null
    });
  }

  return normalizeListing({ id: listingId, ...payload, createdAt: null } as any);
}

export async function deleteListing(listingId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('not-authenticated');

  // Verify ownership
  const listingRef = doc(db, 'listings', listingId);
  const listingSnap = await getDoc(listingRef);
  if (!listingSnap.exists()) {
    throw new Error('Listing not found');
  }
  const listingData = listingSnap.data();
  if (listingData.ownerId !== user.uid) {
    throw new Error('permission-denied');
  }

  // Attempt to delete storage folder best-effort (ignore failures)
  try {
    const imageUrls: string[] = listingData.imageUrls || [];
    // Extract paths from download URLs if possible
    await Promise.allSettled(imageUrls.map(async (url) => {
      try {
        // Extract path from downloadURL
        const urlObj = new URL(url);
        const path = decodeURIComponent(urlObj.pathname.split('/o/')[1]?.split('?')[0] || '');
        if (path) {
          const fileRef = ref(storage, path);
          await deleteObject(fileRef);
        }
      } catch {
        // Ignore failures
      }
    }));
  } catch {
    // Ignore storage deletion failures
  }

  await deleteDoc(listingRef);
}
