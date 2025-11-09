import { UserType } from '../types/user'

/**
 * Feature types that can be protected
 */
export type Feature = 
  | 'advanced_analytics'
  | 'user_management'
  | 'create_listing'
  | 'edit_listing'
  | 'delete_listing'
  | 'premium_listings'
  | 'bulk_operations'
  | 'export_data'
  | 'custom_reports'
  | 'priority_support'
  | 'unlimited_listings'
  | 'featured_listings'

/**
 * Access control utility functions
 */

/**
 * Check if a user type can access a specific feature
 * @param userType - The user's type (or undefined for guests)
 * @param feature - The feature to check access for
 * @returns true if the user can access the feature, false otherwise
 */
export function canAccessFeature(
  userType: UserType | undefined,
  feature: Feature
): boolean {
  // If no user type, treat as guest
  const type = userType || UserType.GUEST

  // Admin has access to everything
  if (type === UserType.ADMIN) {
    return true
  }

  // Feature-specific access rules
  switch (feature) {
    // Premium features (admin already handled above)
    case 'advanced_analytics':
    case 'premium_listings':
    case 'bulk_operations':
    case 'export_data':
    case 'custom_reports':
    case 'priority_support':
    case 'unlimited_listings':
    case 'featured_listings':
      return type === UserType.PREMIUM

    // Admin-only features (admin already handled above, so this will never be true)
    case 'user_management':
      return false

    // Regular user features (admin already handled above)
    case 'create_listing':
    case 'edit_listing':
      return type === UserType.REGULAR || type === UserType.PREMIUM

    // Delete requires regular or above (not guest, admin already handled above)
    case 'delete_listing':
      return type === UserType.REGULAR || type === UserType.PREMIUM

    default:
      // By default, only guests are restricted
      return type !== UserType.GUEST
  }
}

/**
 * Check if a user type is an admin
 * @param userType - The user's type (or undefined for guests)
 * @returns true if the user is an admin, false otherwise
 */
export function isAdmin(userType: UserType | undefined): boolean {
  return userType === UserType.ADMIN
}

/**
 * Check if a user type is premium (or admin)
 * @param userType - The user's type (or undefined for guests)
 * @returns true if the user is premium or admin, false otherwise
 */
export function isPremium(userType: UserType | undefined): boolean {
  return userType === UserType.PREMIUM || userType === UserType.ADMIN
}

/**
 * Check if a user type can edit content
 * @param userType - The user's type (or undefined for guests)
 * @returns true if the user can edit, false otherwise
 */
export function canEdit(userType: UserType | undefined): boolean {
  const type = userType || UserType.GUEST
  return type !== UserType.GUEST
}

/**
 * Check if a user type can delete content
 * @param userType - The user's type (or undefined for guests)
 * @returns true if the user can delete, false otherwise
 */
export function canDelete(userType: UserType | undefined): boolean {
  const type = userType || UserType.GUEST
  // Only guests cannot delete
  return type !== UserType.GUEST
}

/**
 * Get the minimum user type required for a feature
 * @param feature - The feature to check
 * @returns The minimum user type required, or null if no access is allowed
 */
export function getRequiredUserType(feature: Feature): UserType | null {
  switch (feature) {
    case 'user_management':
      return UserType.ADMIN

    case 'advanced_analytics':
    case 'premium_listings':
    case 'bulk_operations':
    case 'export_data':
    case 'custom_reports':
    case 'priority_support':
    case 'unlimited_listings':
    case 'featured_listings':
      return UserType.PREMIUM

    case 'create_listing':
    case 'edit_listing':
    case 'delete_listing':
      return UserType.REGULAR

    default:
      return UserType.REGULAR
  }
}

/**
 * Get a user-friendly feature name
 * @param feature - The feature identifier
 * @returns A user-friendly name for the feature
 */
export function getFeatureName(feature: Feature): string {
  const featureNames: Record<Feature, string> = {
    advanced_analytics: 'Advanced Analytics',
    user_management: 'User Management',
    create_listing: 'Create Listing',
    edit_listing: 'Edit Listing',
    delete_listing: 'Delete Listing',
    premium_listings: 'Premium Listings',
    bulk_operations: 'Bulk Operations',
    export_data: 'Export Data',
    custom_reports: 'Custom Reports',
    priority_support: 'Priority Support',
    unlimited_listings: 'Unlimited Listings',
    featured_listings: 'Featured Listings'
  }
  return featureNames[feature] || feature
}

