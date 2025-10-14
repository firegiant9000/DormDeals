import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Filter, LayoutGrid, List, Search } from 'lucide-react'
import { 
  Item, 
  ItemCategory, 
  ItemCondition, 
  PickupMethod, 
  SearchFilters, 
  SortOption 
} from '../types'
import { formatCurrency, formatRelativeTime } from '../utils/helpers'
import { useShop } from '@/context/ShopContext'
import { mockItems } from '../data/mockData'

type RouterState = {
  // When navigating from MainFeaturePage we pass these
  results?: { items?: Item[]; listings?: Item[]; totalCount?: number }
  filters?: SearchFilters
  searchQuery?: string
}

const ResultsPage: React.FC = () => {
  const navigate = useNavigate()
  const { state } = useLocation() as { state?: RouterState }
  const { addToCart, addToWishlist, removeFromCart, removeFromWishlist, isInCart, isInWishlist } = useShop()

  // Derive initial items from router state with robust fallbacks
  const initialItems: Item[] = useMemo(() => {
    if (!state || !state.results) return []
    const r = state.results
    // Support either {items: Item[]} or {listings: Item[]}
    return (r.items || r.listings || []) as Item[]
  }, [state])

  // Local UI state for client-side refine
  const [view, setView] = useState<'cards' | 'list'>('cards')
  const [sortBy, setSortBy] = useState<SortOption>(state?.filters?.sortBy || SortOption.RELEVANCE)
  const [category, setCategory] = useState<string>(state?.filters?.category || '')
  const [condition, setCondition] = useState<string>(state?.filters?.condition || '')
  const [pickupMethod, setPickupMethod] = useState<string>(state?.filters?.pickupMethod || '')
  const [minPrice, setMinPrice] = useState<string>(state?.filters?.priceMin?.toString() || '')
  const [maxPrice, setMaxPrice] = useState<string>(state?.filters?.priceMax?.toString() || '')
  const [query, setQuery] = useState<string>(state?.filters?.query || state?.searchQuery || '')
  const [error, setError] = useState<string | null>(null)
  const [refilterTick, setRefilterTick] = useState(0)

  // Compute the base item set: use results from router if present; otherwise fall back to local mock data
  const baseItems: Item[] = useMemo(() => {
    return (initialItems && initialItems.length > 0) ? initialItems : (mockItems as Item[])
  }, [initialItems])

  // Apply client-side filtering and sorting
  const CATEGORY_LABELS = [
    'Furniture',
    'Electronics',
    'Textbooks',
    'Clothing',
    'Kitchen',
    'Decor',
    'Appliances',
    'Other'
  ]

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

  const filteredItems = useMemo(() => {
    try {
      let items = [...baseItems]

      const normalize = (v?: string | number) => (v ?? '').toString().toLowerCase()
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
          items.sort((a, b) => a.price - b.price)
          break
        case SortOption.PRICE_HIGH_TO_LOW:
          items.sort((a, b) => b.price - a.price)
          break
        case SortOption.NEWEST:
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          break
        case SortOption.OLDEST:
          items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          break
        case SortOption.MOST_VIEWED:
          items.sort((a, b) => (b.views || 0) - (a.views || 0))
          break
        case SortOption.MOST_LIKED:
          items.sort((a, b) => (b.likes || 0) - (a.likes || 0))
          break
        default:
          break
      }

      setError(null)
      return items
    } catch (e: any) {
      setError(e?.message || 'Failed to filter results')
      return []
    }
  }, [baseItems, query, category, condition, pickupMethod, minPrice, maxPrice, sortBy, refilterTick])

  const hasNoData = (!state || !state.results) && baseItems.length === 0
  const totalFound = filteredItems.length

  const onCardClick = (item: Item) => {
    navigate(`/listing/${item.id}`, { state: { listing: item } })
  }

  const onSearchAgain = () => {
    // Explicitly trigger re-filter; filters are already bound to state
    setRefilterTick(t => t + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={onSearchAgain}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Search className="w-5 h-5" />
            Search Items
          </button>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">Search Results</h1>
          <p className="mt-1 text-gray-600">
            {hasNoData ? 'No search input received' : `Found ${totalFound} item${totalFound === 1 ? '' : 's'}${query ? ` for "${query}"` : ''}`}
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search within results..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2 self-end lg:self-auto">
                <button
                  onClick={() => setView('cards')}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded border ${view === 'cards' ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-gray-300 hover:border-primary-500 hover:text-primary-600'}`}
                  aria-label="Card view"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Cards
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded border ${view === 'list' ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-gray-300 hover:border-primary-500 hover:text-primary-600'}`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Categories</option>
                {Object.values(ItemCategory).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Any Condition</option>
                {Object.values(ItemCondition).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={pickupMethod}
                onChange={(e) => setPickupMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Any Pickup Method</option>
                {Object.values(PickupMethod).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value={SortOption.RELEVANCE}>Relevance</option>
                <option value={SortOption.NEWEST}>Newest</option>
                <option value={SortOption.OLDEST}>Oldest</option>
                <option value={SortOption.PRICE_LOW_TO_HIGH}>Price: Low to High</option>
                <option value={SortOption.PRICE_HIGH_TO_LOW}>Price: High to Low</option>
                <option value={SortOption.MOST_VIEWED}>Most Viewed</option>
                <option value={SortOption.MOST_LIKED}>Most Liked</option>
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <input
                type="number"
                inputMode="decimal"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="0"
                step="0.01"
              />
              <input
                type="number"
                inputMode="decimal"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="0"
                step="0.01"
              />
              <button
                onClick={() => { setCategory(''); setCondition(''); setPickupMethod(''); setMinPrice(''); setMaxPrice(''); setSortBy(SortOption.RELEVANCE); setQuery('') }}
                className="col-span-2 sm:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Empty/no-data states */}
        {(hasNoData || totalFound === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-300 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {hasNoData ? 'No data received' : 'No results found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {hasNoData ? 'We did not receive any results from the previous page.' : 'Try adjusting your search terms or filters.'}
            </p>
            <button onClick={onSearchAgain} className="btn-primary px-6 py-2">Search Items</button>
          </div>
        )}

        {/* Results list - Card view (like Marketplace) */}
        {totalFound > 0 && view === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col"
                onClick={() => onCardClick(item)}
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={(item.images && item.images[0]) || '/api/placeholder/400/300'}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mr-2">{item.title}</h3>
                    <span className="text-lg font-bold text-primary-600">{formatCurrency(item.price)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="bg-gray-100 px-2 py-1 rounded">{item.category}</span>
                    <span>{formatRelativeTime(item.posted)}</span>
                  </div>
                  <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { if (!isInCart(item.id)) addToCart(item); else removeFromCart(item.id) }}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium inline-flex items-center justify-center gap-2 ${isInCart(item.id) ? 'border border-red-300 text-red-700 hover:bg-red-50' : 'bg-primary-600 text-white hover:bg-primary-700 transition-colors'}`}
                    >
                      {isInCart(item.id) ? 'Remove from Cart' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => { if (!isInWishlist(item.id)) addToWishlist(item); else removeFromWishlist(item.id) }}
                      className={`p-2 border rounded transition-colors ${isInWishlist(item.id) ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-gray-300 hover:bg-gray-50'}`}
                      aria-label="Toggle wishlist"
                    >
                      <svg className={`w-4 h-4 ${isInWishlist(item.id) ? 'text-red-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* List view with actions */}
        {totalFound > 0 && view === 'list' && (
          <div className="bg-white border border-gray-200 rounded-lg divide-y">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onCardClick(item)}
              >
                <img
                  src={(item.images && item.images[0]) || '/api/placeholder/160/120'}
                  alt={item.title}
                  className="w-24 h-20 object-cover rounded"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                    <span className="text-primary-600 font-bold whitespace-nowrap">{formatCurrency(item.price)}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{item.category}</span>
                    <span>{item.condition}</span>
                    <span>{formatRelativeTime(item.posted)}</span>
                  </div>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { if (!isInCart(item.id)) addToCart(item); else removeFromCart(item.id) }}
                    className={`px-3 py-2 rounded text-sm ${isInCart(item.id) ? 'border border-red-300 text-red-700 hover:bg-red-50' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                  >
                    {isInCart(item.id) ? 'Remove from Cart' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => { if (!isInWishlist(item.id)) addToWishlist(item); else removeFromWishlist(item.id) }}
                    className={`px-3 py-2 rounded text-sm border ${isInWishlist(item.id) ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-gray-300 hover:bg-gray-50'}`}
                  >
                    {isInWishlist(item.id) ? 'Remove Wishlist' : 'Wishlist'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsPage
