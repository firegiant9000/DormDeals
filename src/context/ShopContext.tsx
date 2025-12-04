import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Item } from '@/types'
import { formatCurrency } from '@/utils/helpers'
import { useAuth } from './AuthContext'
import { useCartWishlist } from '@/hooks/useCommerce'
import {
  addToCart as addToCartService,
  removeFromCart as removeFromCartService,
  addToWishlist as addToWishlistService,
  removeFromWishlist as removeFromWishlistService,
} from '@/services/commerceService'
import { fetchListings } from '@/data/listingsProvider'

type ShopContextValue = {
  cartItems: Item[]
  wishlistItems: Item[]
  showCart: boolean
  showWishlist: boolean
  addToCart: (item: Item) => Promise<void>
  addToWishlist: (item: Item) => Promise<void>
  removeFromCart: (id: string) => Promise<void>
  removeFromWishlist: (id: string) => Promise<void>
  setShowCart: (v: boolean) => void
  setShowWishlist: (v: boolean) => void
  openCart: () => void
  openWishlist: () => void
  isInCart: (id: string) => boolean
  isInWishlist: (id: string) => boolean
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined)

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<Item[]>([])
  const [wishlistItems, setWishlistItems] = useState<Item[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)
  const { isAuthenticated } = useAuth()
  const { isInCart: isInCartHook, isInWishlist: isInWishlistHook, cart, wishlist } = useCartWishlist()
  const [allListings, setAllListings] = useState<Item[]>([])

  // Fetch all listings to resolve cart/wishlist IDs to full Item objects
  useEffect(() => {
    fetchListings({ limitN: 1000 })
      .then(setAllListings)
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.error('[ShopContext] Failed to fetch listings', err)
        }
      })
  }, [])

  // Update cartItems and wishlistItems when Firestore data changes
  useEffect(() => {
    const cartIds = Object.keys(cart.items || {})
    const wishlistIds = Object.keys(wishlist.items || {})

    const cartItemsResolved = cartIds
      .map((id) => allListings.find((item) => item.id === id))
      .filter((item): item is Item => item !== undefined)

    const wishlistItemsResolved = wishlistIds
      .map((id) => allListings.find((item) => item.id === id))
      .filter((item): item is Item => item !== undefined)

    setCartItems(cartItemsResolved)
    setWishlistItems(wishlistItemsResolved)
  }, [cart.items, wishlist.items, allListings])

  const isInCart = useCallback((id: string) => isInCartHook(id), [isInCartHook])
  const isInWishlist = useCallback((id: string) => isInWishlistHook(id), [isInWishlistHook])

  const addToCart = useCallback(
    async (item: Item) => {
      if (import.meta.env.DEV) {
        console.log('[ShopContext] addToCart called, isAuthenticated:', isAuthenticated)
      }
      if (!isAuthenticated) {
        toast.error('Please log in to add items to cart')
        return
      }
      const result = await addToCartService(item.id)
      if (!result.ok) {
        toast.error(`[${result.code}] ${result.op}`)
      } else {
        toast.success('Added to cart')
        setShowCart(true)
      }
    },
    [isAuthenticated]
  )

  const addToWishlist = useCallback(
    async (item: Item) => {
      if (import.meta.env.DEV) {
        console.log('[ShopContext] addToWishlist called, isAuthenticated:', isAuthenticated)
      }
      if (!isAuthenticated) {
        toast.error('Please log in to add items to wishlist')
        return
      }
      const result = await addToWishlistService(item.id)
      if (!result.ok) {
        toast.error(`[${result.code}] ${result.op}`)
      } else {
        toast.success('Added to wishlist')
        setShowWishlist(true)
      }
    },
    [isAuthenticated]
  )

  const removeFromCart = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return
      const result = await removeFromCartService(id)
      if (!result.ok) {
        toast.error(`[${result.code}] ${result.op}`)
      } else {
        toast.success('Removed from cart')
      }
    },
    [isAuthenticated]
  )

  const removeFromWishlist = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return
      const result = await removeFromWishlistService(id)
      if (!result.ok) {
        toast.error(`[${result.code}] ${result.op}`)
      } else {
        toast.success('Removed from wishlist')
      }
    },
    [isAuthenticated]
  )

  const openCart = () => setShowCart(true)
  const openWishlist = () => setShowWishlist(true)

  const value = useMemo<ShopContextValue>(
    () => ({
      cartItems,
      wishlistItems,
      showCart,
      showWishlist,
      isInCart,
      isInWishlist,
      addToCart,
      addToWishlist,
      removeFromCart,
      removeFromWishlist,
      setShowCart,
      setShowWishlist,
      openCart,
      openWishlist,
    }),
    [
      cartItems,
      wishlistItems,
      showCart,
      showWishlist,
      isInCart,
      isInWishlist,
      addToCart,
      addToWishlist,
      removeFromCart,
      removeFromWishlist,
    ]
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export const useShop = (): ShopContextValue => {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}

// Global drawers component to render sidebars once at the app root
export const ShopDrawers: React.FC = () => {
  const {
    showCart,
    showWishlist,
    cartItems,
    wishlistItems,
    setShowCart,
    setShowWishlist,
    removeFromCart,
    removeFromWishlist,
    addToCart,
    addToWishlist,
    openCart,
    openWishlist,
  } = useShop()
  const navigate = useNavigate()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Ensure selection stays in sync with cart contents; default to selecting all items when cart opens/changes
  React.useEffect(() => {
    const next = new Set<string>()
    cartItems.forEach((ci) => {
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
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" onClick={() => setShowCart(false)}>
          <div
            className="bg-white dark:bg-slate-900 w-96 h-full shadow-xl overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Shopping Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              >
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
                  {cartItems.map((ci) => (
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
                            onClick={() => {
                              addToWishlist(ci)
                              setShowCart(false)
                              openWishlist()
                            }}
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
                  setShowCart(false)
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" onClick={() => setShowWishlist(false)}>
          <div
            className="bg-white dark:bg-slate-900 w-96 h-full shadow-xl overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Wishlist</h2>
              <button
                onClick={() => setShowWishlist(false)}
                className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              >
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
                  {wishlistItems.map((wi) => (
                    <div key={wi.id} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm line-clamp-2">{wi.title}</h3>
                        <p className="text-primary-600 dark:text-primary-400 font-semibold">{formatCurrency(wi.price)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => {
                              addToCart(wi)
                              setShowWishlist(false)
                              openCart()
                            }}
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
