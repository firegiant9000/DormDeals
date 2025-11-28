import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  fadeInUp, 
  fadeIn, 
  staggerContainer, 
  staggerItem, 
  heroTitle, 
  heroSubtitle, 
  getAnimationVariants
} from '../utils/animations';
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
import { mockItems } from '../data/mockData';
import { formatCurrency, formatRelativeTime } from '../utils/helpers';
import { useShop } from '@/context/ShopContext';
import { useAuth } from '@/context/AuthContext';
import { itemApi } from '../services/api';
import SearchFiltersBar from '../components/SearchFiltersBar';

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
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const {
    addToCart,
    addToWishlist,
    removeFromCart,
    removeFromWishlist,
    isInCart,
    isInWishlist
  } = useShop();
  const { isAuthenticated } = useAuth();

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


  const mapCategoryToLabel = (raw?: string): string => {
    const v = (raw ?? '').toString().trim().toLowerCase();
    if (['furniture'].includes(v)) return 'Furniture';
    if (['electronics', 'electronic'].includes(v)) return 'Electronics';
    if (['textbooks', 'textbook', 'books', 'book'].includes(v)) return 'Textbooks';
    if (['clothing', 'clothes', 'apparel'].includes(v)) return 'Clothing';
    if (['kitchen'].includes(v)) return 'Kitchen';
    if (['decor', 'decoration'].includes(v)) return 'Decor';
    if (['appliances', 'appliance'].includes(v)) return 'Appliances';
    return 'Other';
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
        category: (formData.category as ItemCategory) || undefined,
        priceMin: formData.minPrice ? parseFloat(formData.minPrice) : undefined,
        priceMax: formData.maxPrice ? parseFloat(formData.maxPrice) : undefined,
        condition: (formData.condition as ItemCondition) || undefined,
        pickupMethod: (formData.pickupMethod as PickupMethod) || undefined,
        location: formData.location.trim() || undefined,
        sortBy: formData.sortBy as SortOption
      };

      // Local filtering using mockItems to avoid network calls
      let items = [...mockItems] as Item[];

      const normalize = (v?: string) => (v ?? '').toString().toLowerCase();
      const computedPickup = (it: Item): string => {
        const pickup = (it as any).pickupAvailable;
        const delivery = (it as any).deliveryAvailable;
        if (pickup && delivery) return 'both available';
        if (pickup && !delivery) return 'pickup only';
        if (!pickup && delivery) return 'delivery only';
        // fallback to item.pickupMethod field if present
        const pm = ((it as any).pickupMethod || '').toString().toLowerCase();
        return pm;
      };

      if (searchFilters.query) {
        const q = searchFilters.query.toLowerCase();
        items = items.filter(i =>
          normalize(i.title).includes(q) ||
          normalize(i.description).includes(q) ||
          normalize(mapCategoryToLabel(i.category)).includes(q) ||
          normalize(i.category).includes(q)
        );
      }
      if (searchFilters.category) items = items.filter(i => normalize(mapCategoryToLabel(i.category)) === normalize(searchFilters.category as any));
      if (searchFilters.condition) items = items.filter(i => normalize(i.condition as any) === normalize(searchFilters.condition as any));
      if (searchFilters.pickupMethod) items = items.filter(i => computedPickup(i) === normalize(searchFilters.pickupMethod as any));
      if (searchFilters.priceMin !== undefined) items = items.filter(i => i.price >= searchFilters.priceMin!);
      if (searchFilters.priceMax !== undefined) items = items.filter(i => i.price <= searchFilters.priceMax!);
      if (searchFilters.location) items = items.filter(i => normalize(i.location).includes(normalize(searchFilters.location)));

      switch (searchFilters.sortBy) {
        case SortOption.PRICE_LOW_TO_HIGH:
          items.sort((a, b) => a.price - b.price); break;
        case SortOption.PRICE_HIGH_TO_LOW:
          items.sort((a, b) => b.price - a.price); break;
        case SortOption.NEWEST:
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
        case SortOption.OLDEST:
          items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
        default:
          break;
      }

      // Navigate to results page with locally computed items and filters
      navigate('/results', { 
        state: { 
          results: { items },
          filters: searchFilters,
          searchQuery: formData.query 
        } 
      });
      
    } catch {
      // Search failed
      setErrors([{ 
        field: 'general', 
        message: 'Search failed. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle helpers
  const handleToggleCart = (item: Item) => {
    if (isInCart(item.id)) removeFromCart(item.id); else addToCart(item);
  };
  const handleToggleWishlist = (item: Item) => {
    if (isInWishlist(item.id)) removeFromWishlist(item.id); else addToWishlist(item);
  };

  // Get error message for a specific field
  const getFieldError = (field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  };

  // Load featured items on component mount
  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const featured = await itemApi.getFeatured() as Item[];
        if (Array.isArray(featured) && featured.length > 0) {
          setFeaturedItems(featured);
        } else {
          // Fallback to mock data if no featured items
          setFeaturedItems(mockItems.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching featured items:', error);
        // Fallback to mock data on error
        setFeaturedItems(mockItems.slice(0, 6));
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <div className="min-h-[100svh] bg-transparent text-inherit">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div 
          className="bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-lg p-8 mb-8"
          initial="hidden"
          animate="visible"
          variants={getAnimationVariants(fadeIn)}
        >
          <div className="text-center">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold mb-4"
              variants={getAnimationVariants(heroTitle)}
            >
              Find Your Perfect Dorm Items
            </motion.h1>
            <motion.p 
              className="text-xl text-primary-100 mb-6"
              variants={getAnimationVariants(heroSubtitle)}
            >
              Browse items from fellow UL students and discover great deals on campus
            </motion.p>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div 
          className="mb-8"
          initial="hidden"
          animate="visible"
          variants={getAnimationVariants(fadeInUp)}
          transition={{ delay: 0.2 }}
        >
          <motion.h2 
            className="text-2xl font-semibold text-body mb-6"
            variants={getAnimationVariants(fadeInUp)}
          >
            Search Items
          </motion.h2>
          
          <SearchFiltersBar
            query={formData.query}
            setQuery={(value) => handleInputChange('query', value)}
            category={formData.category}
            setCategory={(value) => handleInputChange('category', value)}
            condition={formData.condition}
            setCondition={(value) => handleInputChange('condition', value)}
            pickupMethod={formData.pickupMethod}
            setPickupMethod={(value) => handleInputChange('pickupMethod', value)}
            sortBy={formData.sortBy}
            setSortBy={(value) => handleInputChange('sortBy', value)}
            minPrice={formData.minPrice}
            setMinPrice={(value) => handleInputChange('minPrice', value)}
            maxPrice={formData.maxPrice}
            setMaxPrice={(value) => handleInputChange('maxPrice', value)}
            onReset={() => {
              setFormData({
                query: '',
                category: '',
                minPrice: '',
                maxPrice: '',
                condition: '',
                pickupMethod: '',
                location: '',
                sortBy: SortOption.NEWEST
              });
              setErrors([]);
            }}
          />

          {/* Search Button */}
          <motion.div 
            className="flex justify-center mt-6"
            variants={getAnimationVariants(fadeInUp)}
          >
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto rounded-xl px-8 py-3 font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search Items</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* General Error Message */}
          {getFieldError('general') && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-red-600">{getFieldError('general')}</p>
            </div>
          )}
        </motion.div>

        {/* Featured Items Section */}
        <motion.section 
          className="dd-card bg-surface mb-12 p-8"
          initial="hidden"
          animate="visible"
          variants={getAnimationVariants(fadeInUp)}
          transition={{ delay: 0.4 }}
        >
          <motion.div 
            className="flex justify-between items-center mb-8"
            variants={getAnimationVariants(fadeInUp)}
          >
            <h3 className="text-3xl font-bold text-body">Featured Items</h3>
            <motion.button
              onClick={() => navigate('/marketplace')}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <span>View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={getAnimationVariants(staggerContainer)}
            initial="hidden"
            animate="visible"
          >
            {featuredItems.map((item) => (
              <motion.div
                key={item.id}
                variants={getAnimationVariants(staggerItem)}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col shadow-sm hover:border-primary-200"
                onClick={() => navigate(`/listing/${item.id}`, { state: { listing: item } })}
                whileHover={{ 
                  scale: 1.02, 
                  y: -6,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={item.images[0] || '/api/placeholder/400/300'}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 text-lg">{item.title}</h4>
                    <span className="text-xl font-bold text-primary-600 ml-2">{formatCurrency(item.price)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">{item.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-5">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">{item.category}</span>
                    <span className="text-xs text-gray-400">{formatRelativeTime(item.posted)}</span>
                  </div>
                  <div className="flex space-x-3 mt-auto pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleCart(item); }}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${isAuthenticated && isInCart(item.id) ? 'border-2 border-red-300 text-red-700 hover:bg-red-50' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'}`}
                    >
                      {isAuthenticated && isInCart(item.id) ? 'Remove from Cart' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleWishlist(item); }}
                      className={`p-3 border-2 rounded-lg transition-all duration-200 ${isAuthenticated && isInWishlist(item.id) ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'}`}
                      aria-label="Toggle wishlist"
                    >
                      <svg className={`w-5 h-5 ${isAuthenticated && isInWishlist(item.id) ? 'text-red-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

      </main>

      {/* Global drawers are rendered at App root via ShopDrawers */}

    </div>
  );
};

export default MainFeaturePage;
