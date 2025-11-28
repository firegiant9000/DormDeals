import React from 'react'
import { motion } from 'framer-motion'
import { Lock, Crown, Shield, ArrowUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAccessControl } from '../hooks/useAccessControl'
import { Feature, getRequiredUserType, getFeatureName } from '../utils/accessControl'
import { UserType } from '../types/user'

interface ProtectedFeatureProps {
  /**
   * The feature that requires access
   * Either feature or requiredUserTypes must be provided
   */
  feature?: Feature
  /**
   * The content to show if user has access
   */
  children: React.ReactNode
  /**
   * Custom fallback component to show if user doesn't have access
   * If not provided, a default upgrade prompt will be shown
   */
  fallback?: React.ReactNode
  /**
   * Alternative: specify required user types directly
   * If provided, this takes precedence over the feature prop
   */
  requiredUserTypes?: UserType[]
  /**
   * Custom message to show in the upgrade prompt
   */
  upgradeMessage?: string
  /**
   * Whether to show a link to upgrade (default: true)
   */
  showUpgradeLink?: boolean
}

/**
 * ProtectedFeature component
 * 
 * Conditionally renders children based on user access level.
 * Shows an upgrade prompt if the user doesn't have the required access.
 * 
 * @example
 * ```tsx
 * <ProtectedFeature feature="advanced_analytics">
 *   <AdvancedAnalyticsDashboard />
 * </ProtectedFeature>
 * ```
 * 
 * @example
 * ```tsx
 * <ProtectedFeature 
 *   requiredUserTypes={[UserType.ADMIN]}
 *   fallback={<div>Admin access required</div>}
 * >
 *   <UserManagementPanel />
 * </ProtectedFeature>
 * ```
 */
export const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({
  feature,
  children,
  fallback,
  requiredUserTypes,
  upgradeMessage,
  showUpgradeLink = true
}) => {
  const { canAccess, userType, isAuthenticated } = useAccessControl()

  // Determine if user has access
  let hasAccess = false
  let requiredType: UserType | null = null

  if (requiredUserTypes) {
    // Use provided required user types
    hasAccess = requiredUserTypes.some(type => {
      if (type === UserType.ADMIN) return userType === UserType.ADMIN
      if (type === UserType.PREMIUM) return userType === UserType.PREMIUM || userType === UserType.ADMIN
      if (type === UserType.REGULAR) return userType !== UserType.GUEST && userType !== undefined
      return false
    })
    requiredType = requiredUserTypes[0] || null
  } else if (feature) {
    // Use feature-based access control
    hasAccess = canAccess(feature)
    requiredType = getRequiredUserType(feature)
  } else {
    // Neither feature nor requiredUserTypes provided - default to requiring authentication
    hasAccess = isAuthenticated
    requiredType = UserType.REGULAR
  }

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>
  }

  // Render default upgrade prompt
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dd-card bg-surface border-surface p-8 text-center"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
          {requiredType === UserType.ADMIN ? (
            <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          ) : requiredType === UserType.PREMIUM ? (
            <Crown className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          ) : (
            <Lock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-body">
            {requiredType === UserType.ADMIN
              ? 'Admin Access Required'
              : requiredType === UserType.PREMIUM
              ? 'Premium Feature'
              : !isAuthenticated
              ? 'Sign In Required'
              : 'Upgrade Required'}
          </h3>
          <p className="text-muted max-w-md">
            {upgradeMessage ||
              (requiredType === UserType.ADMIN
                ? 'This feature is only available to administrators.'
                : requiredType === UserType.PREMIUM
                ? feature
                  ? `"${getFeatureName(feature)}" is a premium feature. Upgrade to Premium to unlock this and other exclusive features.`
                  : 'This is a premium feature. Upgrade to Premium to unlock this and other exclusive features.'
                : !isAuthenticated
                ? 'Please sign in to access this feature.'
                : feature
                ? `"${getFeatureName(feature)}" requires a ${requiredType || 'higher'} account.`
                : `This feature requires a ${requiredType || 'higher'} account.`)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Sign In
            </Link>
          ) : requiredType === UserType.PREMIUM && showUpgradeLink ? (
            <>
              <Link
                to="/premium"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                <ArrowUp className="w-4 h-4" />
                Upgrade to Premium
              </Link>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3 border border-surface text-body rounded-lg font-medium hover:bg-surface-2 transition-colors"
              >
                Browse Marketplace
              </Link>
            </>
          ) : requiredType === UserType.ADMIN ? (
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 border border-surface text-body rounded-lg font-medium hover:bg-surface-2 transition-colors"
            >
              Go to Marketplace
            </Link>
          ) : (
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              View Profile
            </Link>
          )}
        </div>

        {/* Premium Features List (if premium feature) */}
        {requiredType === UserType.PREMIUM && (
          <div className="mt-6 pt-6 border-t border-surface text-left w-full max-w-md">
            <p className="text-sm font-medium text-body mb-3">Premium features include:</p>
            <ul className="text-sm text-muted space-y-2">
              <li className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary-600" />
                Advanced Analytics Dashboard
              </li>
              <li className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary-600" />
                Unlimited Listings
              </li>
              <li className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary-600" />
                Featured Listings
              </li>
              <li className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary-600" />
                Priority Support
              </li>
              <li className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary-600" />
                Custom Reports & Data Export
              </li>
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ProtectedFeature

