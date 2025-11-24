import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService, searchItems, getItemById, getUserProfile, addToCart, addToWishlist, getCartItems, getWishlistItems, createListing, getCategories, getLocations } from './apiService';
import { SortOption, DeliveryMethod, ListingStatus, OrderStatus, MessageType } from '../types';
import { mockItems } from '../data/mockData';

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('searchListings', () => {
    it('returns listings on successful search with query', async () => {
      const searchInput = {
        filters: {
          query: 'laptop',
        },
        page: 1,
        limit: 12,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.listings).toBeDefined();
      expect(result.data?.totalCount).toBeGreaterThanOrEqual(0);
      expect(result.data?.currentPage).toBe(1);
    });

    it('filters listings by category', async () => {
      const searchInput = {
        filters: {
          category: 'ELECTRONICS' as any,
        },
        page: 1,
        limit: 12,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      if (result.data?.listings) {
        result.data.listings.forEach(listing => {
          expect(listing.category).toBe('ELECTRONICS');
        });
      }
    });

    it('filters listings by price range', async () => {
      const searchInput = {
        filters: {
          priceMin: 50,
          priceMax: 150,
        },
        page: 1,
        limit: 12,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      if (result.data?.listings) {
        result.data.listings.forEach(listing => {
          expect(listing.price).toBeGreaterThanOrEqual(50);
          expect(listing.price).toBeLessThanOrEqual(150);
        });
      }
    });

    it('filters listings by condition', async () => {
      const searchInput = {
        filters: {
          condition: 'LIKE_NEW' as any,
        },
        page: 1,
        limit: 12,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      if (result.data?.listings) {
        result.data.listings.forEach(listing => {
          expect(listing.condition).toBe('LIKE_NEW');
        });
      }
    });

    it('filters listings by location', async () => {
      const searchInput = {
        filters: {
          location: 'Lafayette',
        },
        page: 1,
        limit: 12,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      if (result.data?.listings) {
        result.data.listings.forEach(listing => {
          expect(listing.location.toLowerCase()).toContain('lafayette');
        });
      }
    });

    it('filters listings by pickup only', async () => {
      const searchInput = {
        filters: {
          pickupOnly: true,
        },
        page: 1,
        limit: 12,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      if (result.data?.listings) {
        result.data.listings.forEach(listing => {
          expect(listing.pickupAvailable).toBe(true);
        });
      }
    });

    it('filters listings by delivery available', async () => {
      const searchInput = {
        filters: {
          deliveryAvailable: true,
        },
        page: 1,
        limit: 12,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      if (result.data?.listings) {
        result.data.listings.forEach(listing => {
          expect(listing.deliveryAvailable).toBe(true);
        });
      }
    });

    it('sorts listings by price low to high', async () => {
      const searchInput = {
        filters: {
          sortBy: SortOption.PRICE_LOW_TO_HIGH,
        },
        page: 1,
        limit: 12,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      if (result.data?.listings && result.data.listings.length > 1) {
        for (let i = 1; i < result.data.listings.length; i++) {
          expect(result.data.listings[i].price).toBeGreaterThanOrEqual(
            result.data.listings[i - 1].price
          );
        }
      }
    });

    it('sorts listings by price high to low', async () => {
      const searchInput = {
        filters: {
          sortBy: SortOption.PRICE_HIGH_TO_LOW,
        },
        page: 1,
        limit: 12,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      if (result.data?.listings && result.data.listings.length > 1) {
        for (let i = 1; i < result.data.listings.length; i++) {
          expect(result.data.listings[i].price).toBeLessThanOrEqual(
            result.data.listings[i - 1].price
          );
        }
      }
    });

    it('sorts listings by newest', async () => {
      const searchInput = {
        filters: {
          sortBy: SortOption.NEWEST,
        },
        page: 1,
        limit: 12,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      if (result.data?.listings && result.data.listings.length > 1) {
        for (let i = 1; i < result.data.listings.length; i++) {
          expect(
            result.data.listings[i].createdAt.getTime()
          ).toBeLessThanOrEqual(
            result.data.listings[i - 1].createdAt.getTime()
          );
        }
      }
    });

    it('sorts listings by most viewed', async () => {
      const searchInput = {
        filters: {
          sortBy: SortOption.MOST_VIEWED,
        },
        page: 1,
        limit: 12,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      if (result.data?.listings && result.data.listings.length > 1) {
        for (let i = 1; i < result.data.listings.length; i++) {
          expect(result.data.listings[i].views).toBeLessThanOrEqual(
            result.data.listings[i - 1].views
          );
        }
      }
    });

    it('handles pagination correctly', async () => {
      const searchInput = {
        filters: {},
        page: 1,
        limit: 5,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      expect(result.data?.listings.length).toBeLessThanOrEqual(5);
      expect(result.data?.currentPage).toBe(1);
      expect(result.data?.hasNextPage).toBeDefined();
      expect(result.data?.hasPreviousPage).toBeDefined();
    });

    it('returns empty results for non-matching query', async () => {
      const searchInput = {
        filters: {
          query: 'nonexistentitem12345',
        },
        page: 1,
        limit: 12,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      expect(result.data?.listings.length).toBe(0);
      expect(result.data?.totalCount).toBe(0);
    });

    it('handles empty filters', async () => {
      const searchInput = {
        filters: {},
        page: 1,
        limit: 12,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('generates search suggestions', async () => {
      const searchInput = {
        filters: {
          query: 'calc',
        },
        page: 1,
        limit: 12,
      };

      const result = await apiService.searchListings(searchInput);

      expect(result.success).toBe(true);
      expect(result.data?.suggestions).toBeDefined();
      expect(Array.isArray(result.data?.suggestions)).toBe(true);
    });
  });

  describe('getListingDetails', () => {
    it('returns listing details for valid ID', async () => {
      const listingId = '1';
      const result = await apiService.getListingDetails(listingId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(listingId);
      expect(result.data?.specifications).toBeDefined();
      expect(result.data?.contactInfo).toBeDefined();
    });

    it('returns error for invalid listing ID', async () => {
      const listingId = 'nonexistent-id-12345';
      const result = await apiService.getListingDetails(listingId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Listing not found');
    });

    it('returns error for null listing ID', async () => {
      const listingId = '';
      const result = await apiService.getListingDetails(listingId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Listing not found');
    });
  });

  describe('getUserProfile', () => {
    it('returns user profile for valid ID', async () => {
      const userId = '1';
      const result = await apiService.getUserProfile(userId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(userId);
    });

    it('returns error for invalid user ID', async () => {
      const userId = 'nonexistent-user-12345';
      const result = await apiService.getUserProfile(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });

  describe('Cart operations', () => {
    it('adds item to cart successfully', async () => {
      const listingId = '1';
      const quantity = 2;
      const result = await apiService.addToCart(listingId, quantity);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.listing?.id).toBe(listingId);
      expect(result.data?.quantity).toBe(quantity);
    });

    it('returns error when adding non-existent listing to cart', async () => {
      const listingId = 'nonexistent-id';
      const result = await apiService.addToCart(listingId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Listing not found');
    });

    it('adds item to cart with default quantity of 1', async () => {
      const listingId = '1';
      const result = await apiService.addToCart(listingId);

      expect(result.success).toBe(true);
      expect(result.data?.quantity).toBe(1);
    });

    it('gets cart items successfully', async () => {
      const result = await apiService.getCartItems();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('removes item from cart successfully', async () => {
      // First add an item
      const addResult = await apiService.addToCart('1');
      expect(addResult.success).toBe(true);
      const cartItemId = addResult.data?.id;

      if (cartItemId) {
        const result = await apiService.removeFromCart(cartItemId);
        expect(result.success).toBe(true);
      }
    });

    it('returns error when removing non-existent cart item', async () => {
      const cartItemId = 'nonexistent-cart-item';
      const result = await apiService.removeFromCart(cartItemId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cart item not found');
    });
  });

  describe('Wishlist operations', () => {
    it('adds item to wishlist successfully', async () => {
      const listingId = '1';
      const result = await apiService.addToWishlist(listingId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.listing?.id).toBe(listingId);
    });

    it('returns error when adding non-existent listing to wishlist', async () => {
      const listingId = 'nonexistent-id';
      const result = await apiService.addToWishlist(listingId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Listing not found');
    });

    it('gets wishlist items successfully', async () => {
      const result = await apiService.getWishlistItems();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('removes item from wishlist successfully', async () => {
      // First add an item
      const addResult = await apiService.addToWishlist('1');
      expect(addResult.success).toBe(true);
      const wishlistItemId = addResult.data?.id;

      if (wishlistItemId) {
        const result = await apiService.removeFromWishlist(wishlistItemId);
        expect(result.success).toBe(true);
      }
    });

    it('returns error when removing non-existent wishlist item', async () => {
      const wishlistItemId = 'nonexistent-wishlist-item';
      const result = await apiService.removeFromWishlist(wishlistItemId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Wishlist item not found');
    });
  });

  describe('createListing', () => {
    it('creates listing successfully', async () => {
      const formData = {
        title: 'Test Listing',
        description: 'Test description',
        price: 100,
        originalPrice: 150,
        condition: 'LIKE_NEW' as any,
        category: 'ELECTRONICS' as any,
        images: [] as File[],
        location: 'Lafayette, LA',
        pickupAvailable: true,
        deliveryAvailable: false,
        deliveryFee: 0,
        tags: ['test'],
      };

      const result = await apiService.createListing(formData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe(formData.title);
      expect(result.data?.price).toBe(formData.price);
      expect(result.data?.status).toBe(ListingStatus.ACTIVE);
    });

    it('creates listing with minimal required fields', async () => {
      const formData = {
        title: 'Minimal Listing',
        description: 'Minimal description',
        price: 50,
        originalPrice: 100,
        condition: 'GOOD' as any,
        category: 'OTHER' as any,
        images: [] as File[],
        location: 'Lafayette, LA',
        pickupAvailable: true,
        deliveryAvailable: false,
        tags: [],
      };

      const result = await apiService.createListing(formData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('getUserListings', () => {
    it('returns user listings for valid user ID', async () => {
      const userId = '1';
      const result = await apiService.getUserListings(userId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      if (result.data) {
        result.data.forEach(listing => {
          expect(listing.seller.id).toBe(userId);
        });
      }
    });

    it('returns empty array for user with no listings', async () => {
      const userId = '999';
      const result = await apiService.getUserListings(userId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Messaging', () => {
    it('gets chats for user', async () => {
      const userId = '1';
      const result = await apiService.getChats(userId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('gets chat messages', async () => {
      const chatId = 'chat-1';
      const result = await apiService.getChatMessages(chatId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('sends message successfully', async () => {
      const senderId = '1';
      const receiverId = '2';
      const content = 'Test message';
      const listingId = '1';

      const result = await apiService.sendMessage(senderId, receiverId, content, listingId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.content).toBe(content);
      expect(result.data?.senderId).toBe(senderId);
      expect(result.data?.receiverId).toBe(receiverId);
      expect(result.data?.type).toBe(MessageType.TEXT);
    });

    it('sends message without listing ID', async () => {
      const senderId = '1';
      const receiverId = '2';
      const content = 'Test message without listing';

      const result = await apiService.sendMessage(senderId, receiverId, content);

      expect(result.success).toBe(true);
      expect(result.data?.content).toBe(content);
    });
  });

  describe('Orders', () => {
    it('creates order successfully', async () => {
      const orderData = {
        buyerId: '1',
        sellerId: '2',
        listingId: '1',
        totalAmount: 100,
        paymentMethod: 'credit_card',
        deliveryMethod: DeliveryMethod.PICKUP,
      };

      const result = await apiService.createOrder(
        orderData.buyerId,
        orderData.sellerId,
        orderData.listingId,
        orderData.totalAmount,
        orderData.paymentMethod,
        orderData.deliveryMethod
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.status).toBe(OrderStatus.PENDING);
      expect(result.data?.totalAmount).toBe(orderData.totalAmount);
    });

    it('gets user orders', async () => {
      const userId = '1';
      const result = await apiService.getUserOrders(userId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Reviews', () => {
    it('gets listing reviews', async () => {
      const listingId = '1';
      const result = await apiService.getListingReviews(listingId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('creates review successfully', async () => {
      const reviewData = {
        reviewerId: '1',
        revieweeId: '2',
        listingId: '1',
        rating: 5,
        comment: 'Great product!',
      };

      const result = await apiService.createReview(
        reviewData.reviewerId,
        reviewData.revieweeId,
        reviewData.listingId,
        reviewData.rating,
        reviewData.comment
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.rating).toBe(reviewData.rating);
      expect(result.data?.comment).toBe(reviewData.comment);
    });
  });

  describe('Notifications', () => {
    it('gets notifications for user', async () => {
      const userId = '1';
      const result = await apiService.getNotifications(userId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('marks notification as read', async () => {
      const notificationId = 'notification-1';
      const result = await apiService.markNotificationAsRead(notificationId);

      expect(result.success).toBe(true);
    });
  });
});

describe('API Functions (fetch-based)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('searchItems', () => {
    it('calls API with correct parameters', async () => {
      const mockResponse = {
        items: mockItems.slice(0, 5),
        totalCount: 5,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const filters = {
        query: 'laptop',
        category: 'ELECTRONICS' as any,
      };

      await searchItems(filters);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/items/search'),
        expect.any(Object)
      );
    });

    it('handles API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      });

      await expect(searchItems({})).rejects.toThrow();
    });

    it('includes auth token in headers when available', async () => {
      localStorageMock.getItem.mockReturnValue('test-token-123');

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await searchItems({});

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
    });
  });

  describe('getItemById', () => {
    it('fetches item by ID', async () => {
      const mockItem = mockItems[0];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem,
      });

      const result = await getItemById('1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/items/1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockItem);
    });

    it('handles 404 errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Item not found' }),
      });

      await expect(getItemById('nonexistent')).rejects.toThrow();
    });
  });

  describe('getUserProfile', () => {
    it('fetches user profile', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await getUserProfile();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/profile'),
        expect.any(Object)
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('addToCart', () => {
    it('adds item to cart via API', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await addToCart('1', 2);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cart/add'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ itemId: '1', quantity: 2 }),
        })
      );
    });

    it('uses default quantity of 1', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await addToCart('1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ itemId: '1', quantity: 1 }),
        })
      );
    });
  });

  describe('addToWishlist', () => {
    it('adds item to wishlist via API', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await addToWishlist('1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/wishlist/add'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ itemId: '1' }),
        })
      );
    });
  });

  describe('getCartItems', () => {
    it('fetches cart items', async () => {
      const mockCartItems = [
        { id: '1', itemId: '1', quantity: 2 },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCartItems,
      });

      const result = await getCartItems();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cart'),
        expect.any(Object)
      );
      expect(result).toEqual(mockCartItems);
    });
  });

  describe('getWishlistItems', () => {
    it('fetches wishlist items', async () => {
      const mockWishlistItems = [
        { id: '1', itemId: '1' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWishlistItems,
      });

      const result = await getWishlistItems();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/wishlist'),
        expect.any(Object)
      );
      expect(result).toEqual(mockWishlistItems);
    });
  });

  describe('createListing', () => {
    it('creates listing via API', async () => {
      const listingData = {
        title: 'Test Listing',
        price: 100,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'new-listing', ...listingData }),
      });

      const result = await createListing(listingData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/items'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(listingData),
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('getCategories', () => {
    it('fetches categories', async () => {
      const mockCategories = ['ELECTRONICS', 'TEXTBOOKS', 'FURNITURE'];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      });

      const result = await getCategories();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/items/categories'),
        expect.any(Object)
      );
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getLocations', () => {
    it('fetches locations', async () => {
      const mockLocations = ['Lafayette, LA', 'Baton Rouge, LA'];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLocations,
      });

      const result = await getLocations();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/items/locations'),
        expect.any(Object)
      );
      expect(result).toEqual(mockLocations);
    });
  });

  describe('Error handling', () => {
    it('handles network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(searchItems({})).rejects.toThrow('Network error');
    });

    it('handles timeout errors', async () => {
      (global.fetch as any).mockImplementationOnce(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
      );

      await expect(searchItems({})).rejects.toThrow();
    });

    it('handles invalid JSON response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(searchItems({})).rejects.toThrow();
    });

    it('handles error response without message', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(searchItems({})).rejects.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('handles empty search results', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [],
          totalCount: 0,
          currentPage: 1,
          totalPages: 0,
        }),
      });

      const result = await searchItems({ query: 'nonexistent' });

      expect(result.items).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('handles null values in filters', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await searchItems({
        query: null as any,
        category: undefined,
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('handles empty string filters', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await searchItems({
        query: '',
        location: '',
      });

      expect(global.fetch).toHaveBeenCalled();
    });
  });
});


