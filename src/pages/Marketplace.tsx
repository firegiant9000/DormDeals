import { useEffect, useMemo, useState } from 'react'
import { Grid, List } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { formatCurrency } from '@/utils/helpers'
import { Item, SortOption } from '@/types'
import SearchFiltersBar from '@/components/SearchFiltersBar'
import { fetchListings, subscribeListings } from '@/data/listingsProvider'
import { isDebug } from '@/utils/debug'

const Marketplace = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [baseItems, setBaseItems] = useState<Item[]>([])
  
  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('q') || ''
    const cat = params.get('cat') || ''
    const sortParam = params.get('sort') || 'newest'
    const min = params.get('min') || ''
    const max = params.get('max') || ''
    
    setSearchQuery(q)
    setSelectedCategory(cat)
    setSort(sortParam as 'newest' | 'priceLow' | 'priceHigh')
    setMinPrice(min)
    setMaxPrice(max)
  }, [location.search])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCondition, setSelectedCondition] = useState<string>('')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [sort, setSort] = useState<'newest' | 'priceLow' | 'priceHigh'>('newest')

  useEffect(() => {
    fetchListings({ limitN: 100 })
      .then(setBaseItems)
      .catch(err => import.meta.env.DEV && console.error('[Marketplace] fetchListings', err))
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeListings(
      items => setBaseItems(items),
      err => import.meta.env.DEV && console.error('[Marketplace] subscribeListings', err)
    )
    return unsubscribe
  }, [])

  const filteredItems = useMemo(() => {
    let items = [...baseItems]
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      items = items.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
    }
    
    // Category filter
    if (selectedCategory && selectedCategory !== 'All Categories' && selectedCategory !== 'all') {
      items = items.filter(i => i.category === selectedCategory)
    }
    
    // Condition filter
    if (selectedCondition && selectedCondition !== 'Any Condition') {
      items = items.filter(i => i.condition === selectedCondition)
    }
    
    // Price filters - safe number parsing
    const minN = Number.isFinite(Number(minPrice)) ? Number(minPrice) : undefined
    const maxN = Number.isFinite(Number(maxPrice)) ? Number(maxPrice) : undefined
    
    items = items.filter(i => {
      const price = Number(i.price)
      if (!Number.isFinite(price)) return false
      if (minN !== undefined && price < minN) return false
      if (maxN !== undefined && price > maxN) return false
      return true
    })
    
    // Sort
    if (sort === 'priceLow') {
      items.sort((a, b) => Number(a.price) - Number(b.price))
    } else if (sort === 'priceHigh') {
      items.sort((a, b) => Number(b.price) - Number(a.price))
    } else {
      // newest
      items.sort((a, b) => {
        const getMillis = (d: any): number => {
          if (!d) return 0
          if (typeof d?.toMillis === 'function') return d.toMillis()
          if (d instanceof Date) return d.getTime()
          if (d?.seconds) return d.seconds * 1000
          return 0
        }
        return getMillis(b.createdAt) - getMillis(a.createdAt)
      })
    }
    
    if (isDebug()) {
      console.log('[MARKET] filters', { 
        q: searchQuery, 
        category: selectedCategory, 
        sort, 
        minPrice, 
        maxPrice, 
        baseCount: baseItems.length, 
        afterCount: items.length 
      })
    }
    return items
  }, [baseItems, searchQuery, selectedCategory, selectedCondition, minPrice, maxPrice, sort])

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
        pickupMethod=""
        setPickupMethod={() => {}}
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
        {filteredItems.map(item => {
          const img = item.images?.[0] || (item as any).imageUrls?.[0]
          return (
            <div key={item.id} className="bg-white rounded-xl shadow p-4">
              <div className="aspect-video bg-gray-100 rounded mb-3 overflow-hidden">
                {img ? (
                  <img 
                    src={img} 
                    alt={item.title} 
                    className="h-full w-full object-cover" 
                    loading="lazy" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="h-full w-full bg-muted/20" />
                )}
              </div>
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-gray-500">{formatCurrency(item.price ?? 0)}</div>
              <button className="btn-primary mt-3" onClick={() => navigate(`/listing/${item.id}`)}>
                View
              </button>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && baseItems.length > 0 && (
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
      
      {filteredItems.length === 0 && baseItems.length === 0 && (
        <div className="mt-10 text-center text-gray-500">No listings available yet.</div>
      )}
    </div>
  )
}

export default Marketplace
