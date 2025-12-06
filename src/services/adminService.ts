import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserType, UserProfile } from '../types/user';
import { Item } from '../types';
import { getListings } from './listingsService';

const USERS_COLLECTION = 'users';
const LISTINGS_COLLECTION = 'listings';

/**
 * Admin service for platform management
 * These functions should only be called by authenticated admin users
 */

/**
 * Get all users in the system (admin only)
 */
export async function getAllUsers(): Promise<(UserProfile & { isBanned?: boolean; bannedAt?: Date | null })[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const users: (UserProfile & { isBanned?: boolean; bannedAt?: Date | null })[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        email: data.email,
        displayName: data.displayName || 'Unknown',
        userType: data.userType || UserType.REGULAR,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        phone: data.phone,
        school: data.school,
        major: data.major,
        profileImage: data.profileImage,
        isVerified: data.isVerified || false,
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        totalSales: data.totalSales || 0,
        isBanned: data.isBanned || false,
        bannedAt: data.bannedAt?.toDate() || null
      } as UserProfile & { isBanned?: boolean; bannedAt?: Date | null });
    });

    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw new Error('Failed to fetch users');
  }
}

/**
 * Get all listings in the system (admin only)
 */
export async function getAllListings(): Promise<Item[]> {
  try {
    // Use listingsService which handles proper type conversion
    // Passing empty options returns all listings
    return await getListings({});
  } catch (error) {
    console.error('Error fetching all listings:', error);
    throw new Error('Failed to fetch listings');
  }
}

/**
 * Update user type/role (admin only)
 */
export async function updateUserType(userId: string, userType: UserType): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      userType,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user type:', error);
    throw new Error('Failed to update user type');
  }
}

/**
 * Update user verification status (admin only)
 */
export async function updateUserVerification(userId: string, isVerified: boolean): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      isVerified,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user verification:', error);
    throw new Error('Failed to update user verification');
  }
}

/**
 * Ban or unban a user (admin only)
 */
export async function updateUserBanStatus(userId: string, isBanned: boolean): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      isBanned,
      bannedAt: isBanned ? serverTimestamp() : null,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user ban status:', error);
    throw new Error('Failed to update user ban status');
  }
}

/**
 * Delete listing (admin override - can delete any listing)
 */
export async function adminDeleteListing(listingId: string): Promise<void> {
  try {
    const listingRef = doc(db, LISTINGS_COLLECTION, listingId);
    await deleteDoc(listingRef);
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw new Error('Failed to delete listing');
  }
}

/**
 * Update listing status (admin override)
 */
export async function adminUpdateListingStatus(listingId: string, status: 'active' | 'sold' | 'inactive'): Promise<void> {
  try {
    const listingRef = doc(db, LISTINGS_COLLECTION, listingId);
    const updateData: any = {
      updatedAt: serverTimestamp()
    };

    if (status === 'sold') {
      updateData.status = 'sold';
      updateData.isSold = true;
      updateData.isActive = false;
    } else if (status === 'active') {
      updateData.status = 'active';
      updateData.isSold = false;
      updateData.isActive = true;
    } else {
      updateData.status = 'inactive';
      updateData.isActive = false;
    }

    await updateDoc(listingRef, updateData);
  } catch (error) {
    console.error('Error updating listing status:', error);
    throw new Error('Failed to update listing status');
  }
}

/**
 * Get platform statistics (admin only)
 */
export interface PlatformStats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalRevenue: number;
  averageListingPrice: number;
  usersByType: {
    admin: number;
    premium: number;
    regular: number;
  };
  listingsByCategory: Record<string, number>;
  recentUsers: number; // Users joined in last 30 days
  recentListings: number; // Listings created in last 30 days
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const [users, listings] = await Promise.all([
      getAllUsers(),
      getAllListings()
    ]);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate statistics
    const activeListings = listings.filter(l => l.status === 'active' || (l as any).isActive).length;
    const soldListings = listings.filter(l => l.status === 'sold' || (l as any).isSold).length;
    
    const totalRevenue = listings
      .filter(l => l.status === 'sold' || (l as any).isSold)
      .reduce((sum, l) => sum + (l.price || 0), 0);

    const averageListingPrice = listings.length > 0
      ? listings.reduce((sum, l) => sum + (l.price || 0), 0) / listings.length
      : 0;

    const usersByType = {
      admin: users.filter(u => u.userType === UserType.ADMIN).length,
      premium: users.filter(u => u.userType === UserType.PREMIUM).length,
      regular: users.filter(u => u.userType === UserType.REGULAR).length
    };

    const listingsByCategory: Record<string, number> = {};
    listings.forEach(listing => {
      const category = listing.category || 'Other';
      listingsByCategory[category] = (listingsByCategory[category] || 0) + 1;
    });

    const recentUsers = users.filter(u => {
      const createdAt = u.createdAt instanceof Date ? u.createdAt : new Date(u.createdAt);
      return createdAt >= thirtyDaysAgo;
    }).length;

    const recentListings = listings.filter(l => {
      const createdAt = l.createdAt instanceof Date ? l.createdAt : new Date(l.createdAt);
      return createdAt >= thirtyDaysAgo;
    }).length;

    return {
      totalUsers: users.length,
      totalListings: listings.length,
      activeListings,
      soldListings,
      totalRevenue,
      averageListingPrice,
      usersByType,
      listingsByCategory,
      recentUsers,
      recentListings
    };
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    throw new Error('Failed to fetch platform statistics');
  }
}

