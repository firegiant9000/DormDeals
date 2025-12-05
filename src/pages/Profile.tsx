import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Settings, Heart, ShoppingBag, MessageSquare, Star, Edit3, BarChart3, Users, Crown, Loader2, ShoppingCart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAccessControl } from '../hooks/useAccessControl'
import ProtectedFeature from '../components/ProtectedFeature'
import { UserType } from '../types/user'
import { getUserProfileWithStats, updateUserProfile } from '../services/userService'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { db } from '@/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { normalizeListing } from '@/utils/normalizers'
import { fetchFavorites } from '@/services/favoriteService'
import { fetchCart, removeFromCart } from '@/services/cartService'
import { deleteListing } from '@/services/listingService'
import { dlog } from '@/utils/debug'

interface UserProfile {
  id: string
  email: string
  username?: string
  first_name?: string
  last_name?: string
  displayName?: string
  name?: string
  phone?: string
  university?: string
  location?: string
  school?: string
  profile_image_url?: string
  profileImage?: string
  is_verified?: boolean
  isVerified?: boolean
  rating: number
  reviewCount: number
  totalSales: number
  totalListings: number
  totalFavorites: number
  created_at?: string | Date
  createdAt?: Date
  joinedDate?: string | Date
  joinDate?: string | Date
  graduation_year?: number
}

