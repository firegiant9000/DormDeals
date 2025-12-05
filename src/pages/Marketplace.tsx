import { useEffect, useMemo, useState } from 'react'
import { Grid, List } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Item, SortOption } from '@/types'
import SearchFiltersBar from '@/components/SearchFiltersBar'
import { fetchListings, subscribeListings } from '@/data/listingsProvider'
import { normalizeListing } from '@/utils/normalizers'

const Marketplace = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const DEBUG = new URLSearchParams(location.search).has('debug')
  const dlog = (...a: any[]) => { if (DEBUG) console.log('[MARKET]', ...a); }
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [baseItems, setBaseItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCondition, setSelectedCondition] = useState<string>('')
  const [pickup, setPickup] = useState<'any' | 'pickup' | 'delivery' | 'both'>('any')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [sort, setSort] = useState<'newest' | 'priceLow' | 'priceHigh'>('newest')
  
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
    fetchListings({ limitN: 100 })
      .then(items => {
        const normalized = items.map(item => normalizeListing(item as any))
        setBaseItems(normalized as any)
      })
      .catch(err => import.meta.env.DEV && console.error('[Marketplace] fetchListings', err))
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeListings(
      items => {
        const normalized = items.map(item => normalizeListing(item as any))
        setBaseItems(normalized as any)
      },
      err => import.meta.env.DEV && console.error('[Marketplace] subscribeListings', err)
    )
    return unsubscribe
  }, [])

  const filteredItems = useMemo(() => {
    let results = baseItems.map(item => normalizeListing(item as any))
    
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Marketplace</h1>
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

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6' : 'space-y-4 mt-6'}>
        {filteredItems.map(listing => {
          const cover = listing.imageUrls?.[0]
          return (
            <div key={listing.id} className="bg-white rounded-xl shadow p-4">
              <div className="aspect-video bg-gray-100 rounded mb-3 overflow-hidden">
                {cover ? (
                  <img 
                    src={cover} 
                    alt={listing.title} 
                    className="w-full h-56 object-cover rounded-xl" 
                    loading="lazy" 
                    referrerPolicy="no-referrer"
                    onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.visibility='hidden';}}
                  />
                ) : (
                  <div className="skeleton h-48 w-full" />
                )}
              </div>
              <div className="font-medium">{listing.title}</div>
              <div className="text-sm text-gray-500">{listing.price.toFixed(2)}</div>
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
              navigate('/marketplace')
            }}
            className="mt-4 btn-secondary"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default Marketplace
