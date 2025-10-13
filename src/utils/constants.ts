// App Constants
export const APP_NAME = 'DormDeals'
export const APP_VERSION = '1.0.0'

// API Configuration
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'

// Categories
export const CATEGORIES = [
  'Electronics',
  'Books',
  'Appliances',
  'Furniture',
  'Clothing',
  'Sports & Recreation',
  'Other'
] as const

// Item Conditions
export const CONDITIONS = [
  'New',
  'Like New',
  'Good',
  'Fair',
  'Poor'
] as const

// University Information
export const UNIVERSITY = {
  name: 'University of Louisiana',
  abbreviation: 'UL',
  location: 'Lafayette, LA'
}

// Pagination
export const ITEMS_PER_PAGE = 12
export const MAX_IMAGES_PER_LISTING = 5

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    LISTING_CREATED: 'Listing created successfully!',
    LISTING_UPDATED: 'Listing updated successfully!',
    LISTING_DELETED: 'Listing deleted successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!'
  },
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You must be logged in to perform this action.',
    VALIDATION: 'Please check your input and try again.'
  }
} as const
