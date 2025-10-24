import React from 'react'
import { useShop } from '../context/ShopContext'
import { formatCurrency } from '../utils/helpers'

interface CartSummaryProps {
  className?: string
}

const CartSummary: React.FC<CartSummaryProps> = ({ className = '' }) => {
  const { cartItems } = useShop()

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const fee = subtotal * 0.05 // 5% fee
  const total = subtotal + fee

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Order Summary</h3>
      
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
            {/* Item Image */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden shadow-sm">
                <img
                  src={item.images[0] || '/api/placeholder/64/64'}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </div>
            </div>
            
            {/* Item Details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 line-clamp-2 mb-2">
                {item.title}
              </h4>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {item.condition} • {item.category}
                </p>
                <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(item.price)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cartItems.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-slate-400">
          Your cart is empty
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-slate-400">Subtotal</span>
            <span className="text-gray-900 dark:text-slate-100">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-slate-400">Service Fee (5%)</span>
            <span className="text-gray-900 dark:text-slate-100">{formatCurrency(fee)}</span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
            <div className="flex justify-between text-base font-semibold">
              <span className="text-gray-900 dark:text-slate-100">Total</span>
              <span className="text-gray-900 dark:text-slate-100">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartSummary
