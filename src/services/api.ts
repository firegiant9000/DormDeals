import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token')
      toast.error('Session expired. Please login again.')
      // Redirect to login page
      window.location.href = '/login'
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Network error. Please check your connection.')
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const endpoints = {
  // Items/Listings (backend uses /api/listings)
  items: '/listings',
  itemById: (id: string) => `/listings/${id}`,
  userItems: '/listings/user',
  
  // Users
  users: '/users',
  userById: (id: string) => `/users/${id}`,
  userProfile: '/users/profile',
  
  // Categories
  categories: '/categories',
  
  // Messages
  messages: '/messages',
  conversation: (id: string) => `/messages/conversation/${id}`,
  
  // Favorites
  favorites: '/favorites',
  
  // Search
  search: '/search',
} as const

// Generic API functions
export const apiGet = async <T>(url: string): Promise<T> => {
  const response = await api.get<T>(url)
  return response.data
}

export const apiPost = async <T, D = any>(url: string, data?: D): Promise<T> => {
  const response = await api.post<T>(url, data)
  return response.data
}

export const apiPut = async <T, D = any>(url: string, data?: D): Promise<T> => {
  const response = await api.put<T>(url, data)
  return response.data
}

export const apiDelete = async <T>(url: string): Promise<T> => {
  const response = await api.delete<T>(url)
  return response.data
}

export const apiPatch = async <T, D = any>(url: string, data?: D): Promise<T> => {
  const response = await api.patch<T>(url, data)
  return response.data
}

// Specific API functions for items
export const itemApi = {
  getAll: () => apiGet(endpoints.items),
  getById: (id: string) => apiGet(endpoints.itemById(id)),
  getUserItems: () => apiGet(endpoints.userItems),
  create: (data: any) => apiPost(endpoints.items, data),
  update: (id: string, data: any) => apiPut(endpoints.itemById(id), data),
  delete: (id: string) => apiDelete(endpoints.itemById(id)),
  search: (query: string) => apiGet(`${endpoints.search}?q=${encodeURIComponent(query)}`),
}

// Specific API functions for users
export const userApi = {
  getProfile: () => apiGet(endpoints.userProfile),
  updateProfile: (data: any) => apiPut(endpoints.userProfile, data),
  getById: (id: string) => apiGet(endpoints.userById(id)),
  getProfileById: (id: string) => apiGet(`/users/${id}/profile`),
  getListings: (id: string) => apiGet(`/users/${id}/listings`),
  getFavorites: (id: string) => apiGet(`/users/${id}/favorites`),
  getByEmail: (email: string) => apiGet(`/users/email/${encodeURIComponent(email)}`),
  updateProfileById: (id: string, data: any) => apiPut(`/users/${id}/profile`, data),
  // Cart operations
  getCart: (id: string) => apiGet(`/users/${id}/cart`),
  addToCart: (id: string, listingId: string, quantity?: number) => apiPost(`/users/${id}/cart`, { listing_id: listingId, quantity: quantity || 1 }),
  updateCartItem: (id: string, listingId: string, quantity: number) => apiPut(`/users/${id}/cart/${listingId}`, { quantity }),
  removeFromCart: (id: string, listingId: string) => apiDelete(`/users/${id}/cart/${listingId}`),
  // Wishlist/Favorites operations
  addToFavorites: (id: string, listingId: string) => apiPost(`/users/${id}/favorites`, { listing_id: listingId }),
  removeFromFavorites: (id: string, listingId: string) => apiDelete(`/users/${id}/favorites/${listingId}`),
  syncUser: (data: {
    firebaseUid: string
    email: string
    displayName?: string
    firstName?: string
    lastName?: string
    phone?: string
    university?: string
    profileImageUrl?: string
  }) => apiPost('/users/sync', data),
}

// Specific API functions for categories
export const categoryApi = {
  getAll: () => apiGet(endpoints.categories),
}

export default api
