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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Ensure selection stays in sync with cart contents; default to selecting all items when cart opens/changes
  React.useEffect(() => {
    const next = new Set<string>()
    cartItems.forEach(ci => {
      // keep existing selection if present, otherwise select by default
      next.add(ci.id)
    })
    setSelectedIds(next)
  }, [cartItems, showCart])

  const totalSelected = useMemo(() => {
    return cartItems.reduce((sum, ci) => sum + (selectedIds.has(ci.id) ? ci.price : 0), 0)
  }, [cartItems, selectedIds])

  const wishlistTotal = useMemo(() => {
    return wishlistItems.reduce((sum, wi) => sum + wi.price, 0)
  }, [wishlistItems])

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <>
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" onClick={closeCart}>
          <div className="bg-white w-96 h-full shadow-xl overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
              <button onClick={closeCart} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex-1">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Your cart is empty</div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(ci => (
                    <div key={ci.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg items-start">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selectedIds.has(ci.id)}
                        onChange={() => toggleSelected(ci.id)}
                        aria-label={`Select ${ci.title} for checkout`}
                      />
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0" />
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
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-lg font-semibold text-gray-900">{formatCurrency(totalSelected)}</span>
              </div>
              <button
                disabled={selectedIds.size === 0}
                className="w-full btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  // Placeholder: implement checkout flow
                  alert(`Proceeding to checkout with ${selectedIds.size} item(s) totaling ${formatCurrency(totalSelected)}`)
                }}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {showWishlist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" onClick={closeWishlist}>
          <div className="bg-white w-96 h-full shadow-xl overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Wishlist</h2>
              <button onClick={closeWishlist} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex-1">
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
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-lg font-semibold text-gray-900">{formatCurrency(wishlistTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


