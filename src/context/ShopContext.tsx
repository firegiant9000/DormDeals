import React, { createContext, useContext, useMemo, useState } from 'react'
import { Item } from '../types'
import { formatCurrency } from '../utils/helpers'

type ShopContextValue = {
  cartItems: Item[]
  wishlistItems: Item[]
  showCart: boolean
  showWishlist: boolean
  addToCart: (item: Item) => void
  addToWishlist: (item: Item) => void
  removeFromCart: (id: string) => void
  removeFromWishlist: (id: string) => void
  openCart: () => void
  openWishlist: () => void
  closeCart: () => void
  closeWishlist: () => void
  isInCart: (id: string) => boolean
  isInWishlist: (id: string) => boolean
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined)

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<Item[]>([])
  const [wishlistItems, setWishlistItems] = useState<Item[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)

  const isInCart = (id: string) => cartItems.some(i => i.id === id)
  const isInWishlist = (id: string) => wishlistItems.some(i => i.id === id)

  const addToCart = (item: Item) => {
    setCartItems(prev => (prev.some(i => i.id === item.id) ? prev : [...prev, item]))
    // Ensure exclusivity: remove from wishlist if present
    setWishlistItems(prev => prev.filter(i => i.id !== item.id))
    setShowCart(true)
  }

  const addToWishlist = (item: Item) => {
    setWishlistItems(prev => (prev.some(i => i.id === item.id) ? prev : [...prev, item]))
    // Ensure exclusivity: remove from cart if present
    setCartItems(prev => prev.filter(i => i.id !== item.id))
    setShowWishlist(true)
  }

  const removeFromCart = (id: string) => setCartItems(prev => prev.filter(i => i.id !== id))
  const removeFromWishlist = (id: string) => setWishlistItems(prev => prev.filter(i => i.id !== id))

  const openCart = () => setShowCart(true)
  const openWishlist = () => setShowWishlist(true)
  const closeCart = () => setShowCart(false)
  const closeWishlist = () => setShowWishlist(false)

  const value = useMemo<ShopContextValue>(() => ({
    cartItems,
    wishlistItems,
    showCart,
    showWishlist,
    addToCart,
    addToWishlist,
    removeFromCart,
    removeFromWishlist,
    openCart,
    openWishlist,
    closeCart,
    closeWishlist,
    isInCart,
    isInWishlist
  }), [cartItems, wishlistItems, showCart, showWishlist])

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  )
}

export const useShop = (): ShopContextValue => {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}

// Global drawers component to render sidebars once at the app root
export const ShopDrawers: React.FC = () => {
  const { showCart, showWishlist, cartItems, wishlistItems, closeCart, closeWishlist, removeFromCart, removeFromWishlist, addToCart, addToWishlist, openCart, openWishlist } = useShop()
  return (
    <>
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-96 h-full shadow-xl overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
              <button onClick={closeCart} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Your cart is empty</div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(ci => (
                    <div key={ci.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{ci.title}</h3>
                        <p className="text-primary-600 font-semibold">{formatCurrency(ci.price)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => { addToWishlist(ci); closeCart(); openWishlist(); }}
                            className="text-primary-600 hover:text-primary-700 text-sm"
                          >
                            Move to Wishlist
                          </button>
                          <button
                            onClick={() => removeFromCart(ci.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showWishlist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-96 h-full shadow-xl overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Wishlist</h2>
              <button onClick={closeWishlist} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {wishlistItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Your wishlist is empty</div>
              ) : (
                <div className="space-y-4">
                  {wishlistItems.map(wi => (
                    <div key={wi.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{wi.title}</h3>
                        <p className="text-primary-600 font-semibold">{formatCurrency(wi.price)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => { addToCart(wi); closeWishlist(); openCart(); }}
                            className="text-primary-600 hover:text-primary-700 text-sm"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => removeFromWishlist(wi.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}


