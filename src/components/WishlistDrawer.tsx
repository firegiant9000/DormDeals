import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Trash2, ShoppingCart } from 'lucide-react'
import { useShop } from '@/context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/utils/helpers'

const WishlistDrawer: React.FC = () => {
  const { showWishlist, setShowWishlist, wishlistItems, removeFromWishlist, addToCart } = useShop()
  const navigate = useNavigate()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on ESC key
  useEffect(() => {
    if (!showWishlist) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowWishlist(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showWishlist, setShowWishlist])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (showWishlist) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showWishlist])

  const handleItemClick = (itemId: string) => {
    setShowWishlist(false)
    navigate(`/listing/${itemId}`)
  }

  const handleAddToCart = async (item: typeof wishlistItems[0], e: React.MouseEvent) => {
    e.stopPropagation()
    await addToCart(item)
  }

  return (
    <AnimatePresence>
      {showWishlist && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowWishlist(false)}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              mass: 0.8
            }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Wishlist
                </h2>
                {wishlistItems.length > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowWishlist(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close wishlist"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Wishlist Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Your wishlist is empty
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add items to your wishlist to save them for later
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlistItems.map((item) => {
                    const imageUrl = item.images?.[0] || '/api/placeholder/200/200'
                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div
                          className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                          onClick={() => handleItemClick(item.id)}
                        >
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-medium text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400"
                            onClick={() => handleItemClick(item.id)}
                          >
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {item.category} • {item.condition}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                              {formatCurrency(item.price)}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleAddToCart(item, e)}
                                className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                aria-label="Add to cart"
                                title="Add to cart"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeFromWishlist(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                aria-label="Remove from wishlist"
                              >
                                <Trash2 className="w-4 h-4" />
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default WishlistDrawer