interface Listing {
  id: string
  title: string
  price: number
  status: string
  views: number
  images?: string[]
  image?: string
  description?: string
  category?: string
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState('listings')
  const { user } = useAuth()
  const { isAdmin, isPremium, canAccess } = useAccessControl()
  const navigate = useNavigate()
  
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [favorites, setFavorites] = useState<Listing[]>([])
  const [cartItems, setCartItems] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingListings, setIsLoadingListings] = useState(false)
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [isLoadingCart, setIsLoadingCart] = useState(false)

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // Get user profile with stats from Firestore
        const profileWithStats = await getUserProfileWithStats(user.id)
        
        if (profileWithStats) {
          setUserData({
            id: profileWithStats.id,
            email: profileWithStats.email,
            username: profileWithStats.displayName || 'User',
            displayName: profileWithStats.displayName,
            name: profileWithStats.displayName,
            phone: profileWithStats.phone,
            university: profileWithStats.school,
            location: profileWithStats.school || 'UL Campus',
            school: profileWithStats.school || 'University of Louisiana',
            is_verified: profileWithStats.isVerified,
            isVerified: profileWithStats.isVerified,
            rating: profileWithStats.rating || 0,
            reviewCount: profileWithStats.reviewCount || 0,
            totalSales: profileWithStats.totalSales || 0,
            totalListings: profileWithStats.totalListings || 0,
            totalFavorites: profileWithStats.totalFavorites || 0,
            createdAt: profileWithStats.createdAt ? (profileWithStats.createdAt instanceof Date ? profileWithStats.createdAt : new Date(profileWithStats.createdAt)) : undefined,
            created_at: profileWithStats.createdAt ? (profileWithStats.createdAt instanceof Date ? profileWithStats.createdAt.toISOString() : new Date(profileWithStats.createdAt).toISOString()) : new Date().toISOString(),
            joinedDate: profileWithStats.createdAt ? (profileWithStats.createdAt instanceof Date ? profileWithStats.createdAt.toISOString() : new Date(profileWithStats.createdAt).toISOString()) : new Date().toISOString(),
            joinDate: profileWithStats.createdAt ? (profileWithStats.createdAt instanceof Date ? profileWithStats.createdAt.toISOString() : new Date(profileWithStats.createdAt).toISOString()) : new Date().toISOString(),
            profileImage: profileWithStats.profileImage
          })
        } else {
          // Fallback to Firebase user data if profile doesn't exist
          const joinDateStr = user.joinDate || new Date().toISOString()
          setUserData({
            id: user.id,
            email: user.email,
            username: user.displayName || user.name || 'User',
            displayName: user.displayName || user.name || 'User',
            name: user.displayName || user.name || 'User',
            phone: user.phone,
            university: user.school,
            location: user.school || 'UL Campus',
            school: user.school || 'University of Louisiana',
            is_verified: user.isVerified,
            isVerified: user.isVerified,
            rating: user.rating || 0,
            reviewCount: user.reviewCount || 0,
            totalSales: user.totalSales || 0,
            totalListings: 0,
            totalFavorites: 0,
            created_at: joinDateStr,
            joinedDate: joinDateStr,
            joinDate: joinDateStr
          })
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        // Fallback to Firebase user data
        const joinDateStr = user.joinDate || new Date().toISOString()
        setUserData({
          id: user.id,
          email: user.email,
          username: user.displayName || user.name || 'User',
          displayName: user.displayName || user.name || 'User',
          name: user.displayName || user.name || 'User',
          phone: user.phone,
          university: user.school,
          location: user.school || 'UL Campus',
          school: user.school || 'University of Louisiana',
          is_verified: user.isVerified,
          isVerified: user.isVerified,
          rating: user.rating || 0,
          reviewCount: user.reviewCount || 0,
          totalSales: user.totalSales || 0,
          totalListings: 0,
          totalFavorites: 0,
          created_at: joinDateStr,
          joinedDate: joinDateStr,
          joinDate: joinDateStr
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [user])

  // Fetch listings when listings tab is active or when userData changes
  useEffect(() => {
    if (!user?.id) return
    if (activeTab !== 'listings') return

    (async () => {
      try {
        setIsLoadingListings(true)
        const uid = (user as any)?.uid || user?.id
        const qRef = query(collection(db, 'listings'), where('ownerId', '==', uid), orderBy('createdAt', 'desc'))
        const qs = await getDocs(qRef)
        const rows = qs.docs.map(d => normalizeListing({ id: d.id, ...d.data() } as any))
        const convertedListings: Listing[] = rows.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          status: item.status || 'active',
          views: (item as any).views || 0,
          images: item.imageUrls,
          description: item.description,
          category: item.category
        }))
        setListings(convertedListings)
        dlog('My Listings loaded', convertedListings.length)
      } catch (e: any) {
        console.error(e)
        toast.error(`Failed to load listings: ${e.code ?? 'error'}`)
        setListings([])
      } finally {
        setIsLoadingListings(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.id])

  // Fetch favorites when favorites tab is active
  useEffect(() => {
    if (activeTab !== 'favorites') return

    setIsLoadingFavorites(true)
    fetchFavorites()
      .then(items => {
        const convertedFavorites: Listing[] = items.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          status: item.status || 'active',
          views: (item as any).views || 0,
          images: item.imageUrls,
          description: item.description,
          category: item.category
        }))
        setFavorites(convertedFavorites)
        dlog('Favorites loaded', convertedFavorites.length)
      })
      .catch((e) => {
        console.error(e)
        toast.error('Failed to load favorites')
        setFavorites([])
      })
      .finally(() => setIsLoadingFavorites(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.id])

  // Fetch cart items when cart tab is active
  useEffect(() => {
    if (activeTab !== 'cart') return

    setIsLoadingCart(true)
    fetchCart()
      .then(items => {
        const convertedCart: Listing[] = items.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          status: item.status || 'active',
          views: (item as any).views || 0,
          images: item.imageUrls,
          description: item.description,
          category: item.category
        }))
        setCartItems(convertedCart)
        dlog('Cart loaded', convertedCart.length)
      })
      .catch((e) => {
        console.error(e)
        toast.error(`Cart error [${e?.code || 'unknown'}]`)
        setCartItems([])
      })
      .finally(() => setIsLoadingCart(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.id])

  // Fallback user data
  const displayUserData = userData || {
    id: user?.id || '',
    email: user?.email || '',
    username: user?.displayName || user?.name || 'Guest User',
    displayName: user?.displayName || user?.name || 'Guest User',
    name: user?.displayName || user?.name || 'Guest User',
    phone: user?.phone || '',
    location: user?.school || 'UL Campus',
    school: user?.school || 'University of Louisiana',
    joinedDate: user?.joinDate || new Date().toISOString(),
    joinDate: user?.joinDate || new Date().toISOString(),
    rating: user?.rating || 0,
    totalSales: user?.totalSales || 0,
    reviewCount: user?.reviewCount || 0,
    isVerified: user?.isVerified || false,
    profileImage: user?.profileImage || null,
    totalListings: 0,
    totalFavorites: 0
  }

  const tabs = [
    { id: 'listings', label: 'My Listings', icon: ShoppingBag },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    ...(canAccess('advanced_analytics') ? [{ id: 'analytics', label: 'Analytics', icon: BarChart3 }] : []),
    ...(isPremium() ? [{ id: 'premium', label: 'Premium', icon: Crown }] : []),
    ...(isAdmin() ? [{ id: 'admin', label: 'Admin Panel', icon: Users }] : []),
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  // Handle premium button click - navigate to premium page for non-premium users
  const handlePremiumClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isPremium()) {
      navigate('/premium')
    } else {
      setActiveTab('premium')
    }
  }

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dd-card bg-surface border-surface p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              {(displayUserData as UserProfile).profile_image_url || displayUserData.profileImage ? (
                <img 
                  src={(displayUserData as UserProfile).profile_image_url || displayUserData.profileImage || ''} 
                  alt={displayUserData.displayName || displayUserData.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-primary-600" />
                </div>
              )}
              <button 
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700"
                onClick={() => setActiveTab('settings')}
                title="Edit Profile"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                  <span className="ml-2 text-gray-600">Loading profile...</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-900">{displayUserData.displayName || displayUserData.name || displayUserData.username}</h1>
                        {isPremium() && (
                          <div title="Premium User">
                            <Crown className="w-5 h-5 text-primary-600" />
                          </div>
                        )}
                        {isAdmin() && (
                          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">Admin</span>
                        )}
                        {displayUserData.isVerified && (
                          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">Verified</span>
                        )}
                      </div>
                      <p className="text-gray-600">{displayUserData.email}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold">{displayUserData.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <p className="text-sm text-gray-500">Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{displayUserData.totalSales || 0}</p>
                        <p className="text-sm text-gray-500">Items Sold</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{displayUserData.totalListings || 0}</p>
                        <p className="text-sm text-gray-500">Listings</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-2 font-medium">{displayUserData.phone || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <span className="ml-2 font-medium">{displayUserData.location || (displayUserData as UserProfile).university || displayUserData.school || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Member since:</span>
                      <span className="ml-2 font-medium">
                        {displayUserData.joinedDate || (displayUserData as UserProfile).created_at
                          ? new Date(displayUserData.joinedDate || (displayUserData as UserProfile).created_at || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                          : 'Recently'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="dd-card bg-surface border-surface mb-8">
          <div className="border-b border-surface">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
              {/* Premium button for non-premium users */}
              {!isPremium() && (
                <button
                  onClick={handlePremiumClick}
                  className="py-4 px-1 border-b-2 border-transparent font-medium text-sm flex items-center gap-2 transition-colors text-gray-500 hover:text-primary-600 hover:border-primary-300"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Premium
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'listings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">My Listings</h2>
                  <button 
                    className="btn-primary"
                    onClick={() => navigate('/create-listing')}
                  >
                    Create New Listing
                  </button>
                </div>
                
                {isLoadingListings ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                    <span className="ml-2 text-gray-600">Loading listings...</span>
                  </div>
                ) : listings.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
                    <p className="text-gray-500 mb-4">Create your first listing to start selling</p>
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/create-listing')}
                    >
                      Create New Listing
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="dd-card bg-surface border-surface overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                      >
                        <div className="h-32 bg-gray-200 flex items-center justify-center overflow-hidden">
                          {(() => {
                            const cover = (listing as any).imageUrls?.[0] || listing.images?.[0]
                            return cover ? (
                              <img 
                                src={cover} 
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="skeleton h-40 w-full" />
                            )
                          })()}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                          <p className="text-lg font-bold text-primary-600 mb-2">${Number(listing.price).toFixed(2)}</p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded text-xs ${
                              listing.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : listing.status === 'Sold'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {listing.status}
                            </span>
                            <span>{listing.views || 0} views</span>
                          </div>
                          {(() => {
                            const uid = (user as any)?.uid || user?.id
                            const isOwner = uid && (listing as any).ownerId === uid
                            return isOwner ? (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  if (confirm('Delete this listing? This cannot be undone.')) {
                                    try {
                                      await deleteListing(listing.id)
                                      toast.success('Listing deleted')
                                      setListings(prev => prev.filter(x => x.id !== listing.id))
                                    } catch (e: any) {
                                      toast.error(e.message ?? 'Failed to delete listing')
                                    }
                                  }
                                }}
                                className="mt-2 btn-secondary text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            ) : null
                          })()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cart' && (
              <>
                {isLoadingCart ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                    <span className="ml-2 text-gray-600">Loading cart...</span>
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                    <p className="text-gray-500 mb-4">Items you add to cart will appear here</p>
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/marketplace')}
                    >
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cartItems.map((listing) => {
                      return (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="dd-card bg-surface border-surface overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="h-32 bg-gray-200 flex items-center justify-center overflow-hidden">
                          {(() => {
                            const cover = (listing as any).imageUrls?.[0] || listing.images?.[0]
                            return cover ? (
                              <img 
                                src={cover} 
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="skeleton h-40 w-full" />
                            )
                          })()}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                          <p className="text-lg font-bold text-primary-600 mb-2">${Number(listing.price).toFixed(2)}</p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded text-xs ${
                              listing.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : listing.status === 'Sold'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {listing.status}
                            </span>
                            <span>{listing.views || 0} views</span>
                          </div>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation()
                              try {
                                await removeFromCart(listing.id)
                                setCartItems(prev => prev.filter(x => x.id !== listing.id))
                                toast.success('Removed from cart')
                              } catch (e: any) {
                                toast.error('Failed to remove from cart')
                              }
                            }}
                            className="mt-2 btn-secondary"
                          >
                            Remove
                          </button>
                        </div>
                      </motion.div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'favorites' && (
              <>
                {isLoadingFavorites ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                    <span className="ml-2 text-gray-600">Loading favorites...</span>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                    <p className="text-gray-500 mb-4">Items you favorite will appear here</p>
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/marketplace')}
                    >
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((listing) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="dd-card bg-surface border-surface overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                      >
                        <div className="h-32 bg-gray-200 flex items-center justify-center overflow-hidden">
                          {(() => {
                            const cover = (listing as any).imageUrls?.[0] || listing.images?.[0]
                            return cover ? (
                              <img 
                                src={cover} 
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="skeleton h-40 w-full" />
                            )
                          })()}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                          <p className="text-lg font-bold text-primary-600 mb-2">${Number(listing.price).toFixed(2)}</p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded text-xs ${
                              listing.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : listing.status === 'Sold'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {listing.status}
                            </span>
                            <span>{listing.views || 0} views</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'messages' && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages</h3>
                <p className="text-gray-500">Your conversations will appear here</p>
              </div>
            )}

            {activeTab === 'analytics' && (
              <ProtectedFeature feature="advanced_analytics">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Analytics</h3>
                    <p className="text-gray-600 mb-6">Track your listing performance, views, and engagement metrics.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="dd-card bg-surface border-surface p-4">
                        <p className="text-sm text-gray-500 mb-1">Total Views</p>
                        <p className="text-2xl font-bold text-gray-900">1,234</p>
                        <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                      </div>
                      <div className="dd-card bg-surface border-surface p-4">
                        <p className="text-sm text-gray-500 mb-1">Engagement Rate</p>
                        <p className="text-2xl font-bold text-gray-900">8.5%</p>
                        <p className="text-xs text-green-600 mt-1">+2.1% from last month</p>
                      </div>
                      <div className="dd-card bg-surface border-surface p-4">
                        <p className="text-sm text-gray-500 mb-1">Avg. Response Time</p>
                        <p className="text-2xl font-bold text-gray-900">2.3h</p>
                        <p className="text-xs text-gray-600 mt-1">Faster than average</p>
                      </div>
                    </div>
                    
                    <div className="dd-card bg-surface border-surface p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Performance Chart</h4>
                      <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Chart visualization would go here
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedFeature>
            )}

            {activeTab === 'premium' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-8 h-8 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Premium Dashboard</h3>
                  </div>
                  <p className="text-gray-600 mb-6">Manage your premium features and featured listings.</p>
                  
                  <div className="dd-card bg-surface border-surface p-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Your Premium Benefits</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Crown className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Featured Listings</p>
                          <p className="text-sm text-gray-600">Feature your listings to get more visibility</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Advanced Analytics</p>
                          <p className="text-sm text-gray-600">Track your listing performance</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Unlimited Listings</p>
                          <p className="text-sm text-gray-600">Post as many items as you want</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="dd-card bg-surface border-surface p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Featured Listings</h4>
                    <p className="text-gray-600 mb-4">Your featured listings appear at the top of search results and on the homepage.</p>
                    <p className="text-sm text-gray-500">Go to any of your listings and click &quot;Feature this item&quot; to feature it.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <ProtectedFeature requiredUserTypes={[UserType.ADMIN]}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Panel</h3>
                    <p className="text-gray-600 mb-6">Manage users, listings, and system settings.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="dd-card bg-surface border-surface p-6">
                        <Users className="w-8 h-8 text-primary-600 mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-2">User Management</h4>
                        <p className="text-sm text-gray-600 mb-4">View and manage all users in the system.</p>
                        <button className="btn-primary text-sm">Manage Users</button>
                      </div>
                      <div className="dd-card bg-surface border-surface p-6">
                        <ShoppingBag className="w-8 h-8 text-primary-600 mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-2">Listing Management</h4>
                        <p className="text-sm text-gray-600 mb-4">Review and moderate all listings.</p>
                        <button className="btn-primary text-sm">Manage Listings</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedFeature>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    if (!user?.id) {
                      toast.error('Cannot update profile: User not authenticated')
                      return
                    }

                    const formData = new FormData(e.currentTarget)
                    try {
                      // Update profile in Firestore
                      const firstName = formData.get('first_name')?.toString()
                      const lastName = formData.get('last_name')?.toString()
                      const phone = formData.get('phone')?.toString()
                      const university = formData.get('university')?.toString()
                      const profileImageUrl = formData.get('profile_image_url')?.toString()
                      
                      await updateUserProfile(user.id, {
                        displayName: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || undefined,
                        phone: phone || undefined,
                        school: university || undefined,
                        profileImage: profileImageUrl || undefined
                      })
                      
                      // Refresh profile data with stats
                      const updatedProfileWithStats = await getUserProfileWithStats(user.id)
                      if (updatedProfileWithStats) {
                        setUserData({
                          id: updatedProfileWithStats.id,
                          email: updatedProfileWithStats.email,
                          username: updatedProfileWithStats.displayName || 'User',
                          displayName: updatedProfileWithStats.displayName,
                          name: updatedProfileWithStats.displayName,
                          phone: updatedProfileWithStats.phone,
                          university: updatedProfileWithStats.school,
                          location: updatedProfileWithStats.school || 'UL Campus',
                          school: updatedProfileWithStats.school || 'University of Louisiana',
                          is_verified: updatedProfileWithStats.isVerified,
                          isVerified: updatedProfileWithStats.isVerified,
                          rating: updatedProfileWithStats.rating || 0,
                          reviewCount: updatedProfileWithStats.reviewCount || 0,
                          totalSales: updatedProfileWithStats.totalSales || 0,
                          totalListings: updatedProfileWithStats.totalListings || 0,
                          totalFavorites: updatedProfileWithStats.totalFavorites || 0,
                          createdAt: updatedProfileWithStats.createdAt ? (updatedProfileWithStats.createdAt instanceof Date ? updatedProfileWithStats.createdAt : new Date(updatedProfileWithStats.createdAt)) : undefined,
                          created_at: updatedProfileWithStats.createdAt ? (updatedProfileWithStats.createdAt instanceof Date ? updatedProfileWithStats.createdAt.toISOString() : new Date(updatedProfileWithStats.createdAt).toISOString()) : new Date().toISOString(),
                          joinedDate: updatedProfileWithStats.createdAt ? (updatedProfileWithStats.createdAt instanceof Date ? updatedProfileWithStats.createdAt.toISOString() : new Date(updatedProfileWithStats.createdAt).toISOString()) : new Date().toISOString(),
                          joinDate: updatedProfileWithStats.createdAt ? (updatedProfileWithStats.createdAt instanceof Date ? updatedProfileWithStats.createdAt.toISOString() : new Date(updatedProfileWithStats.createdAt).toISOString()) : new Date().toISOString(),
                          profileImage: updatedProfileWithStats.profileImage
                        })
                      }
                      toast.success('Profile updated successfully!')
                    } catch (err: any) {
                      console.error('Error updating profile:', err)
                      toast.error('Failed to update profile')
                    }
                  }}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input 
                          type="text" 
                          name="first_name"
                          defaultValue={(displayUserData as UserProfile).first_name || ''} 
                          className="input-field" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input 
                          type="text" 
                          name="last_name"
                          defaultValue={(displayUserData as UserProfile).last_name || ''} 
                          className="input-field" 
                        />
                      </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input 
                          type="email" 
                          defaultValue={displayUserData.email} 
                          className="input-field" 
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input 
                          type="tel" 
                          name="phone"
                          defaultValue={displayUserData.phone || ''} 
                          className="input-field" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                        <input 
                          type="text" 
                          name="university"
                          defaultValue={(displayUserData as UserProfile).university || displayUserData.location || displayUserData.school || ''} 
                          className="input-field" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
                        <input 
                          type="number" 
                          name="graduation_year"
                          min="2020"
                          max="2030"
                          defaultValue={(displayUserData as UserProfile).graduation_year || ''} 
                          className="input-field" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image URL</label>
                        <input 
                          type="url" 
                          name="profile_image_url"
                          defaultValue={(displayUserData as UserProfile).profile_image_url || displayUserData.profileImage || ''} 
                          className="input-field" 
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-200">
                      <button 
                        type="submit"
                        className="btn-primary"
                        disabled={!user?.id}
                      >
                        Save Changes
                      </button>
                      {!user?.id && (
                        <p className="text-sm text-gray-500 mt-2">
                          Please sign in to update your profile.
                        </p>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
