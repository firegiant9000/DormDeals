import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Item } from '../types'
import { formatCurrency } from '../utils/helpers'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'
import { getCartItems, addToCart as addToCartService, removeFromCart as removeFromCartService } from '../services/cartService'
import { getFavorites, addToFavorites as addToFavoritesService, removeFromFavorites as removeFromFavoritesService } from '../services/favoritesService'

type ShopContextValue = {
  cartItems: Item[]
  wishlistItems: Item[]
  showCart: boolean
  showWishlist: boolean
  showLoginPopup: boolean
  loginPopupAction: 'cart' | 'wishlist' | null
  addToCart: (item: Item) => void
  addToWishlist: (item: Item) => void
  removeFromCart: (id: string) => void
  removeFromWishlist: (id: string) => void
  openCart: () => void
  openWishlist: () => void
  closeCart: () => void
  closeWishlist: () => void
  closeLoginPopup: () => void
  isInCart: (id: string) => boolean
  isInWishlist: (id: string) => boolean
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined)

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<Item[]>([])
  const [wishlistItems, setWishlistItems] = useState<Item[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [loginPopupAction, setLoginPopupAction] = useState<'cart' | 'wishlist' | null>(null)
  const { isAuthenticated, user } = useAuth()



  // Load cart and wishlist from Firestore when user logs in
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated || !user?.id) {
        setCartItems([])
        setWishlistItems([])
        return
      }

      const userId = user.id

      try {
        // Load cart items from Firestore
        try {
          const cartItems = await getCartItems(userId)
          setCartItems(cartItems.map(item => ({ ...item, isInCart: true, isInWishlist: false })))
        } catch (error: any) {
          console.error('Error loading cart from Firestore:', error)
        }

        // Load wishlist items from Firestore
        try {
          const wishlistItems = await getFavorites(userId)
          setWishlistItems(wishlistItems.map(item => ({ ...item, isInCart: false, isInWishlist: true })))
        } catch (error: any) {
          console.error('Error loading wishlist from Firestore:', error)
        }
      } catch (error: any) {
        console.error('Error loading user data:', error)
      }
    }

    loadUserData()
  }, [isAuthenticated, user?.id])

  const isInCart = useCallback((id: string | number) => {
    const idStr = String(id)
    return cartItems.some(i => String(i.id) === idStr)
  }, [cartItems])
  const isInWishlist = useCallback((id: string | number) => {
    const idStr = String(id)
    return wishlistItems.some(i => String(i.id) === idStr)
  }, [wishlistItems])

  const addToCart = useCallback(async (item: Item) => {
    console.log('addToCart called, isAuthenticated:', isAuthenticated, 'user:', user?.id, 'item:', item.id)
    if (!isAuthenticated || !user?.id) {
      console.log('User not authenticated, showing login popup')
      setLoginPopupAction('cart')
      setShowLoginPopup(true)
      return
    }
    
    if (!item || !item.id) {
      console.error('Invalid item provided to addToCart:', item)
      toast.error('Invalid item. Please try again.')
      return
    }
    
    try {
      const userId = user.id
      const listingId = item.id.toString()
      
      console.log('Adding to cart - userId:', userId, 'listingId:', listingId)

      // Save to Firestore
      await addToCartService(userId, listingId, 1)
      console.log('Successfully added to cart in Firestore')
      
      // Reload cart from Firestore to get the latest state
      try {
        const updatedCartItems = await getCartItems(userId)
        console.log('Reloaded cart items:', updatedCartItems.length)
        setCartItems(updatedCartItems.map(cartItem => ({ ...cartItem, isInCart: true, isInWishlist: false })))
      } catch (reloadError: any) {
        console.error('Error reloading cart:', reloadError)
        // Fallback to local update if reload fails
        setCartItems(prev => (prev.some(i => i.id === item.id) ? prev : [...prev, { ...item, isInCart: true, isInWishlist: false }]))
      }
      
      // Ensure exclusivity: remove from wishlist if present
      if (wishlistItems.some(i => i.id === item.id)) {
        const updatedWishlist = wishlistItems.filter(i => i.id !== item.id)
        setWishlistItems(updatedWishlist)
        
        // Remove from wishlist in Firestore
        try {
          await removeFromFavoritesService(userId, listingId)
        } catch (error: any) {
          console.error('Error removing from favorites:', error)
        }
      }
      
      toast.success('Item added to cart')
      setShowCart(true)
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack
      })
      const errorMessage = error?.message || 'Failed to add item to cart'
      toast.error(errorMessage)
    }
  }, [isAuthenticated, user?.id, wishlistItems])

  const addToWishlist = useCallback(async (item: Item) => {
    console.log('addToWishlist called, isAuthenticated:', isAuthenticated, 'user:', user?.id, 'item:', item.id)
    if (!isAuthenticated || !user?.id) {
      console.log('User not authenticated, showing login popup')
      setLoginPopupAction('wishlist')
      setShowLoginPopup(true)
      return
    }
    
    if (!item || !item.id) {
      console.error('Invalid item provided to addToWishlist:', item)
      toast.error('Invalid item. Please try again.')
      return
    }
    
    try {
      const userId = user.id
      const listingId = item.id.toString()
      
      console.log('Adding to wishlist - userId:', userId, 'listingId:', listingId)

      // Save to Firestore
      await addToFavoritesService(userId, listingId)
      console.log('Successfully added to wishlist in Firestore')
      
      // Reload wishlist from Firestore to get the latest state
      try {
        const updatedWishlistItems = await getFavorites(userId)
        console.log('Reloaded wishlist items:', updatedWishlistItems.length)
        setWishlistItems(updatedWishlistItems.map(wishlistItem => ({ ...wishlistItem, isInCart: false, isInWishlist: true })))
      } catch (reloadError: any) {
        console.error('Error reloading wishlist:', reloadError)
        // Fallback to local update if reload fails
        setWishlistItems(prev => (prev.some(i => i.id === item.id) ? prev : [...prev, { ...item, isInCart: false, isInWishlist: true }]))
      }
      
      // Ensure exclusivity: remove from cart if present
      if (cartItems.some(i => i.id === item.id)) {
        const updatedCart = cartItems.filter(i => i.id !== item.id)
        setCartItems(updatedCart)
        
        // Remove from cart in Firestore
        try {
          await removeFromCartService(userId, listingId)
        } catch (error: any) {
          console.error('Error removing from cart:', error)
        }
      }
      
      toast.success('Item added to wishlist')
      setShowWishlist(true)
    } catch (error: any) {
      console.error('Error adding to wishlist:', error)
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack
      })
      const errorMessage = error?.message || 'Failed to add item to wishlist'
      toast.error(errorMessage)
    }
  }, [isAuthenticated, user?.id, cartItems])

  const removeFromCart = useCallback(async (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id))
    
    if (isAuthenticated && user?.id) {
      try {
        await removeFromCartService(user.id, id)
      } catch (error: any) {
        console.error('Error removing from cart in Firestore:', error)
        // Revert local state on error
        const updatedCartItems = await getCartItems(user.id)
        setCartItems(updatedCartItems.map(item => ({ ...item, isInCart: true, isInWishlist: false })))
      }
    }
  }, [isAuthenticated, user?.id])

  const removeFromWishlist = useCallback(async (id: string) => {
    setWishlistItems(prev => prev.filter(i => i.id !== id))
    
    if (isAuthenticated && user?.id) {
      try {
        await removeFromFavoritesService(user.id, id)
      } catch (error: any) {
        console.error('Error removing from wishlist in Firestore:', error)
        // Revert local state on error
        const updatedWishlistItems = await getFavorites(user.id)
        setWishlistItems(updatedWishlistItems.map(item => ({ ...item, isInCart: false, isInWishlist: true })))
      }
    }
  }, [isAuthenticated, user?.id])

  const openCart = () => setShowCart(true)
  const openWishlist = () => setShowWishlist(true)
  const closeCart = () => setShowCart(false)
  const closeWishlist = () => setShowWishlist(false)
  const closeLoginPopup = () => {
    setShowLoginPopup(false)
    setLoginPopupAction(null)
  }

  const value = useMemo<ShopContextValue>(() => ({
    cartItems,
    wishlistItems,
    showCart,
    showWishlist,
    showLoginPopup,
    loginPopupAction,
    addToCart,
    addToWishlist,
    removeFromCart,
    removeFromWishlist,
    openCart,
    openWishlist,
    closeCart,
    closeWishlist,
    closeLoginPopup,
    isInCart,
    isInWishlist
  }), [cartItems, wishlistItems, showCart, showWishlist, showLoginPopup, loginPopupAction, isInCart, isInWishlist, addToCart, addToWishlist, removeFromCart, removeFromWishlist])

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
  const navigate = useNavigate()
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
          <div className="bg-white dark:bg-slate-900 w-96 h-full shadow-xl overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Shopping Cart</h2>
              <button onClick={closeCart} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex-1">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400">Your cart is empty</div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(ci => (
                    <div key={ci.id} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg items-start">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selectedIds.has(ci.id)}
                        onChange={() => toggleSelected(ci.id)}
                        aria-label={`Select ${ci.title} for checkout`}
                      />
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm line-clamp-2">{ci.title}</h3>
                        <p className="text-primary-600 dark:text-primary-400 font-semibold">{formatCurrency(ci.price)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => { addToWishlist(ci); closeCart(); openWishlist(); }}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm"
                          >
                            Move to Wishlist
                          </button>
                          <button
                            onClick={() => removeFromCart(ci.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
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
            <div className="p-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600 dark:text-slate-400">Total</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-slate-100">{formatCurrency(totalSelected)}</span>
              </div>
              <button
                disabled={selectedIds.size === 0}
                className="w-full btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  // Close the cart drawer and navigate to checkout page
                  closeCart()
                  navigate('/checkout')
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
          <div className="bg-white dark:bg-slate-900 w-96 h-full shadow-xl overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Wishlist</h2>
              <button onClick={closeWishlist} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex-1">
              {wishlistItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400">Your wishlist is empty</div>
              ) : (
                <div className="space-y-4">
                  {wishlistItems.map(wi => (
                    <div key={wi.id} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm line-clamp-2">{wi.title}</h3>
                        <p className="text-primary-600 dark:text-primary-400 font-semibold">{formatCurrency(wi.price)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => { addToCart(wi); closeWishlist(); openCart(); }}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => removeFromWishlist(wi.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
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
            <div className="p-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">Total</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-slate-100">{formatCurrency(wishlistTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


