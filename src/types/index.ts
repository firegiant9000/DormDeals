// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  joinedDate: string;
  rating: number;
  totalSales: number;
  profileImage?: string;
  isVerified: boolean;
}

// Item types
export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ItemCategory;
  condition: ItemCondition;
  images: string[];
  seller: User;
  posted: string;
  views: number;
  status: ItemStatus;
  tags: string[];
  location: string;
  pickupMethod?: PickupMethod;
}

// Enums
export enum ItemCategory {
  ELECTRONICS = 'Electronics',
  BOOKS = 'Books',
  TEXTBOOKS = 'Textbooks',
  APPLIANCES = 'Appliances',
  FURNITURE = 'Furniture',
  CLOTHING = 'Clothing',
  KITCHEN = 'Kitchen',
  DECOR = 'Decor',
  SPORTS = 'Sports & Recreation',
  OTHER = 'Other'
}

export enum ItemCondition {
  NEW = 'New',
  LIKE_NEW = 'Like New',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor'
}

export enum ItemStatus {
  ACTIVE = 'Active',
  SOLD = 'Sold',
  PENDING = 'Pending',
  DRAFT = 'Draft'
}

export enum PickupMethod {
  PICKUP = 'Pickup Only',
  DELIVERY = 'Delivery Only',
  BOTH = 'Both Available'
}

export enum SortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  PRICE_LOW_TO_HIGH = 'price_low_to_high',
  PRICE_HIGH_TO_LOW = 'price_high_to_low',
  RELEVANCE = 'relevance'
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
  sortBy: SortOption;
}

export interface FormError {
  field: string;
  message: string;
}

// API types
export interface SearchFilters {
  query?: string;
  category?: ItemCategory;
  minPrice?: number;
  maxPrice?: number;
  condition?: ItemCondition;
  pickupMethod?: PickupMethod;
  location?: string;
  sortBy: SortOption;
}

export interface SearchResponse {
  items: Item[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Cart and Wishlist types
export interface CartItem {
  id: string;
  item: Item;
  quantity: number;
  addedAt: string;
}

export interface WishlistItem {
  id: string;
  item: Item;
  addedAt: string;
}

// Message types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  itemId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Review types
export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  itemId: string;
  rating: number;
  comment: string;
  timestamp: string;
}

// Category type for API responses
export interface Category {
  id: string;
  name: string;
  count: number;
}
