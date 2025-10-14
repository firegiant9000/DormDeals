import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Grid, List, Heart, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { mockItems } from '../data/mockData'
import { formatCurrency } from '../utils/helpers'
import { useShop } from '@/context/ShopContext'

const Marketplace = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const { addToCart, addToWishlist, removeFromCart, removeFromWishlist, isInCart, isInWishlist } = useShop()
  const navigate = useNavigate()

  // Use app-wide mock items for richer data and images
  const items = mockItems

  const categories = ['All', 'Electronics', 'Books', 'Appliances', 'Furniture', 'Clothing']

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
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:border-primary-500 hover:text-primary-600 whitespace-nowrap transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
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
        </div>

        {/* Items Grid/List */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {items.map((item, index) => (
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
        {items.length === 0 && (
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
