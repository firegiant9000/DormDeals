import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  SearchFormData, 
  FormError, 
  ItemCategory, 
  ItemCondition, 
  PickupMethod, 
  SortOption,
  SearchFilters,
  Item
} from '../types';
import { searchItems } from '../services/apiService';
import { mockItems } from '../data/mockData';
import { formatCurrency, formatRelativeTime } from '../utils/helpers';

const MainFeaturePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState<SearchFormData>({
    query: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    pickupMethod: '',
    location: '',
    sortBy: SortOption.NEWEST
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  // Validation rules
  const validateForm = (): FormError[] => {
    const newErrors: FormError[] = [];

    // Price validation
    if (formData.minPrice && formData.maxPrice) {
      const minPrice = parseFloat(formData.minPrice);
      const maxPrice = parseFloat(formData.maxPrice);
      
      if (isNaN(minPrice) || minPrice < 0) {
        newErrors.push({ field: 'minPrice', message: 'Minimum price must be a valid positive number' });
      }
      
      if (isNaN(maxPrice) || maxPrice < 0) {
        newErrors.push({ field: 'maxPrice', message: 'Maximum price must be a valid positive number' });
      }
      
      if (minPrice > maxPrice) {
        newErrors.push({ field: 'maxPrice', message: 'Maximum price must be greater than minimum price' });
      }
    }

    // Query validation (optional but if provided, should be meaningful)
    if (formData.query && formData.query.trim().length < 2) {
      newErrors.push({ field: 'query', message: 'Search query must be at least 2 characters long' });
    }

    return newErrors;
  };

  // Handle input changes
  const handleInputChange = (field: keyof SearchFormData, value: string) => {
    setFormData((prev: SearchFormData) => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    setErrors((prev: FormError[]) => prev.filter(error => error.field !== field));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      // Convert form data to search filters
      const searchFilters: SearchFilters = {
        query: formData.query.trim() || undefined,
        category: formData.category as ItemCategory || undefined,
        priceMin: formData.minPrice ? parseFloat(formData.minPrice) : undefined,
        priceMax: formData.maxPrice ? parseFloat(formData.maxPrice) : undefined,
        condition: formData.condition as ItemCondition || undefined,
        pickupMethod: formData.pickupMethod as PickupMethod || undefined,
        location: formData.location.trim() || undefined,
        sortBy: formData.sortBy as SortOption
      };

      // Call API service
      const results = await searchItems(searchFilters);
      
      // Navigate to results page with data
      navigate('/results', { 
        state: { 
          results, 
          filters: searchFilters,
          searchQuery: formData.query 
        } 
      });
      
    } catch (error) {
      console.error('Search failed:', error);
      setErrors([{ 
        field: 'general', 
        message: error instanceof Error ? error.message : 'Search failed. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle quick actions
  const handleAddToCart = async (itemId: string) => {
    try {
      // Find the item in featured items
      const item = featuredItems.find(item => item.id === itemId);
      if (item) {
        setCartItems(prev => [...prev, item]);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleAddToWishlist = async (itemId: string) => {
    try {
      // Find the item in featured items and add to wishlist
      const item = featuredItems.find(item => item.id === itemId);
      if (item) {
        setWishlistItems(prev => [...prev, item]);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  // Get error message for a specific field
  const getFieldError = (field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  };

  // Load featured items on component mount
  useEffect(() => {
    // For now, use mock data. In production, this would be an API call
    setFeaturedItems(mockItems.slice(0, 6));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">DormDeals</h1>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              {/* Cart Button */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                <span className="hidden sm:inline">Cart</span>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => setShowWishlist(!showWishlist)}
                className="relative flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="hidden sm:inline">Wishlist</span>
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Profile</span>
              </button>

              <button
                onClick={() => navigate('/chat')}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="hidden sm:inline">Chat</span>
              </button>

              <button
                onClick={() => navigate('/create-listing')}
                className="btn-primary flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Add Listing</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Find Your Perfect Dorm Items
            </h1>
            <p className="text-xl text-primary-100 mb-6">
              Browse items from fellow UL students and discover great deals on campus
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Search Items</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Items
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="query"
                    value={formData.query}
                    onChange={(e) => handleInputChange('query', e.target.value)}
                    placeholder="Search for textbooks, furniture, electronics..."
                    className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      getFieldError('query') ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {getFieldError('query') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('query')}</p>
                )}
              </div>

              <div className="sm:w-48">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Campus area"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="sm:w-32">
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  value={formData.sortBy}
                  onChange={(e) => handleInputChange('sortBy', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={SortOption.NEWEST}>Newest</option>
                  <option value={SortOption.OLDEST}>Oldest</option>
                  <option value={SortOption.PRICE_LOW_TO_HIGH}>Price: Low to High</option>
                  <option value={SortOption.PRICE_HIGH_TO_LOW}>Price: High to Low</option>
                  <option value={SortOption.RELEVANCE}>Relevance</option>
                </select>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <svg className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>Advanced Filters</span>
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Categories</option>
                    <option value={ItemCategory.FURNITURE}>Furniture</option>
                    <option value={ItemCategory.ELECTRONICS}>Electronics</option>
                    <option value={ItemCategory.TEXTBOOKS}>Textbooks</option>
                    <option value={ItemCategory.CLOTHING}>Clothing</option>
                    <option value={ItemCategory.KITCHEN}>Kitchen</option>
                    <option value={ItemCategory.DECOR}>Decor</option>
                    <option value={ItemCategory.OTHER}>Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    id="condition"
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Any Condition</option>
                    <option value={ItemCondition.NEW}>New</option>
                    <option value={ItemCondition.LIKE_NEW}>Like New</option>
                    <option value={ItemCondition.GOOD}>Good</option>
                    <option value={ItemCondition.FAIR}>Fair</option>
                    <option value={ItemCondition.POOR}>Poor</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price ($)
                  </label>
                  <input
                    type="number"
                    id="minPrice"
                    value={formData.minPrice}
                    onChange={(e) => handleInputChange('minPrice', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      getFieldError('minPrice') ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('minPrice') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('minPrice')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    value={formData.maxPrice}
                    onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                    placeholder="1000"
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      getFieldError('maxPrice') ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('maxPrice') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('maxPrice')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="pickupMethod" className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Method
                  </label>
                  <select
                    id="pickupMethod"
                    value={formData.pickupMethod}
                    onChange={(e) => handleInputChange('pickupMethod', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Any Method</option>
                    <option value={PickupMethod.PICKUP}>Pickup Only</option>
                    <option value={PickupMethod.DELIVERY}>Delivery Only</option>
                    <option value={PickupMethod.BOTH}>Both Available</option>
                  </select>
                </div>
              </div>
            )}

            {/* General Error Message */}
            {getFieldError('general') && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{getFieldError('general')}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto btn-primary px-8 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search Items</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Featured Items Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">Featured Items</h3>
            <button
              onClick={() => navigate('/marketplace')}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col"
                onClick={() => navigate(`/listing/${item.id}`, { state: { listing: item } })}
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={item.images[0] || '/api/placeholder/400/300'}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h4>
                    <span className="text-lg font-bold text-primary-600">{formatCurrency(item.price)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">{item.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.category}</span>
                    <span>{formatRelativeTime(item.posted)}</span>
                  </div>
                  <div className="flex space-x-2 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item.id);
                      }}
                      className="flex-1 bg-primary-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToWishlist(item.id);
                      }}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              <span className="font-medium">View Cart</span>
            </button>

            <button
              onClick={() => navigate('/wishlist')}
              className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-medium">Wishlist</span>
            </button>

            <button
              onClick={() => navigate('/create-listing')}
              className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-medium">Sell Item</span>
            </button>
          </div>
        </div>
      </main>

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
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
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
                          {item.title}
                        </h3>
                        <p className="text-primary-600 font-semibold">
                          ${item.price}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => {
                              setCartItems(cartItems.filter(cartItem => cartItem.id !== item.id));
                            }}
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
                        ${cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
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
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {wishlistItems.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <p className="text-gray-500">Your wishlist is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
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
                          {item.title}
                        </h3>
                        <p className="text-primary-600 font-semibold">
                          ${item.price}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => {
                              setCartItems([...cartItems, item]);
                            }}
                            className="text-primary-600 hover:text-primary-700 text-sm"
                          >
                            Add to Cart
                          </button>
                          <span className="text-gray-300">•</span>
                          <button
                            onClick={() => {
                              setWishlistItems(wishlistItems.filter(wishlistItem => wishlistItem.id !== item.id));
                            }}
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
  );
};

export default MainFeaturePage;