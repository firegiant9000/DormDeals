import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { normalizeListing } from '@/utils/helpers';
import type { Listing } from '@/types/commerce';
import { Item, ListingStatus } from '@/types';

const storage = getStorage();
const LISTINGS_COLLECTION = 'listings';

export async function createListing(input: {
  title: string; description: string; price: number;
  category: string; condition: string; images: File[];
  isFeatured?: boolean;
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
    imageUrls: uploadedUrls,
    isFeatured: input.isFeatured || false
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

export async function updateListing(listingId: string, input: {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  condition?: string;
  location?: string;
  images?: File[];
  isFeatured?: boolean;
}): Promise<Listing> {
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

  const debug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');
  const updateFields: any = {};

  // Handle image uploads if new images are provided
  if (input.images && input.images.length > 0) {
    const uploadedUrls: string[] = [];
    for (let i = 0; i < input.images.length; i++) {
      const f = input.images[i];
      const path = `listings/${user.uid}/${listingId}/${Date.now()}_${i}_${f.name}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, f, { contentType: f.type || 'application/octet-stream' });
      const url = await getDownloadURL(fileRef);
      uploadedUrls.push(url);
    }
    updateFields.imageUrls = uploadedUrls;
  }

  // Update other fields
  if (input.title !== undefined) updateFields.title = input.title;
  if (input.description !== undefined) updateFields.description = input.description;
  if (input.price !== undefined) updateFields.price = Number(input.price);
  if (input.category !== undefined) updateFields.category = input.category;
  if (input.condition !== undefined) updateFields.condition = input.condition;
  if (input.location !== undefined) updateFields.location = input.location;
  if (input.isFeatured !== undefined) updateFields.isFeatured = input.isFeatured;

  updateFields.updatedAt = serverTimestamp();

  await setDoc(listingRef, updateFields, { merge: true });

  if (debug) {
    console.log('[LISTING] update', { listingId, updateFields });
  }

  const updatedSnap = await getDoc(listingRef);
  if (!updatedSnap.exists()) {
    throw new Error('Listing not found after update');
  }

  return normalizeListing({ id: listingId, ...updatedSnap.data() } as any);
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

// ------------------- READS -------------------

/**
 * Convert Firestore document to Listing/Item format
 */
function firestoreListingToItem(docData: DocumentData, docId: string): Item {
  const data = docData;
  // Support both imageUrls (new schema) and images (old schema)
  const imageArray: string[] =
    Array.isArray(data.imageUrls) && data.imageUrls.length > 0
      ? data.imageUrls
      : Array.isArray(data.images) && data.images.length > 0
        ? data.images
        : [];

  return {
    id: docId,
    title: data.title || '',
    description: data.description || '',
    price: parseFloat(data.price) || 0,
    category: data.category || 'Other',
    condition: data.condition || 'good',
    images: imageArray,
    location: data.location || 'UL Campus',
    seller: {
      id: data.sellerId || data.ownerId || '',
      email: data.sellerEmail || '',
      name: data.sellerName || '',
      school: data.sellerSchool || 'University of Louisiana',
      joinDate: data.sellerJoinDate ? new Date(data.sellerJoinDate.toDate()) : new Date(),
      joinedDate: data.sellerJoinDate ? data.sellerJoinDate.toDate().toISOString() : new Date().toISOString(),
      rating: data.sellerRating || 0,
      reviewCount: data.sellerReviewCount || 0,
      totalSales: data.sellerTotalSales || 0,
      isVerified: data.sellerIsVerified || false
    },
    pickupAvailable: data.pickupAvailable ?? true,
    deliveryAvailable: data.deliveryAvailable ?? false,
    deliveryFee: data.deliveryFee || 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    posted: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
    status: data.isSold ? ListingStatus.SOLD : (data.status === 'active' || data.isActive ? ListingStatus.ACTIVE : ListingStatus.EXPIRED),
    views: data.views || 0,
    likes: data.likes || 0,
    isLiked: false,
    isInCart: false,
    isInWishlist: false,
    tags: data.tags || [],
    isFeatured: data.isFeatured || false
  };
}

/**
 * Get all listings with optional filters
 */
export async function getListings(options: {
  featured?: boolean;
  active?: boolean;
  category?: string;
  ownerId?: string;
  limitCount?: number;
  startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
} = {}): Promise<Item[]> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  try {
    const listingsRef = collection(db, LISTINGS_COLLECTION);
    let q = query(listingsRef);

    // Apply filters
    if (options.featured === true) {
      q = query(q, where('isFeatured', '==', true));
    }
    if (options.active !== undefined) {
      if (options.active) {
        // Query for active listings - try status field first (new listings use this)
        // Note: We'll also filter client-side for listings with isActive === true
        q = query(q, where('status', '==', 'active'));
      } else {
        // For inactive listings
        q = query(q, where('status', '!=', 'active'));
      }
    }
    if (options.category) {
      q = query(q, where('category', '==', options.category));
    }
    if (options.ownerId) {
      q = query(q, where('ownerId', '==', options.ownerId));
    }

    // Order by creation date (newest first)
    q = query(q, orderBy('createdAt', 'desc'));

    // Apply limit
    if (options.limitCount) {
      q = query(q, limit(options.limitCount));
    }

    // Pagination
    if (options.startAfterDoc) {
      q = query(q, startAfter(options.startAfterDoc));
    }

    const querySnapshot = await getDocs(q);
    const listings: Item[] = [];

    querySnapshot.forEach((doc) => {
      const listing = firestoreListingToItem(doc.data(), doc.id);
      listings.push(listing);
    });

    // If querying for active listings, also check for listings with isActive === true
    // (for backward compatibility with old listings)
    if (options.active === true) {
      try {
        let q2 = query(listingsRef, where('isActive', '==', true));
        if (options.featured === true) {
          q2 = query(q2, where('isFeatured', '==', true));
        }
        if (options.category) {
          q2 = query(q2, where('category', '==', options.category));
        }
        if (options.ownerId) {
          q2 = query(q2, where('ownerId', '==', options.ownerId));
        }
        q2 = query(q2, orderBy('createdAt', 'desc'));
        if (options.limitCount) {
          q2 = query(q2, limit(options.limitCount * 2)); // Get more to account for duplicates
        }

        const querySnapshot2 = await getDocs(q2);
        const existingIds = new Set(listings.map(l => l.id));
        querySnapshot2.forEach((doc) => {
          const data = doc.data();
          // Only add if it doesn't already exist and doesn't have status field (old format)
          if (!existingIds.has(doc.id) && !data.status) {
            const listing = firestoreListingToItem(data, doc.id);
            listings.push(listing);
          }
        });
      } catch (err) {
        // If query fails (e.g., missing index), just use the results from status query
        console.warn('Failed to fetch listings with isActive filter:', err);
      }
    }

    return listings;
  } catch (error: any) {
    console.error('Error fetching listings:', error);

    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    }
    if (error?.code === 'unavailable') {
      throw new Error('Service unavailable. Please check your connection.');
    }
    if (error?.message?.includes('index')) {
      throw new Error('Database index required. Please create the required index in Firebase Console.');
    }

    throw new Error(error?.message || 'Failed to fetch listings');
  }
}

/**
 * Get a single listing by ID
 */
export async function getListingById(listingId: string): Promise<Item | null> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  if (!listingId || typeof listingId !== 'string') {
    throw new Error('Invalid listing ID');
  }

  try {
    const listingRef = doc(db, LISTINGS_COLLECTION, listingId);
    const listingSnap = await getDoc(listingRef);

    if (!listingSnap.exists()) {
      return null;
    }

    return firestoreListingToItem(listingSnap.data(), listingSnap.id);
  } catch (error: any) {
    console.error('Error fetching listing:', error);

    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    }
    if (error?.code === 'unavailable') {
      throw new Error('Service unavailable. Please check your connection.');
    }

    throw new Error(error?.message || 'Failed to fetch listing');
  }
}

/**
 * Increment view count for a listing
 */
export async function incrementListingViews(listingId: string): Promise<void> {
  if (!db) {
    // Don't throw - views are not critical
    console.warn('Firestore not initialized, skipping view increment');
    return;
  }

  if (!listingId || typeof listingId !== 'string') {
    return;
  }

  try {
    const listingRef = doc(db, LISTINGS_COLLECTION, listingId);
    const listingSnap = await getDoc(listingRef);

    if (listingSnap.exists()) {
      const currentViews = listingSnap.data().views || 0;
      await updateDoc(listingRef, {
        views: currentViews + 1,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error incrementing views:', error);
    // Don't throw - views are not critical
  }
}
