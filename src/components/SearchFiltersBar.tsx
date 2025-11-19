import React from 'react'
import { Filter } from 'lucide-react'
import { ItemCondition, PickupMethod, SortOption } from '../types'

type Props = {
  query: string
  setQuery: (v: string) => void
  category: string
  setCategory: (v: string) => void
  condition: string
  setCondition: (v: string) => void
  pickupMethod: string
  setPickupMethod: (v: string) => void
  sortBy: SortOption
  setSortBy: (v: SortOption) => void
  minPrice: string
  setMinPrice: (v: string) => void
  maxPrice: string
  setMaxPrice: (v: string) => void
  onReset?: () => void
}

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

const SearchFiltersBar: React.FC<Props> = ({
  query,
  setQuery,
  category,
  setCategory,
  condition,
  setCondition,
  pickupMethod,
  setPickupMethod,
  sortBy,
  setSortBy,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onReset
}) => {
  const handleReset = () => {
    setCategory('')
    setCondition('')
    setPickupMethod('')
    setMinPrice('')
    setMaxPrice('')
    setQuery('')
    setSortBy(SortOption.RELEVANCE)
    onReset?.()
  }

  return (
    <div className="dd-card bg-surface-3 text-body rounded-2xl p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search within results..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="dd-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="dd-input"
          >
            <option value="">All Categories</option>
            {CATEGORY_LABELS.map(lbl => (
              <option key={lbl} value={lbl}>{lbl}</option>
            ))}
          </select>

          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="dd-input"
          >
            <option value="">Any Condition</option>
            {Object.values(ItemCondition).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={pickupMethod}
            onChange={(e) => setPickupMethod(e.target.value)}
            className="dd-input"
          >
            <option value="">Any Pickup Method</option>
            {Object.values(PickupMethod).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="dd-input"
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
            className="dd-input"
            min="0"
            step="0.01"
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="dd-input"
            min="0"
            step="0.01"
          />
          <button
            onClick={handleReset}
            className="col-span-2 sm:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 border border-surface rounded-xl hover:border-primary-500 hover:text-primary-600 transition-colors bg-surface text-body"
          >
            <Filter className="w-4 h-4" />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  )
}

export default SearchFiltersBar


