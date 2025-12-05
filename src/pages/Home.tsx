import { useEffect, useMemo, useState } from 'react'
import { Grid, List, Star } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Item, SortOption } from '@/types'
import SearchFiltersBar from '@/components/SearchFiltersBar'
import { fetchMarketplace } from '@/data/listingsProvider'
import { getListings } from '@/services/listingsService'
import { formatCurrency, formatRelativeTime } from '@/utils/helpers'

const Home = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const DEBUG = new URLSearchParams(location.search).has('debug')
  const dlog = (...a: any[]) => { if (DEBUG) console.log('[HOME]', ...a); }
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [baseItems, setBaseItems] = useState<Item[]>([])
  const [featuredItems, setFeaturedItems] = useState<Item[]>([])
  const [featuredItem, setFeaturedItem] = useState<Item | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCondition, setSelectedCondition] = useState<string>('')
  const [pickup, setPickup] = useState<'any' | 'pickup' | 'delivery' | 'both'>('any')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [sort, setSort] = useState<'newest' | 'priceLow' | 'priceHigh'>('newest')
  
  // Fetch featured item (single featured item for hero section)
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const featured = await getListings({ featured: true, active: true, limitCount: 1 })
        if (featured.length > 0) {
          setFeaturedItem(featured[0])
          dlog('[HOME] Featured item loaded', featured[0])
        }
      } catch (err: any) {
        dlog('[HOME] Error fetching featured item', err)
      }
    }
    fetchFeatured()
  }, [])

  // Fetch all featured items
  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const featured = await getListings({ featured: true, active: true })
        setFeaturedItems(featured)
        dlog('[HOME] Featured items loaded', featured.length)
      } catch (err: any) {
        dlog('[HOME] Error fetching featured items', err)
      }
    }
    fetchFeaturedItems()
  }, [])

  // Read URL params on mount
  useEffect(() => {
    const qs = new URLSearchParams(location.search)
    const Q = qs.get('q') ?? ''
    const CAT = qs.get('cat') ?? 'all'
    const SORT = (qs.get('sort') ?? 'newest') as 'newest' | 'priceLow' | 'priceHigh'
    const MIN = qs.get('min') ?? ''
    const MAX = qs.get('max') ?? ''
    setSearchQuery(Q)
    setSelectedCategory(CAT)
    setSort(SORT)
    setMinPrice(MIN)
    setMaxPrice(MAX)
    dlog('query params → state', { Q, CAT, SORT, MIN, MAX })
  }, [])

  useEffect(() => {
    fetchMarketplace({ 
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      condition: selectedCondition !== 'Any Condition' ? selectedCondition : undefined,
      sort 
    })
      .then(result => {
        setBaseItems(result.items as any)
      })
      .catch((err: any) => import.meta.env.DEV && console.error('[Home] fetchMarketplace', err))
  }, [selectedCategory, selectedCondition, sort])

  const filteredItems = useMemo(() => {
    let results = [...baseItems]
    
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      results = results.filter(l =>
        (l.title ?? '').toLowerCase().includes(q) ||
        (l.description ?? '').toLowerCase().includes(q)
      )
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      results = results.filter(l => (l.category ?? '').toLowerCase() === selectedCategory.toLowerCase())
    }
    
    // price filters (numbers!)
    if (minPrice !== '') results = results.filter(l => l.price >= Number(minPrice))
    if (maxPrice !== '') results = results.filter(l => l.price <= Number(maxPrice))
    
    // pickup filter
    if (pickup !== 'any') {
      results = results.filter(l => {
        const m = ((l as any).pickupMethod ?? 'pickup')
        if (pickup === 'both') return m === 'both'
        return m === pickup
      })
    }
    
    // sorting
    if (sort === 'priceLow') results.sort((a, b) => a.price - b.price)
    else if (sort === 'priceHigh') results.sort((a, b) => b.price - a.price)
    else if (sort === 'newest') {
      results.sort((a, b) => ((b.createdAt as any)?.seconds ?? 0) - ((a.createdAt as any)?.seconds ?? 0))
    }
    
    // Filter result logged in debug mode if needed
    return results
  }, [baseItems, searchQuery, selectedCategory, pickup, minPrice, maxPrice, sort])

  return (
    <div>
      {/* Small Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
            Find Your Perfect Dorm Items
          </h1>
          <p className="text-lg md:text-xl text-primary-100 text-center">
            Browse items from fellow UL students and discover great deals on campus
          </p>
        </div>
      </div>

      {/* Featured Item Card */}
      {featuredItem && (
        <div className="container mx-auto px-4 py-6">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 border-2 border-primary-200 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-primary-600 fill-primary-600" />
              <h2 className="text-xl font-bold text-primary-900">Featured Item</h2>
            </div>
            <div 
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col md:flex-row"
              onClick={() => navigate(`/listing/${featuredItem.id}`)}
            >
              <div className="md:w-1/3 h-64 md:h-auto bg-gray-200 overflow-hidden">
                <img
                  src={featuredItem.images?.[0] || featuredItem.imageUrls?.[0] || '/api/placeholder/400/300'}
                  alt={featuredItem.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'
                  }}
                />
              </div>
              <div className="md:w-2/3 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 pr-4">{featuredItem.title}</h3>
                    <span className="text-3xl font-bold text-primary-600 whitespace-nowrap">
                      {formatCurrency(featuredItem.price)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">{featuredItem.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                      {featuredItem.category}
                    </span>
                    <span>{formatRelativeTime(featuredItem.posted)}</span>
                  </div>
                </div>
                <button 
                  className="btn-primary w-full md:w-auto self-start"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/listing/${featuredItem.id}`)
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header with view mode toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Search Items</h2>
          <div className="flex gap-2">
            <button
              className={`btn-secondary ${viewMode === 'grid' ? 'ring-1 ring-offset-1' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Grid size={16} />
            </button>
            <button
              className={`btn-secondary ${viewMode === 'list' ? 'ring-1 ring-offset-1' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        <SearchFiltersBar
          query={searchQuery}
          setQuery={setSearchQuery}
          category={selectedCategory}
          setCategory={setSelectedCategory}
          condition={selectedCondition}
          setCondition={setSelectedCondition}
          pickupMethod={pickup}
          setPickupMethod={(v) => setPickup(v as 'any' | 'pickup' | 'delivery' | 'both')}
          sortBy={sort === 'newest' ? SortOption.NEWEST : sort === 'priceLow' ? SortOption.PRICE_LOW_TO_HIGH : SortOption.PRICE_HIGH_TO_LOW}
          setSortBy={(v) => {
            if (v === SortOption.NEWEST) setSort('newest')
            else if (v === SortOption.PRICE_LOW_TO_HIGH) setSort('priceLow')
            else if (v === SortOption.PRICE_HIGH_TO_LOW) setSort('priceHigh')
          }}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
        />

        {/* Featured Items Section */}
        {featuredItems.length > 0 && (
          <div className="mt-8 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-primary-600 fill-primary-600" />
              <h3 className="text-xl font-semibold">Featured Items</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((listing: any) => {
                const cover = listing.imageUrls?.[0] || listing.images?.[0]
                return (
                  <div 
                    key={listing.id} 
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-primary-200 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/listing/${listing.id}`)}
                  >
                    <div className="relative">
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        {cover ? (
                          <img 
                            src={cover} 
                            alt={listing.title} 
                            className="w-full h-full object-cover" 
                            loading="lazy" 
                            referrerPolicy="no-referrer"
                            onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.visibility='hidden';}}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No image</div>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold">
                        <Star className="w-3 h-3 fill-white" />
                        Featured
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{listing.title}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">
                          {listing.category}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                          {listing.condition}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary-600">{formatCurrency(listing.price)}</span>
                        <button 
                          className="btn-primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/listing/${listing.id}`)
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Search Results Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Search Results</h3>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredItems.map((listing: any) => {
              const cover = listing.imageUrls?.[0] || listing.images?.[0]
              return (
                <div key={listing.id} className="bg-white rounded-xl shadow p-4">
                  <div className="aspect-video bg-gray-100 rounded mb-3 overflow-hidden">
                    {cover ? (
                      <img 
                        src={cover} 
                        alt={listing.title} 
                        className="h-full w-full object-cover rounded-xl" 
                        loading="lazy" 
                        referrerPolicy="no-referrer"
                        onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.visibility='hidden';}}
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="font-medium">{listing.title}</div>
                  <div className="text-sm text-gray-500">{formatCurrency(listing.price)}</div>
                  <button className="btn-primary mt-3" onClick={() => navigate(`/listing/${listing.id}`)}>
                    View
                  </button>
                </div>
              )
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="mt-10 text-center text-gray-500">
              <p>No items match your filters.</p>
              <button 
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('')
                  setSelectedCondition('')
                  setMinPrice('')
                  setMaxPrice('')
                  setSort('newest')
                  navigate('/')
                }}
                className="mt-4 btn-secondary"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
