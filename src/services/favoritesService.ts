import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Item } from '../types';
import { getListingById } from './listingsService';

const FAVORITES_COLLECTION = 'favorites';

/**
 * Get user's favorites (wishlist)
 */
export async function getFavorites(userId: string): Promise<Item[]> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID');
  }
  
  try {
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const favorites: Item[] = [];

    // Fetch full listing details for each favorite
    for (const favoriteDoc of querySnapshot.docs) {
      const favoriteData = favoriteDoc.data();
      const listingId = favoriteData.listingId;

      if (listingId) {
        try {
          const listing = await getListingById(listingId);
          if (listing) {
            favorites.push(listing);
          }
        } catch (error) {
          console.error(`Error fetching listing ${listingId} for favorites:`, error);
          // Continue with other items
        }
      }
    }

    return favorites;
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    }
    if (error?.code === 'unavailable') {
      throw new Error('Service unavailable. Please check your connection.');
    }
    if (error?.message?.includes('index')) {
      throw new Error('Database index required. Please create the required index in Firebase Console.');
    }
    
    throw new Error(error?.message || 'Failed to fetch favorites');
  }
}

/**
 * Add item to favorites
 */
export async function addToFavorites(userId: string, listingId: string): Promise<void> {
  // Validate inputs
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID');
  }
  if (!listingId || typeof listingId !== 'string') {
    throw new Error('Invalid listing ID');
  }

  try {
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    
    // Check if item already exists in favorites
    const existingQuery = query(
      favoritesRef,
      where('userId', '==', userId),
      where('listingId', '==', listingId)
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      // Already in favorites, no need to add again
      return;
    }

    // Add new favorite
    await addDoc(favoritesRef, {
      userId,
      listingId,
      createdAt: serverTimestamp()
    });
  } catch (error: any) {
    console.error('Error adding to favorites:', error);
    
    // Provide specific error messages
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    }
    if (error?.code === 'unavailable') {
      throw new Error('Service unavailable. Please check your connection.');
    }
    if (error?.message?.includes('index')) {
      throw new Error('Database index required. Please contact support.');
    }
    
    throw new Error(error?.message || 'Failed to add item to favorites');
  }
}

/**
 * Remove item from favorites
 */
export async function removeFromFavorites(userId: string, listingId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID');
  }
  if (!listingId || typeof listingId !== 'string') {
    throw new Error('Invalid listing ID');
  }
  
  try {
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      where('listingId', '==', listingId)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Favorite not found');
    }

    const favoriteDoc = querySnapshot.docs[0];
    await deleteDoc(favoriteDoc.ref);
  } catch (error: any) {
    console.error('Error removing from favorites:', error);
    
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    }
    if (error?.code === 'unavailable') {
      throw new Error('Service unavailable. Please check your connection.');
    }
    
    throw new Error(error?.message || 'Failed to remove item from favorites');
  }
}

/**
 * Check if item is in favorites
 */
export async function isItemInFavorites(userId: string, listingId: string): Promise<boolean> {
  if (!db) {
    return false;
  }
  
  if (!userId || typeof userId !== 'string' || !listingId || typeof listingId !== 'string') {
    return false;
  }
  
  try {
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      where('listingId', '==', listingId)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking favorites:', error);
    return false;
  }
}

