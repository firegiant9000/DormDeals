import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Share2, MessageCircle, User, MapPin } from 'lucide-react'
import React from 'react'
import { useShop } from '@/context/ShopContext'

const ItemDetail = () => {
  const { id } = useParams()
  console.log('Item ID:', id) // Use the id to avoid unused variable warning

  // Mock data - replace with actual data fetching
  const item = {
    id: 1,
    title: 'MacBook Pro 13" 2020',
    price: 800,
    originalPrice: 1200,
    category: 'Electronics',
    condition: 'Good',
    description: 'Selling my MacBook Pro 13" from 2020. It\'s been well taken care of and works perfectly. Comes with charger and original box. Perfect for students who need a reliable laptop for their studies.',
    images: ['/api/placeholder/600/400', '/api/placeholder/600/400', '/api/placeholder/600/400'],
    seller: {
      name: 'John Doe',
      rating: 4.8,
      itemsSold: 12,
      joinedDate: '2023-08-15',
      location: 'UL Campus'
    },
    posted: '2 days ago',
    tags: ['Laptop', 'Apple', 'Student', 'Computer']
  }

  const { addToCart, addToWishlist, isInCart, isInWishlist, openCart, openWishlist } = useShop()
  const handleAddToCart = () => { if (!isInCart(String(item.id))) addToCart(item as any); else openCart() }
  const handleAddToWishlist = () => { if (!isInWishlist(String(item.id))) addToWishlist(item as any); else openWishlist() }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
            >
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <div className="text-gray-400">Main Image Placeholder</div>
              </div>
              <div className="flex gap-2">
                {item.images.map((_, index) => (
                  <div key={index} className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                    <div className="text-xs text-gray-400">IMG</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed mb-4">{item.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              {/* Price and Actions */
              }
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
                  <div className="flex gap-2">
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-primary-600">${item.price}</span>
                  <span className="text-lg text-gray-500 line-through">${item.originalPrice}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    Save ${item.originalPrice - item.price}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Condition:</span>
                    <span className="font-medium">{item.condition}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Posted:</span>
                    <span className="font-medium">{item.posted}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isInCart(String(item.id))}
                    className={`w-full py-3 text-lg ${isInCart(String(item.id)) ? 'btn-disabled cursor-not-allowed bg-gray-300 text-gray-600' : 'btn-primary'}`}
                  >
                    {isInCart(String(item.id)) ? 'In Cart' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleAddToWishlist}
                    disabled={isInWishlist(String(item.id))}
                    className={`w-full py-3 ${isInWishlist(String(item.id)) ? 'btn-disabled cursor-not-allowed border-gray-200 text-gray-400' : 'btn-outline'}`}
                  >
                    {isInWishlist(String(item.id)) ? 'In Wishlist' : 'Add to Wishlist'}
                  </button>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.seller.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <span>⭐ {item.seller.rating}</span>
                      <span>•</span>
                      <span>{item.seller.itemsSold} items sold</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{item.seller.location}</span>
                    </div>
                  </div>
                </div>
                <button className="w-full btn-secondary">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Seller
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Global drawers are rendered at App root via ShopDrawers */}
    </div>
  )
}

export default ItemDetail
