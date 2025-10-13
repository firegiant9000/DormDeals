// User types
export interface User {
  id: string;
  email: string;
  name: string;
  major?: string;
  profilePicture?: string;
  school: string;
  createdAt: Date;
}

// Item/Listing types
export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ItemCategory;
  condition: ItemCondition;
  images: string[];
  seller: User;
  location: string;
  pickupMethod: PickupMethod;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ItemCategory {
  FURNITURE = 'furniture',
  ELECTRONICS = 'electronics',
  TEXTBOOKS = 'textbooks',
  CLOTHING = 'clothing',
  KITCHEN = 'kitchen',
  DECOR = 'decor',
  OTHER = 'other'
}

export enum ItemCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

export enum PickupMethod {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
  BOTH = 'both'
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  category?: ItemCategory;
  minPrice?: number;
  maxPrice?: number;
  condition?: ItemCondition;
  pickupMethod?: PickupMethod;
  location?: string;
  sortBy?: SortOption;
}

export enum SortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  PRICE_LOW_TO_HIGH = 'price_low_to_high',
  PRICE_HIGH_TO_LOW = 'price_high_to_low',
  RELEVANCE = 'relevance'
}

// API response types
export interface SearchResponse {
  items: Item[];
  totalCount: number;
  page: number;
  totalPages: number;
}

// Form types
export interface SearchFormData {
  query: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  condition: string;
  pickupMethod: string;
  location: string;
  sortBy: string;
}

// Error types
export interface FormError {
  field: string;
  message: string;
}

// Cart and Wishlist types
export interface CartItem {
  item: Item;
  quantity: number;
  addedAt: Date;
}

export interface WishlistItem {
  item: Item;
  addedAt: Date;
}