import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Settings, Heart, ShoppingBag, MessageSquare, Star, Edit3, BarChart3, Users, Crown, Loader2, ShoppingCart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAccessControl } from '../hooks/useAccessControl'
import ProtectedFeature from '../components/ProtectedFeature'
import { UserType } from '../types/user'
import { userApi } from '../services/api'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

interface UserProfile {
  id: number
  email: string
  username: string
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
  created_at: string | Date
  joinedDate?: string | Date
  joinDate?: string | Date
  graduation_year?: number
}

interface Listing {
  id: number
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
  const location = useLocation()
  const prevUserDataIdRef = useRef<number | null>(null)
  
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [favorites, setFavorites] = useState<Listing[]>([])
  const [cartItems, setCartItems] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingListings, setIsLoadingListings] = useState(false)
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [isLoadingCart, setIsLoadingCart] = useState(false)

  // Fetch user profile from database
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.email) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // First, try to get user by email
        let dbUser
        try {
          dbUser = await userApi.getByEmail(user.email) as { id: number; email: string }
        } catch {
          // If user not found by email, they might not exist in PostgreSQL yet
          console.warn('User not found in database by email:', user.email)
          // Use Firebase user data as fallback
          const joinDateStr = user.joinDate || new Date().toISOString()
          setUserData({
            id: 0,
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
          setIsLoading(false)
          return
        }

        // If user found, get full profile with stats
        if (dbUser?.id) {
          const profile = await userApi.getProfileById(dbUser.id.toString()) as UserProfile
          setUserData(profile)
        } else {
          throw new Error('User profile not found')
        }
      } catch {
        console.error('Error fetching user profile')
        // Fallback to Firebase user data
        const joinDateStr = user.joinDate || new Date().toISOString()
        setUserData({
          id: 0,
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
    const fetchListings = async () => {
      // Only fetch if we have a valid database user ID and listings tab is active
      if (activeTab !== 'listings' || !userData?.id || userData.id === 0) {
        // Clear listings if user is not in database or wrong tab
        if (activeTab !== 'listings') {
          return // Don't clear if just switching tabs
        }
        setListings([])
        return
      }

      try {
        setIsLoadingListings(true)
        // Fetch only real listings from database for this user
        const userListings = await userApi.getListings(userData.id.toString()) as Listing[]
        // Only set listings if we got valid data from the API
        if (Array.isArray(userListings)) {
          setListings(userListings)
        } else {
          setListings([])
        }
        // Update ref to track current userData.id
        prevUserDataIdRef.current = userData.id
        // Clear refresh flag if it was set
        if ((location.state as any)?.refreshListings) {
          navigate(location.pathname, { replace: true, state: {} })
        }
      } catch (error) {
        console.error('Error fetching listings from database:', error)
        // Clear listings on error - don't show any mock data
        setListings([])
        toast.error('Failed to load listings')
      } finally {
        setIsLoadingListings(false)
      }
    }

    fetchListings()
  }, [activeTab, userData?.id, location.state, navigate, location.pathname])

  // Fetch favorites when favorites tab is active
  useEffect(() => {
    const fetchFavorites = async () => {
      // Only fetch if we have a valid database user ID
      if (activeTab !== 'favorites' || !userData?.id || userData.id === 0) {
        // Clear favorites if user is not in database
        setFavorites([])
        return
      }

      try {
        setIsLoadingFavorites(true)
        // Fetch only real favorites from database for this user
        const userFavorites = await userApi.getFavorites(userData.id.toString()) as Listing[]
        // Only set favorites if we got valid data from the API
        if (Array.isArray(userFavorites)) {
          setFavorites(userFavorites)
        } else {
          setFavorites([])
        }
      } catch (error) {
        console.error('Error fetching favorites from database:', error)
        // Clear favorites on error - don't show any mock data
        setFavorites([])
        toast.error('Failed to load favorites')
      } finally {
        setIsLoadingFavorites(false)
      }
    }

    fetchFavorites()
  }, [activeTab, userData?.id])

  // Fetch cart items when cart tab is active
  useEffect(() => {
    const fetchCart = async () => {
      // Only fetch if we have a valid database user ID
      if (activeTab !== 'cart' || !userData?.id || userData.id === 0) {
        // Clear cart if user is not in database
        setCartItems([])
        return
      }

      try {
        setIsLoadingCart(true)
        // Fetch only real cart items from database for this user
        const userCart = await userApi.getCart(userData.id.toString()) as Listing[]
        // Only set cart items if we got valid data from the API
        if (Array.isArray(userCart)) {
          setCartItems(userCart)
        } else {
          setCartItems([])
        }
      } catch (error) {
        console.error('Error fetching cart from database:', error)
        // Clear cart on error - don't show any mock data
        setCartItems([])
        toast.error('Failed to load cart')
      } finally {
        setIsLoadingCart(false)
      }
    }

    fetchCart()
  }, [activeTab, userData?.id])

  // Fallback user data
  const displayUserData = userData || {
    id: 0,
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
                          ? new Date(displayUserData.joinedDate || (displayUserData as UserProfile).created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
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
                          {listing.images && listing.images.length > 0 ? (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-400">No Image</span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                          <p className="text-lg font-bold text-primary-600 mb-2">${listing.price}</p>
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
                    {cartItems.map((listing) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="dd-card bg-surface border-surface overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                      >
                        <div className="h-32 bg-gray-200 flex items-center justify-center overflow-hidden">
                          {listing.images && listing.images.length > 0 ? (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-400">No Image</span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                          <p className="text-lg font-bold text-primary-600 mb-2">${listing.price}</p>
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
                          {listing.images && listing.images.length > 0 ? (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-400">No Image</span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                          <p className="text-lg font-bold text-primary-600 mb-2">${listing.price}</p>
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
                    if (!userData?.id || userData.id === 0) {
                      toast.error('Cannot update profile: User not found in database')
                      return
                    }

                    const formData = new FormData(e.currentTarget)
                    try {
                      await userApi.updateProfileById(userData.id.toString(), {
                        first_name: formData.get('first_name')?.toString() || null,
                        last_name: formData.get('last_name')?.toString() || null,
                        phone: formData.get('phone')?.toString() || null,
                        university: formData.get('university')?.toString() || null,
                        graduation_year: formData.get('graduation_year')?.toString() ? parseInt(formData.get('graduation_year')!.toString()) : null,
                        profile_image_url: formData.get('profile_image_url')?.toString() || null
                      })
                      
                      // Refresh profile data
                      const updatedProfile = await userApi.getProfileById(userData.id.toString()) as UserProfile
                      setUserData(updatedProfile)
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
                        disabled={!userData?.id || userData.id === 0}
                      >
                        Save Changes
                      </button>
                      {(!userData?.id || userData.id === 0) && (
                        <p className="text-sm text-gray-500 mt-2">
                          Profile not found in database. Please contact support.
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
