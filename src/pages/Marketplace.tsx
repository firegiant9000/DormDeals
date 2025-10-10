import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Grid, List } from 'lucide-react'

const Marketplace = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - replace with actual data fetching
  const items = [
    {
      id: 1,
      title: 'MacBook Pro 13"',
      price: 800,
      category: 'Electronics',
      condition: 'Good',
      image: '/api/placeholder/300/200',
      seller: 'John Doe',
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Calculus Textbook',
      price: 50,
      category: 'Books',
      condition: 'Excellent',
      image: '/api/placeholder/300/200',
      seller: 'Sarah Smith',
      posted: '1 week ago'
    },
    {
      id: 3,
      title: 'Mini Fridge',
      price: 120,
      category: 'Appliances',
      condition: 'Good',
      image: '/api/placeholder/300/200',
      seller: 'Mike Johnson',
      posted: '3 days ago'
    },
    {
      id: 4,
      title: 'Coffee Maker',
      price: 35,
      category: 'Appliances',
      condition: 'Excellent',
      image: '/api/placeholder/300/200',
      seller: 'Emily Davis',
      posted: '5 days ago'
    }
  ]

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
            >
              <div className={`${viewMode === 'list' ? 'flex' : ''}`}>
                {/* Image */}
                <div className={`${viewMode === 'list' ? 'w-48 h-32' : 'h-48'} bg-gray-200 flex items-center justify-center`}>
                  <div className="text-gray-400">Image Placeholder</div>
                </div>

                {/* Content */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-2xl font-bold text-primary-600 mb-2">${item.price}</p>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{item.category}</span>
                    <span>{item.condition}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Sold by {item.seller}</p>
                    <p>{item.posted}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

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
