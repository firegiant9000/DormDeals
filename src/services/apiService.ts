import { SearchFilters, SearchResponse, Item, User } from '../types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Search and filter items
export const searchItems = async (filters: SearchFilters): Promise<SearchResponse> => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const endpoint = `/items/search?${queryParams.toString()}`;
  return apiRequest<SearchResponse>(endpoint);
};

// Get item by ID
export const getItemById = async (id: string): Promise<Item> => {
  return apiRequest<Item>(`/items/${id}`);
};

// Get user profile
export const getUserProfile = async (): Promise<User> => {
  return apiRequest<User>('/user/profile');
};

// Add item to cart
export const addToCart = async (itemId: string, quantity: number = 1): Promise<void> => {
  return apiRequest<void>('/cart/add', {
    method: 'POST',
    body: JSON.stringify({ itemId, quantity }),
  });
};

// Add item to wishlist
export const addToWishlist = async (itemId: string): Promise<void> => {
  return apiRequest<void>('/wishlist/add', {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  });
};

// Get cart items
export const getCartItems = async (): Promise<any[]> => {
  return apiRequest<any[]>('/cart');
};

// Get wishlist items
export const getWishlistItems = async (): Promise<any[]> => {
  return apiRequest<any[]>('/wishlist');
};

// Create new listing
export const createListing = async (listingData: Partial<Item>): Promise<Item> => {
  return apiRequest<Item>('/items', {
    method: 'POST',
    body: JSON.stringify(listingData),
  });
};

// Get categories
export const getCategories = async (): Promise<string[]> => {
  return apiRequest<string[]>('/items/categories');
};

// Get locations
export const getLocations = async (): Promise<string[]> => {
  return apiRequest<string[]>('/items/locations');
};
