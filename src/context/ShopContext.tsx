import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Item } from '../types'
import { formatCurrency } from '../utils/helpers'
import { useAuth } from './AuthContext'
import { userApi } from '../services/api'
import toast from 'react-hot-toast'

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
  const [dbUserId, setDbUserId] = useState<string | null>(null)
  const { isAuthenticated, user } = useAuth()

  const transformCartData = useCallback((cartData: any[]): Item[] => {
    return cartData.map((cartItem: any) => ({
      id: cartItem.id?.toString() || cartItem.listing_id?.toString() || '',
      title: cartItem.title || '',
      price: parseFloat(cartItem.price) || 0,
      description: cartItem.description || '',
      category: (cartItem.category as any) || 'other',
      images: cartItem.images || [],
      location: cartItem.location || '',
      condition: (cartItem.condition as any) || 'good',
      seller: {
        id: '',
        email: '',
        name: '',
        school: 'University of Louisiana',
        joinDate: new Date(),
        joinedDate: new Date().toISOString(),
        rating: 0,
        reviewCount: 0,
        totalSales: 0,
        isVerified: false
      },
      pickupAvailable: true,
      deliveryAvailable: false,
      createdAt: new Date(cartItem.createdAt || cartItem.created_at || Date.now()),
      updatedAt: new Date(cartItem.updatedAt || cartItem.updated_at || Date.now()),
      posted: new Date(cartItem.createdAt || cartItem.created_at || Date.now()).toISOString(),
      status: (cartItem.status as any) || 'active',
      views: cartItem.views || 0,
      likes: 0,
      isLiked: false,
      isInCart: true,
      isInWishlist: false,
      tags: []
    }))
  }, [])

  const transformWishlistData = useCallback((wishlistData: any[]): Item[] => {
    return wishlistData.map((item: any) => ({
      id: item.id?.toString() || '',
      title: item.title || '',
      price: parseFloat(item.price) || 0,
      description: item.description || '',
      category: (item.category as any) || 'other',
      images: item.images || [],
      location: item.location || '',
      condition: (item.condition as any) || 'good',
      seller: {
        id: '',
        email: '',
        name: '',
        school: 'University of Louisiana',
        joinDate: new Date(),
        joinedDate: new Date().toISOString(),
        rating: 0,
        reviewCount: 0,
        totalSales: 0,
        isVerified: false
      },
      pickupAvailable: true,
      deliveryAvailable: false,
      createdAt: new Date(item.createdAt || item.created_at || item.favoritedAt || Date.now()),
      updatedAt: new Date(item.updatedAt || item.updated_at || Date.now()),
      posted: new Date(item.createdAt || item.created_at || item.favoritedAt || Date.now()).toISOString(),
      status: (item.status as any) || 'active',
      views: item.views || 0,
      likes: 0,
      isLiked: false,
      isInCart: false,
      isInWishlist: true,
      tags: []
    }))
  }, [])

  const resolveDbUserId = useCallback(async (): Promise<string | null> => {
    if (!isAuthenticated || !user?.email) {
      return null
    }

    if (dbUserId) {
      return dbUserId
    }

    if (user?.dbId) {
      const idStr = user.dbId.toString()
      setDbUserId(idStr)
      return idStr
    }

    try {
      const dbUser = await userApi.getByEmail(user.email) as { id: number; email: string } | null
      if (dbUser?.id) {
        const derivedId = dbUser.id.toString()
        setDbUserId(derivedId)
        return derivedId
      }
    } catch (error) {
      console.error('Error resolving user by email:', error)
    }

    return null
  }, [dbUserId, isAuthenticated, user?.email, user?.dbId])

  const ensureDbUserId = useCallback(async (): Promise<string | null> => {
    const id = await resolveDbUserId()
    if (!id) {
      toast.error('User not found in database')
    }
    return id
  }, [resolveDbUserId])

  const reloadCartFromDb = useCallback(async (id: string) => {
    try {
      const updatedCartData = await userApi.getCart(id) as any[]
      if (Array.isArray(updatedCartData)) {
        setCartItems(transformCartData(updatedCartData))
      }
    } catch (reloadError) {
      console.error('Error reloading cart:', reloadError)
    }
  }, [transformCartData])

  const reloadWishlistFromDb = useCallback(async (id: string) => {
    try {
      const updatedWishlistData = await userApi.getFavorites(id) as any[]
      if (Array.isArray(updatedWishlistData)) {
        setWishlistItems(transformWishlistData(updatedWishlistData))
      }
    } catch (reloadError) {
      console.error('Error reloading wishlist:', reloadError)
    }
  }, [transformWishlistData])

  // Load cart and wishlist from database when user logs in
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated || !user?.email) {
        setCartItems([])
        setWishlistItems([])
        setDbUserId(null)
        return
      }

      const resolvedId = await resolveDbUserId()
      if (!resolvedId) {
        setCartItems([])
        setWishlistItems([])
        return
      }

      try {
        const [cartData, wishlistData] = await Promise.all([
          userApi.getCart(resolvedId) as Promise<any[]>,
          userApi.getFavorites(resolvedId) as Promise<any[]>
        ])

        if (Array.isArray(cartData)) {
          setCartItems(transformCartData(cartData))
        }
        if (Array.isArray(wishlistData)) {
          setWishlistItems(transformWishlistData(wishlistData))
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }

    loadUserData()
  }, [isAuthenticated, user?.email, user?.dbId, resolveDbUserId, transformCartData, transformWishlistData])

  const isInCart = useCallback((id: string) => cartItems.some(i => i.id === id), [cartItems])
  const isInWishlist = useCallback((id: string) => wishlistItems.some(i => i.id === id), [wishlistItems])

  const addToCart = useCallback(async (item: Item) => {
    console.log('addToCart called, isAuthenticated:', isAuthenticated)
    if (!isAuthenticated || !user?.email) {
      console.log('User not authenticated, showing login popup')
      setLoginPopupAction('cart')
      setShowLoginPopup(true)
      return
    }
    
    try {
      const id = await ensureDbUserId()
      if (!id) {
        return
      }

      await userApi.addToCart(id, item.id.toString(), 1)
      await reloadCartFromDb(id)
      
      const updatedWishlist = wishlistItems.filter(i => i.id !== item.id)
      setWishlistItems(updatedWishlist)
      
      if (wishlistItems.some(i => i.id === item.id)) {
        try {
          await userApi.removeFromFavorites(id, item.id.toString())
          await reloadWishlistFromDb(id)
        } catch (error) {
          console.error('Error removing from favorites:', error)
        }
      }
      
      setShowCart(true)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }, [isAuthenticated, user?.email, wishlistItems, ensureDbUserId, reloadCartFromDb, reloadWishlistFromDb])

  const addToWishlist = useCallback(async (item: Item) => {
    console.log('addToWishlist called, isAuthenticated:', isAuthenticated)
    if (!isAuthenticated || !user?.email) {
      console.log('User not authenticated, showing login popup')
      setLoginPopupAction('wishlist')
      setShowLoginPopup(true)
      return
    }
    
    try {
      const id = await ensureDbUserId()
      if (!id) {
        return
      }

      await userApi.addToFavorites(id, item.id.toString())
      await reloadWishlistFromDb(id)
      
      const updatedCart = cartItems.filter(i => i.id !== item.id)
      setCartItems(updatedCart)
      
      if (cartItems.some(i => i.id === item.id)) {
        try {
          await userApi.removeFromCart(id, item.id.toString())
          await reloadCartFromDb(id)
        } catch (error) {
          console.error('Error removing from cart:', error)
        }
      }
      
      setShowWishlist(true)
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast.error('Failed to add item to wishlist')
    }
  }, [isAuthenticated, user?.email, cartItems, ensureDbUserId, reloadWishlistFromDb, reloadCartFromDb])

  const removeFromCart = useCallback(async (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id))
    
    if (isAuthenticated && user?.email) {
      try {
        const resolvedId = await resolveDbUserId()
        if (resolvedId) {
          await userApi.removeFromCart(resolvedId, id)
        }
      } catch (error) {
        console.error('Error removing from cart in database:', error)
      }
    }
  }, [isAuthenticated, user?.email, resolveDbUserId])

  const removeFromWishlist = useCallback(async (id: string) => {
    setWishlistItems(prev => prev.filter(i => i.id !== id))
    
    if (isAuthenticated && user?.email) {
      try {
        const resolvedId = await resolveDbUserId()
        if (resolvedId) {
          await userApi.removeFromFavorites(resolvedId, id)
        }
      } catch (error) {
        console.error('Error removing from wishlist in database:', error)
      }
    }
  }, [isAuthenticated, user?.email, resolveDbUserId])

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


