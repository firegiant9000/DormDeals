import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Grid, List, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { mockItems } from '../data/mockData'
import { formatCurrency } from '../utils/helpers'
import { useShop } from '@/context/ShopContext'
import { useAuth } from '@/context/AuthContext'
import { Item, SortOption } from '../types'
import SearchFiltersBar from '../components/SearchFiltersBar'

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

  // Use app-wide mock items for richer data and images
  const baseItems: Item[] = mockItems

  const filteredItems = useMemo(() => {
    let items = [...baseItems]
    const normalize = (v?: string | number) => (v ?? '').toString().toLowerCase()
    const mapCategoryToLabel = (raw?: string): string => {
      const v = (raw ?? '').toString().trim().toLowerCase()
      if (['furniture'].includes(v)) return 'Furniture'
      if (['electronics', 'electronic'].includes(v)) return 'Electronics'
      if (['textbooks', 'textbook', 'books', 'book'].includes(v)) return 'Textbooks'
      if (['clothing', 'clothes', 'apparel'].includes(v)) return 'Clothing'
      if (['kitchen'].includes(v)) return 'Kitchen'
      if (['decor', 'decoration'].includes(v)) return 'Decor'
      if (['appliances', 'appliance'].includes(v)) return 'Appliances'
      return 'Other'
    }
    const computedPickup = (it: Item): string => {
      const pickup = (it as any).pickupAvailable
      const delivery = (it as any).deliveryAvailable
      if (pickup && delivery) return 'both available'
      if (pickup && !delivery) return 'pickup only'
      if (!pickup && delivery) return 'delivery only'
      const pm = ((it as any).pickupMethod || '').toString().toLowerCase()
      return pm
    }

    if (query) {
      const q = query.toLowerCase()
      items = items.filter(i =>
        normalize(i.title).includes(q) ||
        normalize(i.description).includes(q) ||
        normalize(mapCategoryToLabel(i.category)).includes(q)
      )
    }
    if (category) items = items.filter(i => normalize(mapCategoryToLabel(i.category)) === normalize(category))
    if (condition) items = items.filter(i => normalize((i as any).condition) === normalize(condition))
    if (pickupMethod) items = items.filter(i => computedPickup(i) === normalize(pickupMethod))

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
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-body mb-2">Marketplace</h1>
          <p className="text-muted">Find great deals from fellow UL students</p>
        </div>

        {/* Search and Filters */}
        <div className="dd-card bg-surface border-surface p-6 mb-8">
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
          />

          {/* View Toggle */}
          <div className="mt-4 flex border border-gray-300 rounded-lg overflow-hidden w-fit">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items Section */}
        <div className="dd-card bg-surface mb-8 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-body">All Items</h3>
            <div className="text-sm text-gray-500">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
            </div>
          </div>
          
          {/* Items Grid/List */}
          <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
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
                    <span className="text-xs text-gray-400">{item.condition}</span>
                  </div>
                  <div className="flex space-x-3 mt-auto pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); if (!isInCart(item.id)) addToCart(item); else removeFromCart(item.id) }}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${isAuthenticated && isInCart(item.id) ? 'border-2 border-red-300 text-red-700 hover:bg-red-50' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'}`}
                    >
                      {isAuthenticated && isInCart(item.id) ? 'Remove from Cart' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (!isInWishlist(item.id)) addToWishlist(item); else removeFromWishlist(item.id) }}
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
          </div>
          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Global drawers are rendered at App root via ShopDrawers */}
      </div>
    </div>
  )
}

export default Marketplace
