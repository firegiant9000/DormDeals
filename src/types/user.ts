/**
 * User Type Classification
 * Defines the different types of users in the system
 */
export enum UserType {
  ADMIN = 'admin',
  PREMIUM = 'premium',
  REGULAR = 'regular',
  GUEST = 'guest'
}

/**
 * User Profile Interface
 * Extended user profile stored in Firestore
 */
export interface UserProfile {
  id: string; // Firebase Auth UID
  email: string;
  displayName: string;
  userType: UserType;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Optional fields
  phone?: string;
  school?: string;
  major?: string;
  profileImage?: string;
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  totalSales?: number;
}

/**
 * User Profile Creation Data
 * Used when creating a new user profile
 */
export interface CreateUserProfileData {
  email: string;
  displayName: string;
  userType?: UserType; // Defaults to REGULAR if not provided
  phone?: string;
  school?: string;
  major?: string;
}

/**
 * User Profile Update Data
 * Used when updating an existing user profile
 */
export interface UpdateUserProfileData {
  displayName?: string;
  userType?: UserType;
  phone?: string;
  school?: string;
  major?: string;
  profileImage?: string;
  isVerified?: boolean;
}

