import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Item, ListingStatus } from '../types';

const LISTINGS_COLLECTION = 'listings';

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  sellerId: string;
  images: string[];
  location: string;
  pickupAvailable?: boolean;
  deliveryAvailable?: boolean;
  deliveryFee?: number;
  tags?: string[];
}

export interface UpdateListingData {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  condition?: string;
  images?: string[];
  location?: string;
  isActive?: boolean;
  isSold?: boolean;
  isFeatured?: boolean;
  views?: number;
}

/**
 * Convert Firestore document to Listing/Item format
 */
function firestoreListingToItem(docData: DocumentData, docId: string): Item {
  const data = docData;
  return {
    id: docId,
    title: data.title || '',
    description: data.description || '',
    price: parseFloat(data.price) || 0,
    category: data.category || 'Other',
    condition: data.condition || 'good',
    images: data.images || [],
    location: data.location || 'UL Campus',
    seller: {
      id: data.sellerId || '',
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
    status: data.isSold ? ListingStatus.SOLD : (data.isActive ? ListingStatus.ACTIVE : ListingStatus.EXPIRED),
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
  sellerId?: string;
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
      q = query(q, where('isActive', '==', options.active));
    }
    if (options.category) {
      q = query(q, where('category', '==', options.category));
    }
    if (options.sellerId) {
      q = query(q, where('sellerId', '==', options.sellerId));
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
 * Create a new listing
 */
export async function createListing(listingData: CreateListingData, sellerInfo: {
  email: string;
  name: string;
  school?: string;
  rating?: number;
  reviewCount?: number;
  totalSales?: number;
  isVerified?: boolean;
  joinDate?: Date;
}): Promise<Item> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  // Validate inputs
  if (!listingData.sellerId || typeof listingData.sellerId !== 'string') {
    throw new Error('Invalid seller ID');
  }
  if (!listingData.title || !listingData.title.trim()) {
    throw new Error('Title is required');
  }
  if (!listingData.description || !listingData.description.trim()) {
    throw new Error('Description is required');
  }
  if (!listingData.price || listingData.price <= 0) {
    throw new Error('Price must be greater than 0');
  }
  if (!listingData.category || !listingData.category.trim()) {
    throw new Error('Category is required');
  }
  if (!sellerInfo.email || !sellerInfo.name) {
    throw new Error('Seller information is required');
  }
  
  try {
    const listingsRef = collection(db, LISTINGS_COLLECTION);
    
    const newListing = {
      title: listingData.title,
      description: listingData.description,
      price: listingData.price,
      category: listingData.category,
      condition: listingData.condition,
      sellerId: listingData.sellerId,
      sellerEmail: sellerInfo.email,
      sellerName: sellerInfo.name,
      sellerSchool: sellerInfo.school || 'University of Louisiana',
      sellerRating: sellerInfo.rating || 0,
      sellerReviewCount: sellerInfo.reviewCount || 0,
      sellerTotalSales: sellerInfo.totalSales || 0,
      sellerIsVerified: sellerInfo.isVerified || false,
      sellerJoinDate: sellerInfo.joinDate ? Timestamp.fromDate(sellerInfo.joinDate) : serverTimestamp(),
      images: listingData.images || [],
      location: listingData.location || 'UL Campus',
      pickupAvailable: listingData.pickupAvailable ?? true,
      deliveryAvailable: listingData.deliveryAvailable ?? false,
      deliveryFee: listingData.deliveryFee || 0,
      tags: listingData.tags || [],
      isActive: true,
      isSold: false,
      isFeatured: false,
      views: 0,
      likes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(listingsRef, newListing);
    
    // Fetch the created listing to return
    const createdDoc = await getDoc(docRef);
    if (!createdDoc.exists()) {
      throw new Error('Failed to create listing');
    }

    return firestoreListingToItem(createdDoc.data(), createdDoc.id);
  } catch (error: any) {
    console.error('Error creating listing:', error);
    
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    }
    if (error?.code === 'unavailable') {
      throw new Error('Service unavailable. Please check your connection.');
    }
    if (error?.message?.includes('index')) {
      throw new Error('Database index required. Please create the required index in Firebase Console.');
    }
    
    throw new Error(error?.message || 'Failed to create listing');
  }
}

/**
 * Update a listing
 */
export async function updateListing(listingId: string, updateData: UpdateListingData): Promise<Item> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  if (!listingId || typeof listingId !== 'string') {
    throw new Error('Invalid listing ID');
  }
  
  try {
    const listingRef = doc(db, LISTINGS_COLLECTION, listingId);
    
    const updateFields: any = {
      updatedAt: serverTimestamp()
    };

    if (updateData.title !== undefined) updateFields.title = updateData.title;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.price !== undefined) updateFields.price = updateData.price;
    if (updateData.category !== undefined) updateFields.category = updateData.category;
    if (updateData.condition !== undefined) updateFields.condition = updateData.condition;
    if (updateData.images !== undefined) updateFields.images = updateData.images;
    if (updateData.location !== undefined) updateFields.location = updateData.location;
    if (updateData.isActive !== undefined) updateFields.isActive = updateData.isActive;
    if (updateData.isSold !== undefined) updateFields.isSold = updateData.isSold;
    if (updateData.isFeatured !== undefined) updateFields.isFeatured = updateData.isFeatured;
    if (updateData.views !== undefined) updateFields.views = updateData.views;

    await updateDoc(listingRef, updateFields);

    // Fetch updated listing
    const updatedDoc = await getDoc(listingRef);
    if (!updatedDoc.exists()) {
      throw new Error('Listing not found after update');
    }

    return firestoreListingToItem(updatedDoc.data(), updatedDoc.id);
  } catch (error: any) {
    console.error('Error updating listing:', error);
    
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. You can only update your own listings.');
    }
    if (error?.code === 'unavailable') {
      throw new Error('Service unavailable. Please check your connection.');
    }
    
    throw new Error(error?.message || 'Failed to update listing');
  }
}

