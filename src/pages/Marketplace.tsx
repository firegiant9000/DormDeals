import { useEffect, useMemo, useState } from 'react'
import { Grid, List } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/utils/helpers'
import { Item, SortOption } from '@/types'
import SearchFiltersBar from '@/components/SearchFiltersBar'
import { fetchListings, subscribeListings } from '@/data/listingsProvider'

const getMillis = (d: any): number => {
  if (!d) return 0
  if (typeof d?.toMillis === 'function') return d.toMillis()
  if (d instanceof Date) return d.getTime()
  return 0
}

const Marketplace = () => {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sort, setSort] = useState<'newest' | 'priceLow' | 'priceHigh'>('newest')
  const [baseItems, setBaseItems] = useState<Item[]>([])

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
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      items = items.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
    }
    if (selectedCategory) {
      items = items.filter(i => i.category === selectedCategory)
    }
    if (sort === 'newest') {
      items = items.sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt))
    } else if (sort === 'priceLow') {
      items = items.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    } else if (sort === 'priceHigh') {
      items = items.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    }
    return items
  }, [baseItems, searchQuery, selectedCategory, sort])

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
        condition=""
        setCondition={() => {}}
        pickupMethod=""
        setPickupMethod={() => {}}
        sortBy={sort === 'newest' ? SortOption.NEWEST : sort === 'priceLow' ? SortOption.PRICE_LOW_TO_HIGH : SortOption.PRICE_HIGH_TO_LOW}
        setSortBy={(v) => {
          if (v === SortOption.NEWEST) setSort('newest')
          else if (v === SortOption.PRICE_LOW_TO_HIGH) setSort('priceLow')
          else if (v === SortOption.PRICE_HIGH_TO_LOW) setSort('priceHigh')
        }}
        minPrice=""
        setMinPrice={() => {}}
        maxPrice=""
        setMaxPrice={() => {}}
      />

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6' : 'space-y-4 mt-6'}>
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow p-4">
            <div className="aspect-video bg-gray-100 rounded mb-3" />
            <div className="font-medium">{item.title}</div>
            <div className="text-sm text-gray-500">{formatCurrency(item.price ?? 0)}</div>
            <button className="btn-primary mt-3" onClick={() => navigate(`/listing/${item.id}`)}>
              View
            </button>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="mt-10 text-center text-gray-500">No items match your filters.</div>
      )}
    </div>
  )
}

export default Marketplace
