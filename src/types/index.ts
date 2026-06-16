// User and Authentication Types
import { UserType } from './user';

export interface User {
  id: string;
  email: string;
  name: string;
  displayName?: string; // Alias for name, used with Firebase
  userType?: UserType; // User classification: admin, premium, regular, guest
  major?: string;
  profilePicture?: string;
  profileImage?: string;
  phone?: string;
  location?: string;
  school: string;
  joinDate: Date | string;
  joinedDate: string;
  rating: number;
  reviewCount: number;
  totalSales: number;
  isVerified: boolean;
}

// Re-export user types for convenience
export { UserType } from './user';
export type { UserProfile, CreateUserProfileData, UpdateUserProfileData } from './user';

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  category?: ItemCategory;
  priceMin?: number;
  priceMax?: number;
  minPrice?: number;
  maxPrice?: number;
  condition?: ItemCondition;
  location?: string;
  sortBy?: SortOption;
  pickupOnly?: boolean;
  deliveryAvailable?: boolean;
  pickupMethod?: PickupMethod;
}

export interface SearchInput {
  filters: SearchFilters;
  page?: number;
  limit?: number;
}

// Item and Listing Types
export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  condition: ItemCondition;
  category: ItemCategory;
  images: string[];
  seller: User;
  location: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  deliveryFee?: number;
  createdAt: Date;
  updatedAt: Date;
  posted: string;
  status: ListingStatus;
  views: number;
  likes: number;
  isLiked?: boolean;
  isInCart?: boolean;
  isInWishlist?: boolean;
  tags: string[];
  pickupMethod?: PickupMethod;
  isFeatured?: boolean;
}

// `Listing` is NOT an alias here — import it from `@/types/commerce` (the persisted doc).
// `Item` is the canonical UI/view-model type.
export interface ItemDetail extends Item {
  specifications?: Record<string, string>;
  tags: string[];
  availability: string;
  contactInfo: {
    phone?: string;
    email: string;
  };
}

// Cart and Wishlist Types
export interface CartItem {
  id: string;
  listing?: Item;
  item?: Item;
  quantity: number;
  addedAt: Date | string;
}

export interface WishlistItem {
  id: string;
  listing?: Item;
  item?: Item;
  addedAt: Date | string;
}

// Search Results Types
export interface SearchResults {
  listings: Item[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters: SearchFilters;
  suggestions?: string[];
}

export interface SearchResponse {
  items: Item[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Message and Chat Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId?: string;
  itemId?: string;
  content: string;
  message?: string;
  timestamp: Date | string;
  isRead: boolean;
  read?: boolean;
  type: MessageType;
}

export interface Chat {
  id: string;
  participants: User[];
  listing?: Item;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Review and Rating Types
export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  listingId?: string;
  itemId?: string;
  rating: number;
  comment: string;
  createdAt: Date | string;
  timestamp?: string;
  isVerified: boolean;
}

// Order and Transaction Types
export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  deliveryMethod: DeliveryMethod;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
}

export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  status: TransactionStatus;
  paymentMethod: string;
  createdAt: Date;
  completedAt?: Date;
}

// Enums
export enum ItemCategory {
  TEXTBOOKS = 'textbooks',
  ELECTRONICS = 'electronics',
  FURNITURE = 'furniture',
  CLOTHING = 'clothing',
  SPORTS = 'sports',
  BOOKS = 'books',
  SUPPLIES = 'supplies',
  FOOD = 'food',
  SERVICES = 'services',
  APPLIANCES = 'Appliances',
  KITCHEN = 'Kitchen',
  DECOR = 'Decor',
  OTHER = 'other'
}

export enum ItemCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  PENDING = 'pending',
  DRAFT = 'draft',
  EXPIRED = 'expired'
}

export enum PickupMethod {
  PICKUP = 'Pickup Only',
  DELIVERY = 'Delivery Only',
  BOTH = 'Both Available'
}

export enum SortOption {
  RELEVANCE = 'relevance',
  PRICE_LOW_TO_HIGH = 'price_low_to_high',
  PRICE_HIGH_TO_LOW = 'price_high_to_low',
  NEWEST = 'newest',
  OLDEST = 'oldest',
  MOST_VIEWED = 'most_viewed',
  MOST_LIKED = 'most_liked'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  SYSTEM = 'system'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum DeliveryMethod {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
  SHIPPING = 'shipping'
}

// Form Types
export interface CreateListingForm {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  condition: ItemCondition;
  category: ItemCategory;
  images: File[];
  location: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  deliveryFee?: number;
  specifications?: Record<string, string>;
  tags: string[];
}

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

export interface UpdateProfileForm {
  name: string;
  major?: string;
  profilePicture?: File;
  phone?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  relatedId?: string;
}

export enum NotificationType {
  MESSAGE = 'message',
  ORDER_UPDATE = 'order_update',
  LISTING_INTEREST = 'listing_interest',
  REVIEW = 'review',
  SYSTEM = 'system'
}

// Category type for API responses
export interface Category {
  id: string;
  name: string;
  count: number;
}