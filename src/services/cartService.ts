import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Item } from '../types';
import { getListingById } from './listingsService';

const CART_COLLECTION = 'cart';

/**
 * Get user's cart items
 */
export async function getCartItems(userId: string): Promise<Item[]> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID');
  }
  
  try {
    const cartRef = collection(db, CART_COLLECTION);
    const q = query(
      cartRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const cartItems: Item[] = [];

    // Fetch full listing details for each cart item
    for (const cartDoc of querySnapshot.docs) {
      const cartData = cartDoc.data();
      const listingId = cartData.listingId;

      if (listingId) {
        try {
          const listing = await getListingById(listingId);
          if (listing) {
            // Add quantity and cart metadata
            const cartItem: Item = {
              ...listing,
              // Store quantity in a custom property if needed
              // For now, we'll use the listing as-is
            };
            cartItems.push(cartItem);
          }
        } catch (error) {
          console.error(`Error fetching listing ${listingId} for cart:`, error);
          // Continue with other items
        }
      }
    }

    return cartItems;
  } catch (error: any) {
    console.error('Error fetching cart items:', error);
    
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    }
    if (error?.code === 'unavailable') {
      throw new Error('Service unavailable. Please check your connection.');
    }
    if (error?.message?.includes('index')) {
      throw new Error('Database index required. Please create the required index in Firebase Console.');
    }
    
    throw new Error(error?.message || 'Failed to fetch cart items');
  }
}

/**
 * Add item to cart
 */
export async function addToCart(userId: string, listingId: string, quantity: number = 1): Promise<void> {
  // Validate inputs
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID');
  }
  if (!listingId || typeof listingId !== 'string') {
    throw new Error('Invalid listing ID');
  }
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  try {
    const cartRef = collection(db, CART_COLLECTION);
    
    // Check if item already exists in cart
    const existingQuery = query(
      cartRef,
      where('userId', '==', userId),
      where('listingId', '==', listingId)
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      // Update quantity if item already exists
      const existingDoc = existingDocs.docs[0];
      const currentQuantity = existingDoc.data().quantity || 1;
      await updateDoc(existingDoc.ref, {
        quantity: currentQuantity + quantity,
        updatedAt: serverTimestamp()
      });
    } else {
      // Add new item to cart
      await addDoc(cartRef, {
        userId,
        listingId,
        quantity,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    
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
    
    throw new Error(error?.message || 'Failed to add item to cart');
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
  userId: string,
  listingId: string,
  quantity: number
): Promise<void> {
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
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await removeFromCart(userId, listingId);
      return;
    }

    const cartRef = collection(db, CART_COLLECTION);
    const q = query(
      cartRef,
      where('userId', '==', userId),
      where('listingId', '==', listingId)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Cart item not found');
    }

    const cartDoc = querySnapshot.docs[0];
    await updateDoc(cartDoc.ref, {
      quantity,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    }
    if (error?.code === 'unavailable') {
      throw new Error('Service unavailable. Please check your connection.');
    }
    
    throw new Error(error?.message || 'Failed to update cart item');
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(userId: string, listingId: string): Promise<void> {
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
    const cartRef = collection(db, CART_COLLECTION);
    const q = query(
      cartRef,
      where('userId', '==', userId),
      where('listingId', '==', listingId)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Cart item not found');
    }

    const cartDoc = querySnapshot.docs[0];
    await deleteDoc(cartDoc.ref);
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    }
    if (error?.code === 'unavailable') {
      throw new Error('Service unavailable. Please check your connection.');
    }
    
    throw new Error(error?.message || 'Failed to remove item from cart');
  }
}

/**
 * Clear user's entire cart
 */
export async function clearCart(userId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID');
  }
  
  try {
    const cartRef = collection(db, CART_COLLECTION);
    const q = query(
      cartRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    
    // Delete all cart items
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    }
    if (error?.code === 'unavailable') {
      throw new Error('Service unavailable. Please check your connection.');
    }
    
    throw new Error(error?.message || 'Failed to clear cart');
  }
}

/**
 * Check if item is in cart
 */
export async function isItemInCart(userId: string, listingId: string): Promise<boolean> {
  if (!db) {
    return false;
  }
  
  if (!userId || typeof userId !== 'string' || !listingId || typeof listingId !== 'string') {
    return false;
  }
  
  try {
    const cartRef = collection(db, CART_COLLECTION);
    const q = query(
      cartRef,
      where('userId', '==', userId),
      where('listingId', '==', listingId)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking cart:', error);
    return false;
  }
}

