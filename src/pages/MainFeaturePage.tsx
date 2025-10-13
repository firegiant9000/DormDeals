import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  MessageCircle, 
  Star, 
  Plus,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  SearchInput, 
  SearchResults, 
  Listing, 
  CartItem, 
  WishlistItem,
  ItemCategory,
  ItemCondition,
  SortOption
} from '../types';
import { apiService } from '../services/apiService';

const MainFeaturePage = () => {
  // State management
  const [searchInput, setSearchInput] = useState<SearchInput>({
    filters: {
      query: '',
      category: undefined,
      priceMin: undefined,
      priceMax: undefined,
      condition: undefined,
      location: '',
      sortBy: SortOption.RELEVANCE,
      pickupOnly: false,
      deliveryAvailable: false
    },
    page: 1,
    limit: 12
  });

  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  // Load initial data
  useEffect(() => {
    loadListings();
    loadCartItems();
    loadWishlistItems();
  }, []);

  // Load listings
  const loadListings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.searchListings(searchInput);
      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        setError(response.error || 'Failed to load listings');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load cart items
  const loadCartItems = async () => {
    try {
      const response = await apiService.getCartItems();
      if (response.success && response.data) {
        setCartItems(response.data);
      }
    } catch (err) {
      console.error('Failed to load cart items:', err);
    }
  };

  // Load wishlist items
  const loadWishlistItems = async () => {
    try {
      const response = await apiService.getWishlistItems();
      if (response.success && response.data) {
        setWishlistItems(response.data);
      }
    } catch (err) {
      console.error('Failed to load wishlist items:', err);
    }
  };

  // Handle search input change
  const handleSearchChange = (field: string, value: any) => {
    setSearchInput(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [field]: value
      }
    }));
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadListings();
  };

  // Add to cart
  const handleAddToCart = async (listing: Listing) => {
    try {
      const response = await apiService.addToCart(listing.id);
      if (response.success) {
        await loadCartItems();
        // Update the listing's cart status
        if (searchResults) {
          setSearchResults({
            ...searchResults,
            listings: searchResults.listings.map(l => 
              l.id === listing.id ? { ...l, isInCart: true } : l
            )
          });
        }
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  // Add to wishlist
  const handleAddToWishlist = async (listing: Listing) => {
    try {
      const response = await apiService.addToWishlist(listing.id);
      if (response.success) {
        await loadWishlistItems();
        // Update the listing's wishlist status
        if (searchResults) {
          setSearchResults({
            ...searchResults,
            listings: searchResults.listings.map(l => 
              l.id === listing.id ? { ...l, isInWishlist: true } : l
            )
          });
        }
      }
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
    }
  };

  // Remove from cart
  const handleRemoveFromCart = async (cartItemId: string) => {
    try {
      const response = await apiService.removeFromCart(cartItemId);
      if (response.success) {
        await loadCartItems();
      }
    } catch (err) {
      console.error('Failed to remove from cart:', err);
    }
  };

  // Remove from wishlist
  const handleRemoveFromWishlist = async (wishlistItemId: string) => {
    try {
      const response = await apiService.removeFromWishlist(wishlistItemId);
      if (response.success) {
        await loadWishlistItems();
      }
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Cart and Wishlist Buttons */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-xl font-bold text-primary-600">
                DormDeals
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Cart Button */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => setShowWishlist(!showWishlist)}
                className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <Heart className="w-6 h-6" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              {/* Messages Button */}
              <Link
                to="/messages"
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            DormDeals Marketplace
          </h1>
          <p className="text-gray-600">
            Find and sell items with fellow college students
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for items..."
                  value={searchInput.filters.query}
                  onChange={(e) => handleSearchChange('query', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200"
              >
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={searchInput.filters.category || ''}
                    onChange={(e) => handleSearchChange('category', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {Object.values(ItemCategory).map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    value={searchInput.filters.condition || ''}
                    onChange={(e) => handleSearchChange('condition', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Conditions</option>
                    {Object.values(ItemCondition).map(condition => (
                      <option key={condition} value={condition}>
                        {condition.charAt(0).toUpperCase() + condition.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={searchInput.filters.priceMin || ''}
                    onChange={(e) => handleSearchChange('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={searchInput.filters.priceMax || ''}
                    onChange={(e) => handleSearchChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Sort By */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={searchInput.filters.sortBy}
                    onChange={(e) => handleSearchChange('sortBy', e.target.value as SortOption)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Object.values(SortOption).map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="md:col-span-2 flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={searchInput.filters.pickupOnly}
                      onChange={(e) => handleSearchChange('pickupOnly', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Pickup Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={searchInput.filters.deliveryAvailable}
                      onChange={(e) => handleSearchChange('deliveryAvailable', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Delivery Available</span>
                  </label>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>

        {/* Results Section */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={loadListings}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : searchResults ? (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {searchResults.totalCount} items found
                </h2>
                {searchInput.filters.query && (
                  <p className="text-gray-600">
                    Results for "{searchInput.filters.query}"
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/create-listing"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Listing
                </Link>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Listing Image */}
                  <div className="h-48 bg-gray-200 relative">
                    {listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleAddToWishlist(listing)}
                        className={`p-2 rounded-full transition-colors ${
                          listing.isInWishlist
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${listing.isInWishlist ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Listing Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {listing.title}
                    </h3>
                    <p className="text-2xl font-bold text-primary-600 mb-2">
                      {formatPrice(listing.price)}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {listing.seller.rating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600 capitalize">
                        {listing.condition.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-sm text-gray-500 mb-3">
                      <p>Sold by {listing.seller.name}</p>
                      <p>{formatDate(listing.createdAt)}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(listing)}
                        disabled={listing.isInCart}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          listing.isInCart
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {listing.isInCart ? 'In Cart' : 'Add to Cart'}
                      </button>
                      <Link
                        to={`/listing/${listing.id}`}
                        className="flex-1 py-2 px-3 rounded-lg text-sm font-medium text-center border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {searchResults.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => {
                    setSearchInput(prev => ({ ...prev, page: prev.page! - 1 }));
                    loadListings();
                  }}
                  disabled={!searchResults.hasPreviousPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {searchResults.currentPage} of {searchResults.totalPages}
                </span>
                <button
                  onClick={() => {
                    setSearchInput(prev => ({ ...prev, page: prev.page! + 1 }));
                    loadListings();
                  }}
                  disabled={!searchResults.hasNextPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : null}

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="bg-white w-96 h-full shadow-xl overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                          {item.listing.images.length > 0 ? (
                            <img
                              src={item.listing.images[0]}
                              alt={item.listing.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                            {item.listing.title}
                          </h3>
                          <p className="text-primary-600 font-semibold">
                            {formatPrice(item.listing.price)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-lg font-semibold text-primary-600">
                          {formatPrice(cartItems.reduce((sum, item) => sum + (item.listing.price * item.quantity), 0))}
                        </span>
                      </div>
                      <button className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors">
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Wishlist Sidebar */}
        {showWishlist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="bg-white w-96 h-full shadow-xl overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Wishlist</h2>
                  <button
                    onClick={() => setShowWishlist(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your wishlist is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                          {item.listing.images.length > 0 ? (
                            <img
                              src={item.listing.images[0]}
                              alt={item.listing.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                            {item.listing.title}
                          </h3>
                          <p className="text-primary-600 font-semibold">
                            {formatPrice(item.listing.price)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleAddToCart(item.listing)}
                              className="text-primary-600 hover:text-primary-700 text-sm"
                            >
                              Add to Cart
                            </button>
                            <span className="text-gray-300">•</span>
                            <button
                              onClick={() => handleRemoveFromWishlist(item.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MainFeaturePage
