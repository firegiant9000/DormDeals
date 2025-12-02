import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Grid, List, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency, formatRelativeTime } from '../utils/helpers'
import { useShop } from '@/context/ShopContext'
import { useAuth } from '@/context/AuthContext'
import { Item, SortOption } from '../types'
import SearchFiltersBar from '../components/SearchFiltersBar'
import { mockItems } from '../data/mockData'
import { 
  fadeInUp, 
  fadeIn, 
  staggerContainer, 
  staggerItem, 
  heroTitle, 
  heroSubtitle, 
  getAnimationVariants
} from '../utils/animations'

const Marketplace = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [pickupMethod, setPickupMethod] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>(SortOption.RELEVANCE)
  const { addToCart, addToWishlist, removeFromCart, removeFromWishlist, isInCart, isInWishlist } = useShop()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  // Initialize with all listings immediately for instant display (mockItems are real items)
  const [baseItems, setBaseItems] = useState<Item[]>(mockItems)
  const [isLoading, setIsLoading] = useState(false)

  // Load additional listings from Firestore and combine with existing items
  useEffect(() => {
    let isMounted = true

    const loadListings = async () => {
      // Check if Firestore is available before trying to use it
      try {
        const { db } = await import('../config/firebase')
        if (!db) {
          // Firestore not available, just use mockItems (which are real items)
          return
        }
      } catch {
        // Can't import Firebase, just use mockItems
        return
      }

      try {
        setIsLoading(true)
        // Don't set error state - we already have items to show
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 3000)
        );
        
        const { getListings } = await import('../services/listingsService')
        const fetchPromise = getListings({ active: true })
        
        const dbListings = await Promise.race([fetchPromise, timeoutPromise]) as Item[]
        
        if (isMounted && Array.isArray(dbListings) && dbListings.length > 0) {
          // Combine all listings: start with mockItems (which are real items) and add DB listings
          // Remove duplicates by ID to avoid showing the same item twice
          const allListings = [...mockItems]
          const existingIds = new Set(mockItems.map(item => item.id))
          
          // Add DB listings that don't already exist (mockItems are real, so we don't replace them)
          dbListings.forEach(listing => {
            if (!existingIds.has(listing.id)) {
              allListings.push(listing)
              existingIds.add(listing.id)
            }
          })
          
          setBaseItems(allListings)
        }
      } catch (error: any) {
        // Silently handle errors - we already have mockItems displayed
        // Only log to console for debugging, don't show to user
        if (error?.message && !error?.message?.includes('Firestore not initialized')) {
          console.log('Additional listings unavailable, using available listings:', error.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Load additional listings in background - don't block UI
    // mockItems are already shown as they are real items
    loadListings()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredItems = useMemo(() => {
    let items = [...baseItems]
    const normalize = (v?: string | number) => (v ?? '').toString().toLowerCase().trim()
    
    // Map item category to filter label format
    const mapCategoryToLabel = (raw?: string): string => {
      const v = normalize(raw)
      if (['furniture', 'furniture'].includes(v)) return 'Furniture'
      if (['electronics', 'electronic'].includes(v)) return 'Electronics'
      if (['textbooks', 'textbook', 'books', 'book'].includes(v)) return 'Textbooks'
      if (['clothing', 'clothes', 'apparel'].includes(v)) return 'Clothing'
      if (['kitchen'].includes(v)) return 'Kitchen'
      if (['decor', 'decoration'].includes(v)) return 'Decor'
      if (['appliances', 'appliance'].includes(v)) return 'Appliances'
      if (['sports'].includes(v)) return 'Sports'
      return 'Other'
    }
    
    // Map item condition to filter format (handle both enum and string formats)
    const normalizeCondition = (cond?: string): string => {
      const v = normalize(cond)
      // Handle enum values like 'like_new', 'LIKE_NEW', etc.
      if (v.includes('like_new') || v.includes('like new')) return 'like_new'
      if (v === 'good') return 'good'
      if (v === 'fair') return 'fair'
      if (v === 'poor') return 'poor'
      if (v === 'new') return 'new'
      return v
    }
    
    // Map pickup method to filter format
    const normalizePickupMethod = (it: Item): string => {
      const pickup = (it as any).pickupAvailable
      const delivery = (it as any).deliveryAvailable
      
      // Check if item has explicit pickupMethod field
      const pm = ((it as any).pickupMethod || '').toString().trim()
      if (pm) {
        const pmLower = normalize(pm)
        if (pmLower.includes('both') || pmLower === 'both available') return 'Both Available'
        if (pmLower.includes('pickup') && !pmLower.includes('delivery')) return 'Pickup Only'
        if (pmLower.includes('delivery') && !pmLower.includes('pickup')) return 'Delivery Only'
      }
      
      // Fallback to computed from pickupAvailable/deliveryAvailable
      if (pickup && delivery) return 'Both Available'
      if (pickup && !delivery) return 'Pickup Only'
      if (!pickup && delivery) return 'Delivery Only'
      return ''
    }

    // Apply query filter
    if (query) {
      const q = normalize(query)
      items = items.filter(i =>
        normalize(i.title).includes(q) ||
        normalize(i.description).includes(q) ||
        normalize(mapCategoryToLabel(i.category)).includes(q) ||
        normalize(i.category).includes(q)
      )
    }
    
    // Apply category filter
    if (category) {
      const categoryLabel = normalize(category)
      items = items.filter(i => {
        const itemCategoryLabel = normalize(mapCategoryToLabel(i.category))
        const itemCategoryRaw = normalize(i.category)
        return itemCategoryLabel === categoryLabel || itemCategoryRaw === categoryLabel
      })
    }
    
    // Apply condition filter
    if (condition) {
      const conditionNormalized = normalizeCondition(condition)
      items = items.filter(i => {
        const itemCondition = normalizeCondition((i as any).condition)
        return itemCondition === conditionNormalized
      })
    }
    
    // Apply pickup method filter
    if (pickupMethod) {
      const pickupNormalized = normalize(pickupMethod)
      items = items.filter(i => {
        const itemPickup = normalizePickupMethod(i)
        return normalize(itemPickup) === pickupNormalized
      })
    }

    const min = minPrice ? parseFloat(minPrice) : undefined
    const max = maxPrice ? parseFloat(maxPrice) : undefined
    if (!isNaN(min as any)) items = items.filter(i => i.price >= (min as number))
    if (!isNaN(max as any)) items = items.filter(i => i.price <= (max as number))

    switch (sortBy) {
      case SortOption.PRICE_LOW_TO_HIGH:
        items.sort((a, b) => a.price - b.price); break
      case SortOption.PRICE_HIGH_TO_LOW:
        items.sort((a, b) => b.price - a.price); break
      case SortOption.NEWEST:
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break
      case SortOption.OLDEST:
        items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break
      case SortOption.MOST_VIEWED:
        items.sort((a, b) => (b.views || 0) - (a.views || 0)); break
      case SortOption.MOST_LIKED:
        items.sort((a, b) => (b.likes || 0) - (a.likes || 0)); break
      default:
        break
    }
    return items
  }, [baseItems, query, category, condition, pickupMethod, minPrice, maxPrice, sortBy])

  

  return (
    <div className="min-h-[100svh] bg-transparent text-inherit">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Same as MainFeaturePage */}
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
              Marketplace
            </motion.h1>
            <motion.p 
              className="text-xl text-primary-100 mb-6"
              variants={getAnimationVariants(heroSubtitle)}
            >
              Browse all available items from fellow UL students and discover great deals on campus
            </motion.p>
          </div>
        </motion.div>

        {/* Search Section - Same as MainFeaturePage */}
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
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
            condition={condition}
            setCondition={setCondition}
            pickupMethod={pickupMethod}
            setPickupMethod={setPickupMethod}
            sortBy={sortBy}
            setSortBy={setSortBy}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            onReset={() => {
              setQuery('')
              setCategory('')
              setCondition('')
              setPickupMethod('')
              setMinPrice('')
              setMaxPrice('')
              setSortBy(SortOption.RELEVANCE)
            }}
          />

          {/* Search Button - Same as MainFeaturePage */}
          <motion.div 
            className="flex justify-center mt-6"
            variants={getAnimationVariants(fadeInUp)}
          >
            <motion.button
              onClick={() => {
                // Scroll to results section
                const resultsSection = document.querySelector('[data-results-section]');
                if (resultsSection) {
                  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="w-full sm:w-auto rounded-xl px-8 py-3 font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-colors flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search Items</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* All Items Section */}
        <motion.section 
          className="dd-card bg-surface mb-12 p-8"
          initial="hidden"
          animate="visible"
          variants={getAnimationVariants(fadeInUp)}
          transition={{ delay: 0.4 }}
          data-results-section
        >
          <motion.div 
            className="flex justify-between items-center mb-8"
            variants={getAnimationVariants(fadeInUp)}
          >
            <h3 className="text-3xl font-bold text-body">All Items</h3>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
              </div>
              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Items Grid/List */}
          {isLoading && baseItems.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-gray-600">Loading listings...</span>
            </div>
          ) : (
            <motion.div 
              className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
              variants={getAnimationVariants(staggerContainer)}
              initial="hidden"
              animate="visible"
            >
              {filteredItems.map((item, index) => (
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
                      src={item.images?.[0] || '/api/placeholder/400/300'}
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
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          e.preventDefault();
                          if (!isInCart(item.id)) {
                            addToCart(item);
                          } else {
                            removeFromCart(item.id);
                          }
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${isAuthenticated && isInCart(item.id) ? 'border-2 border-red-300 text-red-700 hover:bg-red-50' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'}`}
                        type="button"
                      >
                        {isAuthenticated && isInCart(item.id) ? 'Remove from Cart' : 'Add to Cart'}
                      </button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          e.preventDefault();
                          if (!isInWishlist(item.id)) {
                            addToWishlist(item);
                          } else {
                            removeFromWishlist(item.id);
                          }
                        }}
                        className={`p-3 border-2 rounded-lg transition-all duration-200 ${isAuthenticated && isInWishlist(item.id) ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'}`}
                        aria-label="Toggle wishlist"
                        type="button"
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
          )}
          {/* Empty State - Show when no items match filters */}
          {!isLoading && filteredItems.length === 0 && baseItems.length > 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setQuery('')
                  setCategory('')
                  setCondition('')
                  setPickupMethod('')
                  setMinPrice('')
                  setMaxPrice('')
                  setSortBy(SortOption.RELEVANCE)
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </motion.section>

      </main>

      {/* Global drawers are rendered at App root via ShopDrawers */}
    </div>
  )
}

export default Marketplace
