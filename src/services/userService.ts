import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserType, UserProfile, CreateUserProfileData, UpdateUserProfileData } from '../types/user';

const USERS_COLLECTION = 'users';

/**
 * Get user profile from Firestore
 * @param userId - Firebase Auth UID
 * @returns UserProfile or null if not found
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    return {
      id: userDoc.id,
      email: data.email,
      displayName: data.displayName,
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
      totalSales: data.totalSales || 0
    } as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
}

/**
 * Create a new user profile in Firestore
 * @param userId - Firebase Auth UID
 * @param userData - User profile data
 * @returns Created UserProfile
 */
export async function createUserProfile(
  userId: string,
  userData: CreateUserProfileData
): Promise<UserProfile> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    
    // Check if user already exists
    const existingDoc = await getDoc(userDocRef);
    if (existingDoc.exists()) {
      throw new Error('User profile already exists');
    }

    const now = serverTimestamp();
    const profileData = {
      email: userData.email,
      displayName: userData.displayName,
      userType: userData.userType || UserType.REGULAR,
      createdAt: now,
      updatedAt: now,
      phone: userData.phone || null,
      school: userData.school || null,
      major: userData.major || null,
      isVerified: false,
      rating: 0,
      reviewCount: 0,
      totalSales: 0
    };

    await setDoc(userDocRef, profileData);

    // Fetch and return the created profile
    const createdDoc = await getDoc(userDocRef);
    const data = createdDoc.data()!;
    
    return {
      id: userId,
      email: data.email,
      displayName: data.displayName,
      userType: data.userType || UserType.REGULAR,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      phone: data.phone,
      school: data.school,
      major: data.major,
      isVerified: data.isVerified || false,
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
      totalSales: data.totalSales || 0
    } as UserProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create user profile');
  }
}

/**
 * Update user profile in Firestore
 * @param userId - Firebase Auth UID
 * @param userData - Updated user profile data
 * @returns Updated UserProfile
 */
export async function updateUserProfile(
  userId: string,
  userData: UpdateUserProfileData
): Promise<UserProfile> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    
    // Check if user exists
    const existingDoc = await getDoc(userDocRef);
    if (!existingDoc.exists()) {
      throw new Error('User profile not found');
    }

    const updateData: any = {
      updatedAt: serverTimestamp()
    };

    // Only update provided fields
    if (userData.displayName !== undefined) updateData.displayName = userData.displayName;
    if (userData.userType !== undefined) updateData.userType = userData.userType;
    if (userData.phone !== undefined) updateData.phone = userData.phone;
    if (userData.school !== undefined) updateData.school = userData.school;
    if (userData.major !== undefined) updateData.major = userData.major;
    if (userData.profileImage !== undefined) updateData.profileImage = userData.profileImage;
    if (userData.isVerified !== undefined) updateData.isVerified = userData.isVerified;

    await updateDoc(userDocRef, updateData);

    // Fetch and return the updated profile
    const updatedDoc = await getDoc(userDocRef);
    const data = updatedDoc.data()!;
    
    return {
      id: userId,
      email: data.email,
      displayName: data.displayName,
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
      totalSales: data.totalSales || 0
    } as UserProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update user profile');
  }
}

/**
 * Get user profile by email
 * @param email - User email
 * @returns UserProfile or null if not found
 */
export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const data = userDoc.data();
    
    return {
      id: userDoc.id,
      email: data.email,
      displayName: data.displayName,
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
      totalSales: data.totalSales || 0
    } as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile by email:', error);
    throw new Error('Failed to fetch user profile by email');
  }
}

/**
 * Check if user profile exists
 * @param userId - Firebase Auth UID
 * @returns true if profile exists, false otherwise
 */
export async function userProfileExists(userId: string): Promise<boolean> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking user profile existence:', error);
    return false;
  }
}

