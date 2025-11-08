import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  canAccessFeature,
  isAdmin,
  isPremium,
  canEdit,
  canDelete,
  Feature
} from '../utils/accessControl'

/**
 * Custom hook for access control
 * Provides helper functions to check user permissions based on their type
 * 
 * @returns Object containing access control helper functions
 */
export function useAccessControl() {
  const { user, isAuthenticated } = useAuth()

  const userType = user?.userType

  // Memoize helper functions to avoid recreating them on every render
  const accessControl = useMemo(() => {
    return {
      /**
       * Check if the current user can access a specific feature
       * @param feature - The feature to check access for
       * @returns true if the user can access the feature, false otherwise
       */
      canAccess: (feature: Feature): boolean => {
        return canAccessFeature(userType, feature)
      },

      /**
       * Check if the current user is an admin
       * @returns true if the user is an admin, false otherwise
       */
      isAdmin: (): boolean => {
        return isAdmin(userType)
      },

      /**
       * Check if the current user is premium (or admin)
       * @returns true if the user is premium or admin, false otherwise
       */
      isPremium: (): boolean => {
        return isPremium(userType)
      },

      /**
       * Check if the current user can edit content
       * @returns true if the user can edit, false otherwise
       */
      canEdit: (): boolean => {
        return canEdit(userType)
      },

      /**
       * Check if the current user can delete content
       * @returns true if the user can delete, false otherwise
       */
      canDelete: (): boolean => {
        return canDelete(userType)
      },

      /**
       * Get the current user type
       * @returns The user's type, or undefined if not authenticated
       */
      userType,

      /**
       * Check if the user is authenticated
       * @returns true if the user is authenticated, false otherwise
       */
      isAuthenticated
    }
  }, [userType, isAuthenticated])

  return accessControl
}

