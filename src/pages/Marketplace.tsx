import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Grid, List, Heart, ShoppingCart, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { mockItems } from '../data/mockData'
import { formatCurrency } from '../utils/helpers'
import { useShop } from '@/context/ShopContext'
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
          <p className="text-gray-600">Find great deals from fellow UL students</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
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

        {/* Items Grid/List */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/listing/${item.id}`, { state: { listing: item } })}
            >
              <div className={`${viewMode === 'list' ? 'flex' : ''}`}>
                {/* Image */}
                <div className={`${viewMode === 'list' ? 'w-48 h-32' : 'h-48'} bg-gray-200`}> 
                  <img
                    src={item.images[0] || '/api/placeholder/400/300'}
                    alt={item.title}
                    className={`${viewMode === 'list' ? 'w-48 h-32' : 'w-full h-48'} object-cover`}
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mr-2">{item.title}</h3>
                    <span className="text-lg font-bold text-primary-600">{formatCurrency(item.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span className="bg-gray-100 px-2 py-1 rounded">{item.category}</span>
                    <span>{item.condition}</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    <p>{item.location}</p>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { if (!isInCart(item.id)) addToCart(item); else removeFromCart(item.id) }}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium inline-flex items-center justify-center gap-2 ${isInCart(item.id) ? 'border border-red-300 text-red-700 hover:bg-red-50' : 'bg-primary-600 text-white hover:bg-primary-700 transition-colors'}`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {isInCart(item.id) ? 'Remove from Cart' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => { if (!isInWishlist(item.id)) addToWishlist(item); else removeFromWishlist(item.id) }}
                      className={`p-2 border rounded transition-colors ${isInWishlist(item.id) ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-gray-300 hover:bg-gray-50'}`}
                      aria-label="Toggle wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(item.id) ? 'text-red-600' : 'text-gray-600'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global drawers are rendered at App root via ShopDrawers */}

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
    </div>
  )
}

export default Marketplace
