import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Star, Calendar, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

const MainFeaturePage = () => {
  const { feature } = useParams()
  
  // Mock feature data - replace with actual data fetching based on feature param
  const featureData = {
    'electronics': {
      title: 'Electronics Marketplace',
      description: 'Find and sell electronics from fellow UL students',
      items: [
        {
          id: 1,
          title: 'MacBook Pro 13"',
          price: 800,
          condition: 'Good',
          seller: 'John Doe',
          posted: '2 days ago',
          rating: 4.8
        },
        {
          id: 2,
          title: 'iPhone 13',
          price: 450,
          condition: 'Excellent',
          seller: 'Sarah Smith',
          posted: '1 week ago',
          rating: 4.9
        },
        {
          id: 3,
          title: 'Gaming Laptop',
          price: 1200,
          condition: 'Good',
          seller: 'Mike Johnson',
          posted: '3 days ago',
          rating: 4.7
        }
      ]
    },
    'textbooks': {
      title: 'Textbook Exchange',
      description: 'Buy and sell textbooks with fellow students',
      items: [
        {
          id: 4,
          title: 'Calculus Textbook',
          price: 50,
          condition: 'Excellent',
          seller: 'Emily Davis',
          posted: '5 days ago',
          rating: 4.9
        },
        {
          id: 5,
          title: 'Chemistry Lab Manual',
          price: 25,
          condition: 'Good',
          seller: 'David Wilson',
          posted: '2 weeks ago',
          rating: 4.6
        }
      ]
    },
    'furniture': {
      title: 'Furniture & Dorm Essentials',
      description: 'Furnish your dorm with items from graduating students',
      items: [
        {
          id: 6,
          title: 'Mini Fridge',
          price: 120,
          condition: 'Good',
          seller: 'Lisa Brown',
          posted: '1 week ago',
          rating: 4.8
        },
        {
          id: 7,
          title: 'Desk Chair',
          price: 80,
          condition: 'Excellent',
          seller: 'Tom Anderson',
          posted: '4 days ago',
          rating: 4.9
        }
      ]
    }
  }

  const currentFeature = featureData[feature as keyof typeof featureData] || {
    title: 'Feature Not Found',
    description: 'This feature page is not available yet',
    items: []
  }

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
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            {currentFeature.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-gray-600"
          >
            {currentFeature.description}
          </motion.p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{currentFeature.items.length}</div>
                <div className="text-sm text-gray-600">Active Listings</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">4.8</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">UL</div>
                <div className="text-sm text-gray-600">Campus Community</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Items Grid */}
        {currentFeature.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentFeature.items.map((item, index) => (
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
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{item.condition}</span>
                  </div>

                  <div className="text-sm text-gray-500 mb-2">
                    <p>Sold by {item.seller}</p>
                    <p>{item.posted}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">This feature is under development. Check back soon!</p>
          </motion.div>
        )}

        {/* CTA Section */}
        {currentFeature.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Don't see what you're looking for?
              </h2>
              <p className="text-gray-600 mb-6">
                Browse our full marketplace or create a listing to sell your items.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/marketplace"
                  className="bg-primary-600 text-white hover:bg-primary-700 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Browse Marketplace
                </Link>
                <Link
                  to="/create-listing"
                  className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Create Listing
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default MainFeaturePage