/**
 * Delete a listing
 */
export async function deleteListing(listingId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  if (!listingId || typeof listingId !== 'string') {
    throw new Error('Invalid listing ID');
  }
  
  try {
    const listingRef = doc(db, LISTINGS_COLLECTION, listingId);
    await deleteDoc(listingRef);
  } catch (error: any) {
    console.error('Error deleting listing:', error);
    
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. You can only delete your own listings.');
    }
    if (error?.code === 'unavailable') {
      throw new Error('Service unavailable. Please check your connection.');
    }
    
    throw new Error(error?.message || 'Failed to delete listing');
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

/**
 * Search listings by query string
 */
export async function searchListings(searchQuery: string, options: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
  limitCount?: number;
} = {}): Promise<Item[]> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  try {
    // Firestore doesn't support full-text search natively
    // We'll fetch all active listings and filter in memory
    // For production, consider using Algolia or similar
    const listings = await getListings({
      active: true,
      category: options.category,
      limitCount: options.limitCount || 100 // Limit for performance
    });

    const queryLower = searchQuery.toLowerCase();
    
    return listings.filter(listing => {
      // Text search
      const matchesQuery = !searchQuery || 
        listing.title.toLowerCase().includes(queryLower) ||
        listing.description.toLowerCase().includes(queryLower) ||
        listing.category.toLowerCase().includes(queryLower);

      // Price filter
      const matchesPrice = (!options.minPrice || listing.price >= options.minPrice) &&
                          (!options.maxPrice || listing.price <= options.maxPrice);

      // Condition filter
      const matchesCondition = !options.condition || listing.condition === options.condition;

      // Location filter
      const matchesLocation = !options.location || 
        listing.location.toLowerCase().includes(options.location.toLowerCase());

      return matchesQuery && matchesPrice && matchesCondition && matchesLocation;
    });
  } catch (error: any) {
    console.error('Error searching listings:', error);
    
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    }
    if (error?.code === 'unavailable') {
      throw new Error('Service unavailable. Please check your connection.');
    }
    
    throw new Error(error?.message || 'Failed to search listings');
  }
}

