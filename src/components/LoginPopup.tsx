import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { X, LogIn, Heart, ShoppingCart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface LoginPopupProps {
  isOpen: boolean
  onClose: () => void
  action: 'cart' | 'wishlist'
}

const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose, action }) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleLogin = () => {
    onClose()
    navigate('/login')
  }

  const handleClose = () => {
    onClose()
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                {action === 'cart' ? (
                  <ShoppingCart className="w-8 h-8 text-primary-600" />
                ) : (
                  <Heart className="w-8 h-8 text-primary-600" />
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {action === 'cart' ? 'Add to Cart' : 'Add to Wishlist'}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {action === 'cart' 
                  ? 'You need to be logged in to add items to your cart.'
                  : 'You need to be logged in to add items to your wishlist.'
                }
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleLogin}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
              </div>

              {/* Additional Info */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Create an account to save items and track your orders
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default LoginPopup
