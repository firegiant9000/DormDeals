import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { useShop } from '@/context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/utils/helpers'

const CartDrawer: React.FC = () => {
  const { showCart, setShowCart, cartItems, removeFromCart } = useShop()
  const navigate = useNavigate()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on ESC key
  useEffect(() => {
    if (!showCart) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCart(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showCart, setShowCart])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (showCart) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showCart])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const fee = subtotal * 0.05 // 5% fee
  const total = subtotal + fee

  const handleCheckout = () => {
    setShowCart(false)
    navigate('/checkout')
  }

  const handleItemClick = (itemId: string) => {
    setShowCart(false)
    navigate(`/listing/${itemId}`)
  }

  return (
    <AnimatePresence>
      {showCart && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCart(false)}
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
                <ShoppingCart className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Shopping Cart
                </h2>
                {cartItems.length > 0 && (
                  <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add items to your cart to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    if (import.meta.env.DEV) {
                      console.log('[CART DRAWER ITEM]', item.id, item.title, {
                        images: item.images,
                        imageUrls: (item as any).imageUrls,
                      });
                    }
                    const imageUrl = (item as any).imageUrls?.[0] || item.images?.[0] || '/api/placeholder/200/200'
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
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              aria-label="Remove from cart"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer with Summary and Checkout */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Service Fee (5%)</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(fee)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer

