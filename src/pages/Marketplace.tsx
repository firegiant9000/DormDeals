import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/utils/helpers'
import { useShop } from '@/context/ShopContext'
import type { Item } from '../types'
import { fetchListings, subscribeListings } from '@/data/listingsProvider'

const Marketplace: React.FC = () => {
  const navigate = useNavigate()
  const { addToCart, addToWishlist, isInCart, isInWishlist } = useShop()

  const [baseItems, setBaseItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchListings({ limitN: 100 })
      .then(setBaseItems)
      .catch(err => {
        if (import.meta.env.DEV) console.error('[Marketplace] fetchListings failed', err)
      })
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeListings(
      items => setBaseItems(items),
      err => {
        if (import.meta.env.DEV) console.error('[Marketplace] subscribe error', err)
      }
    )
    return unsubscribe
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    baseItems.forEach(i => set.add(i.category))
    return Array.from(set).sort()
  }, [baseItems])

  const filteredItems = useMemo(() => {
    let items = [...baseItems]

    if (selectedCategory) items = items.filter(i => i.category === selectedCategory)

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      items = items.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          (i.description ?? '').toLowerCase().includes(q)
      )
    }

    // Newest first (if timestamps exist)
    items.sort((a, b) => {
      const ta = (a as any).createdAt?.toMillis?.() ?? 0
      const tb = (b as any).createdAt?.toMillis?.() ?? 0
      return tb - ta
    })

    return items
  }, [baseItems, searchQuery, selectedCategory])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Marketplace</h1>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search items…"
          className="rounded-md border px-3 py-2"
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="rounded-md border px-3 py-2"
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          className="rounded-md border px-3 py-2"
          onClick={() => {
            setSearchQuery('')
            setSelectedCategory('')
          }}
        >
          Reset filters
        </button>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center text-gray-600 py-16">No items match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => {
            const imgSrc =
              (item as any).image ||
              (item as any).imageUrl ||
              (item as any).thumbnail ||
              (item as any).imageUrls?.[0]

            return (
              <div
                key={item.id}
                className="rounded-xl border overflow-hidden bg-white shadow-sm flex flex-col"
              >
                <div
                  className="aspect-video bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/listing/${item.id}`)}
                  title={item.title}
                >
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="font-medium line-clamp-1">{item.title}</div>
                  <div className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {item.description}
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="text-lg font-semibold">
                      {formatCurrency(Number(item.price) || 0)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="rounded-md border px-3 py-1 text-sm"
                        onClick={() => addToWishlist(item)}
                        disabled={isInWishlist(item.id)}
                        title={isInWishlist(item.id) ? 'In wishlist' : 'Add to wishlist'}
                      >
                        {isInWishlist(item.id) ? 'Wishlisted' : 'Wishlist'}
                      </button>
                      <button
                        className="rounded-md border px-3 py-1 text-sm"
                        onClick={() => addToCart(item)}
                        disabled={isInCart(item.id)}
                        title={isInCart(item.id) ? 'In cart' : 'Add to cart'}
                      >
                        {isInCart(item.id) ? 'In cart' : 'Add to cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Marketplace
