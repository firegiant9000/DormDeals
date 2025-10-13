import { motion } from 'framer-motion'
import { Search, Filter, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const ResultsPage = () => {
  // Mock search results - replace with actual data fetching
  const searchResults = [
    {
      id: 1,
      title: 'MacBook Pro 13"',
      price: 800,
      category: 'Electronics',
      condition: 'Good',
      image: '/api/placeholder/300/200',
      seller: 'John Doe',
      posted: '2 days ago',
      description: 'Selling my MacBook Pro, great condition, used for school work.'
    },
    {
      id: 2,
      title: 'Calculus Textbook',
      price: 50,
      category: 'Books',
      condition: 'Excellent',
      image: '/api/placeholder/300/200',
      seller: 'Sarah Smith',
      posted: '1 week ago',
      description: 'Calculus textbook in excellent condition, barely used.'
    },
    {
      id: 3,
      title: 'Mini Fridge',
      price: 120,
      category: 'Appliances',
      condition: 'Good',
      image: '/api/placeholder/300/200',
      seller: 'Mike Johnson',
      posted: '3 days ago',
      description: 'Compact mini fridge perfect for dorm rooms.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Results</h1>
          <p className="text-gray-600">Found {searchResults.length} items matching your search</p>
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
                defaultValue="laptop"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Filter Button */}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="text-gray-400">Image Placeholder</div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-2xl font-bold text-primary-600 mb-2">${item.price}</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{item.category}</span>
                  <span>{item.condition}</span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Sold by {item.seller}</p>
                  <p>{item.posted}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {searchResults.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsPage
