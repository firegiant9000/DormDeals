import { 
  SearchInput, 
  SearchResults, 
  Listing, 
  ItemDetail, 
  User, 
  CartItem, 
  WishlistItem, 
  Message, 
  Chat, 
  Review, 
  Order,
  ApiResponse,
  CreateListingForm,
  Notification,
  SortOption,
  ListingStatus,
  OrderStatus,
  DeliveryMethod,
  MessageType,
  SearchFilters,
  SearchResponse,
  Item
} from '../types';
import { demoData } from '../data/demoData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Base API configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
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

// API Service Class
class ApiService {
  private defaultDelay = 2000; // 2 seconds

  // Search and Browse Listings
  async searchListings(searchInput: SearchInput): Promise<ApiResponse<SearchResults>> {
    try {
      await delay(this.defaultDelay);
      
      const { filters, page = 1, limit = 12 } = searchInput;
      let filteredListings = [...demoData.listings];

      // Apply filters
      if (filters.query) {
        const query = filters.query.toLowerCase();
        filteredListings = filteredListings.filter(listing => 
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.category.toLowerCase().includes(query)
        );
      }

      if (filters.category) {
        filteredListings = filteredListings.filter(listing => 
          listing.category === filters.category
        );
      }

      if (filters.priceMin !== undefined) {
        filteredListings = filteredListings.filter(listing => 
          listing.price >= filters.priceMin!
        );
      }

      if (filters.priceMax !== undefined) {
        filteredListings = filteredListings.filter(listing => 
          listing.price <= filters.priceMax!
        );
      }

      if (filters.condition) {
        filteredListings = filteredListings.filter(listing => 
          listing.condition === filters.condition
        );
      }

      if (filters.location) {
        filteredListings = filteredListings.filter(listing => 
          listing.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters.pickupOnly) {
        filteredListings = filteredListings.filter(listing => 
          listing.pickupAvailable
        );
      }

      if (filters.deliveryAvailable) {
        filteredListings = filteredListings.filter(listing => 
          listing.deliveryAvailable
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case SortOption.PRICE_LOW_TO_HIGH:
            filteredListings.sort((a, b) => a.price - b.price);
            break;
          case SortOption.PRICE_HIGH_TO_LOW:
            filteredListings.sort((a, b) => b.price - a.price);
            break;
          case SortOption.NEWEST:
            filteredListings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            break;
          case SortOption.OLDEST:
            filteredListings.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            break;
          case SortOption.MOST_VIEWED:
            filteredListings.sort((a, b) => b.views - a.views);
            break;
          case SortOption.MOST_LIKED:
            filteredListings.sort((a, b) => b.likes - a.likes);
            break;
          default:
            // Default to relevance (no additional sorting)
            break;
        }
      }

      // Pagination
      const totalCount = filteredListings.length;
      const totalPages = Math.ceil(totalCount / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedListings = filteredListings.slice(startIndex, endIndex);

      // Generate search suggestions
      const suggestions = this.generateSearchSuggestions(filters.query || '');

      const results: SearchResults = {
        listings: paginatedListings,
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        filters,
        suggestions
      };

      return {
        success: true,
        data: results
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search listings'
      };
    }
  }

  // Get listing details
  async getListingDetails(listingId: string): Promise<ApiResponse<ItemDetail>> {
    try {
      await delay(this.defaultDelay);
      
      const listing = demoData.listings.find(l => l.id === listingId);
      if (!listing) {
        return {
          success: false,
          error: 'Listing not found'
        };
      }

      const itemDetail: ItemDetail = {
        ...listing,
        specifications: {
          'Brand': 'Various',
          'Model': 'Various',
          'Year': '2023-2024',
          'Condition': listing.condition,
          'Location': listing.location
        },
        tags: ['student', 'college', 'dorm', listing.category],
        availability: 'Available now',
        contactInfo: {
          email: listing.seller.email,
          phone: '+1 (555) 123-4567'
        }
      };

      return {
        success: true,
        data: itemDetail
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get listing details'
      };
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    try {
      await delay(this.defaultDelay);
      
      const user = demoData.users.find(u => u.id === userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get user profile'
      };
    }
  }

  // Cart operations
  async addToCart(listingId: string, quantity: number = 1): Promise<ApiResponse<CartItem>> {
    try {
      await delay(this.defaultDelay);
      
      const listing = demoData.listings.find(l => l.id === listingId);
      if (!listing) {
        return {
          success: false,
          error: 'Listing not found'
        };
      }

      const cartItem: CartItem = {
        id: `cart-${Date.now()}`,
        listing,
        quantity,
        addedAt: new Date()
      };

      // In a real app, this would be stored in the backend
      demoData.cartItems.push(cartItem);

      return {
        success: true,
        data: cartItem
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to add item to cart'
      };
    }
  }

  async getCartItems(): Promise<ApiResponse<CartItem[]>> {
    try {
      await delay(this.defaultDelay);
      
      return {
        success: true,
        data: demoData.cartItems
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get cart items'
      };
    }
  }

  async removeFromCart(cartItemId: string): Promise<ApiResponse<void>> {
    try {
      await delay(this.defaultDelay);
      
      const index = demoData.cartItems.findIndex(item => item.id === cartItemId);
      if (index === -1) {
        return {
          success: false,
          error: 'Cart item not found'
        };
      }

      demoData.cartItems.splice(index, 1);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to remove item from cart'
      };
    }
  }

  // Wishlist operations
  async addToWishlist(listingId: string): Promise<ApiResponse<WishlistItem>> {
    try {
      await delay(this.defaultDelay);
      
      const listing = demoData.listings.find(l => l.id === listingId);
      if (!listing) {
        return {
          success: false,
          error: 'Listing not found'
        };
      }

      const wishlistItem: WishlistItem = {
        id: `wishlist-${Date.now()}`,
        listing,
        addedAt: new Date()
      };

      demoData.wishlistItems.push(wishlistItem);

      return {
        success: true,
        data: wishlistItem
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to add item to wishlist'
      };
    }
  }

  async getWishlistItems(): Promise<ApiResponse<WishlistItem[]>> {
    try {
      await delay(this.defaultDelay);
      
      return {
        success: true,
        data: demoData.wishlistItems
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get wishlist items'
      };
    }
  }

  async removeFromWishlist(wishlistItemId: string): Promise<ApiResponse<void>> {
    try {
      await delay(this.defaultDelay);
      
      const index = demoData.wishlistItems.findIndex(item => item.id === wishlistItemId);
      if (index === -1) {
        return {
          success: false,
          error: 'Wishlist item not found'
        };
      }

      demoData.wishlistItems.splice(index, 1);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to remove item from wishlist'
      };
    }
  }

  // Create listing
  async createListing(formData: CreateListingForm): Promise<ApiResponse<Listing>> {
    try {
      await delay(this.defaultDelay);
      
      // Simulate creating a new listing
      const newListing: Listing = {
        id: `listing-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        originalPrice: formData.originalPrice,
        condition: formData.condition,
        category: formData.category,
        images: [], // In real app, would upload images first
        seller: demoData.users[0], // Current user
        location: formData.location,
        pickupAvailable: formData.pickupAvailable,
        deliveryAvailable: formData.deliveryAvailable,
        deliveryFee: formData.deliveryFee,
        createdAt: new Date(),
        updatedAt: new Date(),
        posted: new Date().toISOString(),
        status: ListingStatus.ACTIVE,
        views: 0,
        likes: 0,
        isLiked: false,
        isInCart: false,
        isInWishlist: false,
        tags: formData.tags || []
      };

      demoData.listings.unshift(newListing);

      return {
        success: true,
        data: newListing
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create listing'
      };
    }
  }

  // Get user's listings
  async getUserListings(userId: string): Promise<ApiResponse<Listing[]>> {
    try {
      await delay(this.defaultDelay);
      
      const userListings = demoData.listings.filter(listing => 
        listing.seller.id === userId
      );

      return {
        success: true,
        data: userListings
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get user listings'
      };
    }
  }

  // Messaging
  async getChats(userId: string): Promise<ApiResponse<Chat[]>> {
    try {
      await delay(this.defaultDelay);
      
      const userChats = demoData.chats.filter(chat => 
        chat.participants.some(participant => participant.id === userId)
      );

      return {
        success: true,
        data: userChats
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get chats'
      };
    }
  }

  async getChatMessages(chatId: string): Promise<ApiResponse<Message[]>> {
    try {
      await delay(this.defaultDelay);
      
      const chatMessages = demoData.messages.filter(message => 
        message.senderId === chatId || message.receiverId === chatId
      );

      return {
        success: true,
        data: chatMessages
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get chat messages'
      };
    }
  }

  async sendMessage(
    senderId: string, 
    receiverId: string, 
    content: string, 
    listingId?: string
  ): Promise<ApiResponse<Message>> {
    try {
      await delay(this.defaultDelay);
      
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId,
        receiverId,
        listingId,
        content,
        timestamp: new Date(),
        isRead: false,
        type: MessageType.TEXT
      };

      demoData.messages.push(newMessage);

      return {
        success: true,
        data: newMessage
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to send message'
      };
    }
  }

  // Orders and transactions
  async createOrder(
    buyerId: string,
    sellerId: string,
    listingId: string,
    totalAmount: number,
    paymentMethod: string,
    deliveryMethod: DeliveryMethod
  ): Promise<ApiResponse<Order>> {
    try {
      await delay(this.defaultDelay);
      
      const newOrder: Order = {
        id: `order-${Date.now()}`,
        buyerId,
        sellerId,
        listingId,
        totalAmount,
        status: OrderStatus.PENDING,
        paymentMethod,
        deliveryMethod,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      demoData.orders.push(newOrder);

      return {
        success: true,
        data: newOrder
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create order'
      };
    }
  }

  async getUserOrders(userId: string): Promise<ApiResponse<Order[]>> {
    try {
      await delay(this.defaultDelay);
      
      const userOrders = demoData.orders.filter(order => 
        order.buyerId === userId || order.sellerId === userId
      );

      return {
        success: true,
        data: userOrders
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get user orders'
      };
    }
  }

  // Reviews
  async getListingReviews(listingId: string): Promise<ApiResponse<Review[]>> {
    try {
      await delay(this.defaultDelay);
      
      const listingReviews = demoData.reviews.filter(review => 
        review.listingId === listingId
      );

      return {
        success: true,
        data: listingReviews
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get listing reviews'
      };
    }
  }

  async createReview(
    reviewerId: string,
    revieweeId: string,
    listingId: string,
    rating: number,
    comment: string
  ): Promise<ApiResponse<Review>> {
    try {
      await delay(this.defaultDelay);
      
      const newReview: Review = {
        id: `review-${Date.now()}`,
        reviewerId,
        revieweeId,
        listingId,
        rating,
        comment,
        createdAt: new Date(),
        isVerified: true
      };

      demoData.reviews.push(newReview);

      return {
        success: true,
        data: newReview
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create review'
      };
    }
  }

  // Notifications
  async getNotifications(userId: string): Promise<ApiResponse<Notification[]>> {
    try {
      await delay(this.defaultDelay);
      
      const userNotifications = demoData.notifications.filter(notification => 
        notification.userId === userId
      );

      return {
        success: true,
        data: userNotifications
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get notifications'
      };
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    try {
      await delay(this.defaultDelay);
      
      const notification = demoData.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to mark notification as read'
      };
    }
  }

  // Helper methods
  private generateSearchSuggestions(query: string): string[] {
    if (!query || query.length < 2) {
      return [];
    }

    const suggestions = [
      'textbooks',
      'laptop',
      'calculator',
      'desk chair',
      'coffee maker',
      'basketball',
      'psychology',
      'calculus',
      'macbook',
      'nike shoes'
    ];

    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  }

}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export individual functions for simpler usage
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

export default apiService;