import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { User, Settings, Heart, ShoppingBag, MessageSquare, Star, Edit3, BarChart3, Users, Crown, Loader2, ShoppingCart, Pencil, Shield, TrendingUp, DollarSign, Package, AlertCircle, CheckCircle, XCircle, Search, Gauge, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAccessControl } from '../hooks/useAccessControl'
import ProtectedFeature from '../components/ProtectedFeature'
import { UserType, UserProfile as UserProfileType } from '../types/user'
import { getUserProfileWithStats, updateUserProfile } from '../services/userService'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { db } from '@/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { normalizeListing } from '@/utils/helpers'
import { fetchFavorites } from '@/services/favoriteService'
import { fetchCart, removeFromCart } from '@/services/cartService'
import { deleteListing } from '@/services/listingService'
import { getAllUsers, getAllListings, updateUserType, updateUserVerification, updateUserBanStatus, adminDeleteListing, adminUpdateListingStatus, getPlatformStats, PlatformStats } from '../services/adminService'
import { estimateUsage, DEFAULT_ASSUMPTIONS, FIRESTORE_FREE_TIER, BUDGET_ALERT_THRESHOLDS, type UsageAssumptions } from '../services/costService'

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
  const location = useLocation()
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

  // Admin state
  const [allUsers, setAllUsers] = useState<(UserProfileType & { isBanned?: boolean; bannedAt?: Date | null })[]>([])
  const [allListings, setAllListings] = useState<any[]>([])
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [listingSearchQuery, setListingSearchQuery] = useState('')

  // Cost dashboard state (#9). Listing count is read cheaply (public-read);
  // assumptions are tunable so the estimate reflects real campus traffic.
  const [costListingCount, setCostListingCount] = useState<number | null>(null)
  const [isLoadingCosts, setIsLoadingCosts] = useState(false)
  const [costAssumptions, setCostAssumptions] = useState<UsageAssumptions>(DEFAULT_ASSUMPTIONS)
  const costEstimate = useMemo(() => estimateUsage(costAssumptions), [costAssumptions])

  // Handle hash routing
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && ['admin', 'analytics', 'costs'].includes(hash)) {
      setActiveTab(hash)
    }
  }, [location])

  // Update URL hash when tab changes (for admin, analytics, and costs)
  useEffect(() => {
    if (activeTab === 'admin' || activeTab === 'analytics' || activeTab === 'costs') {
      window.location.hash = activeTab
    } else if (window.location.hash) {
      // Clear hash for other tabs
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [activeTab])

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
        
        // Try querying with ownerId first (new listings use this)
        let qs
        try {
          // Try with orderBy first
          const qRef = query(
            collection(db, 'listings'), 
            where('ownerId', '==', uid),
            orderBy('createdAt', 'desc')
          )
          qs = await getDocs(qRef)
        } catch (orderByError: any) {
          // If orderBy fails (missing index or field), try without it
          console.warn('OrderBy failed, fetching without orderBy:', orderByError)
          const qRef = query(
            collection(db, 'listings'), 
            where('ownerId', '==', uid)
          )
          qs = await getDocs(qRef)
        }
        
        // Also try sellerId for backward compatibility
        let sellerQs: any = null
        try {
          const sellerQRef = query(
            collection(db, 'listings'), 
            where('sellerId', '==', uid)
          )
          sellerQs = await getDocs(sellerQRef)
        } catch (sellerError) {
          // Ignore if sellerId query fails
          console.warn('sellerId query failed:', sellerError)
        }
        
        // Combine results from both queries
        const allDocs = new Map()
        if (qs) {
          qs.docs.forEach((doc: any) => {
            allDocs.set(doc.id, doc)
          })
        }
        if (sellerQs) {
          sellerQs.docs.forEach((doc: any) => {
            if (!allDocs.has(doc.id)) {
              allDocs.set(doc.id, doc)
            }
          })
        }
        
        // Convert to listings
        const rows = Array.from(allDocs.values()).map(d => normalizeListing({ id: d.id, ...d.data() } as any))
        
        // Sort by createdAt if available (client-side)
        rows.sort((a, b) => {
          const getTime = (date: any): number => {
            if (!date) return 0
            if (date instanceof Date) return date.getTime()
            if (date?.toDate && typeof date.toDate === 'function') return date.toDate().getTime()
            if (typeof date === 'string' || typeof date === 'number') return new Date(date).getTime()
            return 0
          }
          const aDate = getTime(a.createdAt)
          const bDate = getTime(b.createdAt)
          return bDate - aDate
        })
        
        const convertedListings: Listing[] = rows.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          status: item.status || 'active',
          views: (item as any).views || 0,
          images: (item as any).imageUrls || item.images || [],
          description: item.description,
          category: item.category
        }))
        
        setListings(convertedListings)
        if (import.meta.env.DEV) console.log('My Listings loaded', convertedListings.length)
      } catch (e: any) {
        console.error('Error fetching listings:', e)
        toast.error(`Failed to load listings: ${e.code ?? e.message ?? 'error'}`)
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
        if (import.meta.env.DEV) console.log('Favorites loaded', convertedFavorites.length)
      })
      .catch((e) => {
        console.error(e)
        toast.error('Failed to load favorites')
        setFavorites([])
      })
      .finally(() => setIsLoadingFavorites(false))
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
        if (import.meta.env.DEV) console.log('Cart loaded', convertedCart.length)
      })
      .catch((e) => {
        console.error(e)
        toast.error(`Cart error [${e?.code || 'unknown'}]`)
        setCartItems([])
      })
      .finally(() => setIsLoadingCart(false))
  }, [activeTab, user?.id])

  // Fetch admin data when admin tab is active
  useEffect(() => {
    if (activeTab !== 'admin' || !isAdmin()) return

    setIsLoadingAdmin(true)
    Promise.all([getAllUsers(), getAllListings()])
      .then(([users, listings]) => {
        setAllUsers(users)
        setAllListings(listings.map(l => ({
          id: l.id,
          title: l.title,
          price: l.price,
          status: l.status || 'active',
          views: (l as any).views || 0,
          images: l.images || (l as any).imageUrls || [],
          description: l.description,
          category: l.category,
          ownerId: (l as any).ownerId || (l as any).sellerId,
          createdAt: l.createdAt,
          isFeatured: (l as any).isFeatured || false
        })))
      })
      .catch((e) => {
        console.error(e)
        toast.error('Failed to load admin data')
      })
      .finally(() => setIsLoadingAdmin(false))
  }, [activeTab, isAdmin])

  // Fetch analytics data when analytics tab is active
  useEffect(() => {
    if (activeTab !== 'analytics' || !isAdmin()) return

    setIsLoadingAnalytics(true)
    getPlatformStats()
      .then(stats => {
        setPlatformStats(stats)
      })
      .catch((e) => {
        console.error(e)
        toast.error('Failed to load analytics')
      })
      .finally(() => setIsLoadingAnalytics(false))
  }, [activeTab, isAdmin])

  // Fetch cost-relevant data when the costs tab is active (#9). Uses listings
  // only (public-read) so it works even though getAllUsers is locked to
  // read-self by the #5 rules; seeds the stored-data estimate from the count.
  useEffect(() => {
    if (activeTab !== 'costs' || !isAdmin()) return

    setIsLoadingCosts(true)
    getAllListings()
      .then(listings => {
        setCostListingCount(listings.length)
        // ~0.5 KB of Firestore metadata per listing doc (images live in Storage).
        setCostAssumptions(prev => ({
          ...prev,
          storedGiB: Number((listings.length * 0.0000005).toFixed(6)) || prev.storedGiB
        }))
      })
      .catch((e) => {
        console.error(e)
        toast.error('Failed to load cost data')
      })
      .finally(() => setIsLoadingCosts(false))
  }, [activeTab, isAdmin])

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
    ...(isAdmin() ? [{ id: 'costs', label: 'Costs', icon: Gauge }] : []),
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

  // Require authentication to access profile page
  if (!user) {
    return (
      <div className="min-h-screen bg-transparent py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProtectedFeature requiredUserTypes={[UserType.REGULAR]} fallback={
            <div className="dd-card bg-surface border-surface p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please Sign In</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be signed in to view your profile.</p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary"
              >
                Go to Login
              </button>
            </div>
          }>
            <div></div>
          </ProtectedFeature>
        </div>
      </div>
    )
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
                          <h3 className={`font-semibold mb-1 ${
                            (listing as any).isFeatured 
                              ? 'text-yellow-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.6)]' 
                              : 'text-gray-900'
                          }`}>{listing.title}</h3>
                          <p className="text-lg font-bold text-primary-600 mb-2">${Number(listing.price).toFixed(2)}</p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded text-xs ${
                              listing.status === 'active'
                                ? 'bg-green-100 text-green-800' 
                                : listing.status === 'sold'
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
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/create-listing?edit=${listing.id}`)
                                  }}
                                  className="flex-1 btn-secondary text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-1"
                                >
                                  <Pencil size={14} />
                                  Edit
                                </button>
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
                                  className="flex-1 btn-secondary text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
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
                          <h3 className={`font-semibold mb-1 ${
                            (listing as any).isFeatured 
                              ? 'text-yellow-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.6)]' 
                              : 'text-gray-900'
                          }`}>{listing.title}</h3>
                          <p className="text-lg font-bold text-primary-600 mb-2">${Number(listing.price).toFixed(2)}</p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded text-xs ${
                              listing.status === 'active'
                                ? 'bg-green-100 text-green-800' 
                                : listing.status === 'sold'
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
                              } catch {
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
                          <h3 className={`font-semibold mb-1 ${
                            (listing as any).isFeatured 
                              ? 'text-yellow-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.6)]' 
                              : 'text-gray-900'
                          }`}>{listing.title}</h3>
                          <p className="text-lg font-bold text-primary-600 mb-2">${Number(listing.price).toFixed(2)}</p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded text-xs ${
                              listing.status === 'active'
                                ? 'bg-green-100 text-green-800' 
                                : listing.status === 'sold'
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
              <ProtectedFeature requiredUserTypes={[UserType.ADMIN]}>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <BarChart3 className="w-6 h-6 text-primary-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Platform Analytics</h3>
                    </div>
                    <p className="text-gray-600 mb-6">Comprehensive platform statistics and insights.</p>

                    {isLoadingAnalytics ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                        <span className="ml-2 text-gray-600">Loading analytics...</span>
                      </div>
                    ) : platformStats ? (
                      <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="dd-card bg-surface border-surface p-6">
                            <div className="flex items-center justify-between mb-2">
                              <Users className="w-8 h-8 text-blue-600" />
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-sm text-gray-500 mb-1">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">{platformStats.totalUsers}</p>
                            <p className="text-xs text-green-600 mt-2">+{platformStats.recentUsers} in last 30 days</p>
                          </div>

                          <div className="dd-card bg-surface border-surface p-6">
                            <div className="flex items-center justify-between mb-2">
                              <Package className="w-8 h-8 text-purple-600" />
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-sm text-gray-500 mb-1">Total Listings</p>
                            <p className="text-3xl font-bold text-gray-900">{platformStats.totalListings}</p>
                            <p className="text-xs text-green-600 mt-2">+{platformStats.recentListings} in last 30 days</p>
                          </div>

                          <div className="dd-card bg-surface border-surface p-6">
                            <div className="flex items-center justify-between mb-2">
                              <CheckCircle className="w-8 h-8 text-green-600" />
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-sm text-gray-500 mb-1">Active Listings</p>
                            <p className="text-3xl font-bold text-gray-900">{platformStats.activeListings}</p>
                            <p className="text-xs text-gray-600 mt-2">
                              {platformStats.totalListings > 0 
                                ? `${Math.round((platformStats.activeListings / platformStats.totalListings) * 100)}% of total`
                                : '0%'}
                            </p>
                          </div>

                          <div className="dd-card bg-surface border-surface p-6">
                            <div className="flex items-center justify-between mb-2">
                              <DollarSign className="w-8 h-8 text-green-600" />
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-900">${platformStats.totalRevenue.toLocaleString()}</p>
                            <p className="text-xs text-gray-600 mt-2">
                              {platformStats.soldListings} items sold
                            </p>
                          </div>
                        </div>

                        {/* User Type Distribution */}
                        <div className="dd-card bg-surface border-surface p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">User Distribution</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-900">Admins</span>
                                <Users className="w-5 h-5 text-blue-600" />
                              </div>
                              <p className="text-2xl font-bold text-blue-900">{platformStats.usersByType.admin}</p>
                              <p className="text-xs text-blue-700 mt-1">
                                {platformStats.totalUsers > 0
                                  ? `${Math.round((platformStats.usersByType.admin / platformStats.totalUsers) * 100)}%`
                                  : '0%'}
                              </p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-purple-900">Premium</span>
                                <Crown className="w-5 h-5 text-purple-600" />
                              </div>
                              <p className="text-2xl font-bold text-purple-900">{platformStats.usersByType.premium}</p>
                              <p className="text-xs text-purple-700 mt-1">
                                {platformStats.totalUsers > 0
                                  ? `${Math.round((platformStats.usersByType.premium / platformStats.totalUsers) * 100)}%`
                                  : '0%'}
                              </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">Regular</span>
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{platformStats.usersByType.regular}</p>
                              <p className="text-xs text-gray-700 mt-1">
                                {platformStats.totalUsers > 0
                                  ? `${Math.round((platformStats.usersByType.regular / platformStats.totalUsers) * 100)}%`
                                  : '0%'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Listings Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="dd-card bg-surface border-surface p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Listing Statistics</h4>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Active Listings</span>
                                <span className="font-semibold text-gray-900">{platformStats.activeListings}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Sold Listings</span>
                                <span className="font-semibold text-gray-900">{platformStats.soldListings}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Average Price</span>
                                <span className="font-semibold text-gray-900">${platformStats.averageListingPrice.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Sold Rate</span>
                                <span className="font-semibold text-gray-900">
                                  {platformStats.totalListings > 0
                                    ? `${Math.round((platformStats.soldListings / platformStats.totalListings) * 100)}%`
                                    : '0%'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="dd-card bg-surface border-surface p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Listings by Category</h4>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                              {Object.entries(platformStats.listingsByCategory)
                                .sort(([, a], [, b]) => b - a)
                                .map(([category, count]) => (
                                  <div key={category} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 capitalize">{category}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-primary-600"
                                          style={{
                                            width: `${platformStats.totalListings > 0 ? (count / platformStats.totalListings) * 100 : 0}%`
                                          }}
                                        />
                                      </div>
                                      <span className="font-semibold text-gray-900 w-8 text-right">{count}</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
                        <p className="text-gray-500">Unable to load platform statistics.</p>
                      </div>
                    )}
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

            {activeTab === 'costs' && (
              <ProtectedFeature requiredUserTypes={[UserType.ADMIN]}>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Gauge className="w-6 h-6 text-amber-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Cost &amp; Usage</h3>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Estimated Firestore usage against the free-tier daily quota. Figures are an
                      <span className="font-medium"> estimate</span> derived from live listing volume
                      and the assumptions below — authoritative spend lives in the Firebase console.
                    </p>
                    <a
                      href={`https://console.firebase.google.com/project/${import.meta.env.VITE_FIREBASE_PROJECT_ID || '_'}/usage`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline mb-6"
                    >
                      Open Firebase usage &amp; billing <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {isLoadingCosts ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                        <span className="ml-2 text-gray-600">Loading cost data...</span>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Estimate cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="dd-card bg-surface border-surface p-6">
                            <p className="text-sm text-gray-500 mb-1">Est. reads / day</p>
                            <p className="text-3xl font-bold text-gray-900">{costEstimate.daily.reads.toLocaleString()}</p>
                            <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${costEstimate.freeTierPct.reads > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(100, costEstimate.freeTierPct.reads)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              {Math.round(costEstimate.freeTierPct.reads)}% of {FIRESTORE_FREE_TIER.readsPerDay.toLocaleString()} free
                            </p>
                          </div>

                          <div className="dd-card bg-surface border-surface p-6">
                            <p className="text-sm text-gray-500 mb-1">Est. writes / day</p>
                            <p className="text-3xl font-bold text-gray-900">{costEstimate.daily.writes.toLocaleString()}</p>
                            <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${costEstimate.freeTierPct.writes > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(100, costEstimate.freeTierPct.writes)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              {Math.round(costEstimate.freeTierPct.writes)}% of {FIRESTORE_FREE_TIER.writesPerDay.toLocaleString()} free
                            </p>
                          </div>

                          <div className="dd-card bg-surface border-surface p-6">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm text-gray-500">Projected monthly cost</p>
                              <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">${costEstimate.projectedMonthlyCostUsd.toFixed(2)}</p>
                            <p className={`text-xs mt-2 ${costEstimate.exceedsFreeTier ? 'text-red-600' : 'text-green-600'}`}>
                              {costEstimate.exceedsFreeTier ? 'Projected to exceed free tier' : 'Within free tier'}
                              {costListingCount !== null && ` · ${costListingCount} listings stored`}
                            </p>
                          </div>
                        </div>

                        {/* Tunable assumptions */}
                        <div className="dd-card bg-surface border-surface p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Usage assumptions</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <label className="block">
                              <span className="text-sm text-gray-600">Daily sessions</span>
                              <input
                                type="number"
                                min={0}
                                value={costAssumptions.dailySessions}
                                onChange={(e) => setCostAssumptions(prev => ({ ...prev, dailySessions: Math.max(0, Number(e.target.value) || 0) }))}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </label>
                            <label className="block">
                              <span className="text-sm text-gray-600">Signed-in fraction (0–1)</span>
                              <input
                                type="number"
                                min={0}
                                max={1}
                                step={0.1}
                                value={costAssumptions.authedFraction}
                                onChange={(e) => setCostAssumptions(prev => ({ ...prev, authedFraction: Math.min(1, Math.max(0, Number(e.target.value) || 0)) }))}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </label>
                            <label className="block">
                              <span className="text-sm text-gray-600">Listings created / day</span>
                              <input
                                type="number"
                                min={0}
                                value={costAssumptions.listingsCreatedPerDay}
                                onChange={(e) => setCostAssumptions(prev => ({ ...prev, listingsCreatedPerDay: Math.max(0, Number(e.target.value) || 0) }))}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Budget alert thresholds */}
                        <div className="dd-card bg-surface border-surface p-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Budget alerts</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Configured in the GCP billing console (see <span className="font-mono">docs/firestore_costs.md</span>). Email fires at each threshold of actual spend.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {BUDGET_ALERT_THRESHOLDS.map(t => (
                              <span key={t} className="px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                ${t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ProtectedFeature>
            )}

            {activeTab === 'admin' && (
              <ProtectedFeature requiredUserTypes={[UserType.ADMIN]}>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-6 h-6 text-red-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Admin Panel</h3>
                    </div>
                    <p className="text-gray-600 mb-6">Manage users, listings, and system settings.</p>

                    {isLoadingAdmin ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                        <span className="ml-2 text-gray-600">Loading admin data...</span>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {/* User Management Section */}
                        <div className="dd-card bg-surface border-surface p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-primary-600" />
                              <h4 className="font-semibold text-gray-900">User Management</h4>
                              <span className="text-sm text-gray-500">({allUsers.length} users</span>
                              {allUsers.some(u => u.isBanned) && (
                                <>
                                  <span className="text-sm text-gray-400">•</span>
                                  <span className="text-sm text-red-600 font-semibold">
                                    {allUsers.filter(u => u.isBanned).length} banned
                                  </span>
                                </>
                              )}
                              <span className="text-sm text-gray-500">)</span>
                            </div>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search users..."
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {allUsers
                                  .filter(u => 
                                    !userSearchQuery || 
                                    u.displayName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                    u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
                                  )
                                  .slice(0, 50)
                                  .map((userProfile) => (
                                    <tr 
                                      key={userProfile.id} 
                                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                                        userProfile.isBanned ? 'bg-red-50' : ''
                                      }`}
                                    >
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          {userProfile.profileImage ? (
                                            <img src={userProfile.profileImage} alt={userProfile.displayName} className="w-8 h-8 rounded-full" />
                                          ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                              <User className="w-4 h-4 text-primary-600" />
                                            </div>
                                          )}
                                          <div>
                                            <span className={`font-medium ${userProfile.isBanned ? 'line-through text-gray-500' : ''}`}>
                                              {userProfile.displayName || 'Unknown'}
                                            </span>
                                            {userProfile.isBanned && (
                                              <span className="ml-2 text-xs text-red-600 font-semibold">BANNED</span>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-gray-600">{userProfile.email}</td>
                                      <td className="py-3 px-4">
                                        <select
                                          value={userProfile.userType}
                                          onChange={async (e) => {
                                            try {
                                              await updateUserType(userProfile.id, e.target.value as UserType)
                                              toast.success('User type updated')
                                              setAllUsers(prev => prev.map(u => 
                                                u.id === userProfile.id ? { ...u, userType: e.target.value as UserType } : u
                                              ))
                                            } catch (error: any) {
                                              toast.error(error.message || 'Failed to update user type')
                                            }
                                          }}
                                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                                          disabled={userProfile.isBanned}
                                        >
                                          <option value={UserType.REGULAR}>Regular</option>
                                          <option value={UserType.PREMIUM}>Premium</option>
                                          <option value={UserType.ADMIN}>Admin</option>
                                        </select>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex flex-col gap-1">
                                          <button
                                            onClick={async () => {
                                              try {
                                                await updateUserVerification(userProfile.id, !userProfile.isVerified)
                                                toast.success(`User ${!userProfile.isVerified ? 'verified' : 'unverified'}`)
                                                setAllUsers(prev => prev.map(u => 
                                                  u.id === userProfile.id ? { ...u, isVerified: !u.isVerified } : u
                                                ))
                                              } catch (error: any) {
                                                toast.error(error.message || 'Failed to update verification')
                                              }
                                            }}
                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                              userProfile.isVerified
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            }`}
                                            disabled={userProfile.isBanned}
                                          >
                                            {userProfile.isVerified ? 'Verified' : 'Unverified'}
                                          </button>
                                          <button
                                            onClick={async () => {
                                              const action = userProfile.isBanned ? 'unban' : 'ban'
                                              if (confirm(`Are you sure you want to ${action} this user?`)) {
                                                try {
                                                  await updateUserBanStatus(userProfile.id, !userProfile.isBanned)
                                                  toast.success(`User ${action}ned successfully`)
                                                  setAllUsers(prev => prev.map(u => 
                                                    u.id === userProfile.id ? { 
                                                      ...u, 
                                                      isBanned: !u.isBanned,
                                                      bannedAt: !u.isBanned ? new Date() : null
                                                    } : u
                                                  ))
                                                } catch (error: any) {
                                                  toast.error(error.message || `Failed to ${action} user`)
                                                }
                                              }
                                            }}
                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                              userProfile.isBanned
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            }`}
                                          >
                                            {userProfile.isBanned ? 'Unban' : 'Ban'}
                                          </button>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-gray-600 text-xs">
                                        {userProfile.createdAt instanceof Date
                                          ? userProfile.createdAt.toLocaleDateString()
                                          : new Date(userProfile.createdAt).toLocaleDateString()}
                                      </td>
                                      <td className="py-3 px-4">
                                        <button
                                          onClick={() => navigate(`/profile?userId=${userProfile.id}`)}
                                          className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                                        >
                                          View Profile
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Listing Management Section */}
                        <div className="dd-card bg-surface border-surface p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-5 h-5 text-primary-600" />
                              <h4 className="font-semibold text-gray-900">Listing Management</h4>
                              <span className="text-sm text-gray-500">({allListings.length} listings)</span>
                            </div>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search listings..."
                                value={listingSearchQuery}
                                onChange={(e) => setListingSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Listing</th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Views</th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {allListings
                                  .filter(l => 
                                    !listingSearchQuery || 
                                    l.title?.toLowerCase().includes(listingSearchQuery.toLowerCase())
                                  )
                                  .slice(0, 50)
                                  .map((listing) => (
                                    <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          {listing.images?.[0] ? (
                                            <img src={listing.images[0]} alt={listing.title} className="w-10 h-10 rounded object-cover" />
                                          ) : (
                                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                                              <Package className="w-5 h-5 text-gray-400" />
                                            </div>
                                          )}
                                          <div>
                                            <div className="font-medium text-gray-900">{listing.title}</div>
                                            <div className="text-xs text-gray-500">{listing.category}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 font-semibold">${Number(listing.price || 0).toFixed(2)}</td>
                                      <td className="py-3 px-4">
                                        <select
                                          value={listing.status === 'sold' ? 'sold' : listing.status === 'active' ? 'active' : 'inactive'}
                                          onChange={async (e) => {
                                            try {
                                              await adminUpdateListingStatus(listing.id, e.target.value as 'active' | 'sold' | 'inactive')
                                              toast.success('Listing status updated')
                                              setAllListings(prev => prev.map(l => 
                                                l.id === listing.id ? { ...l, status: e.target.value } : l
                                              ))
                                            } catch (error: any) {
                                              toast.error(error.message || 'Failed to update listing status')
                                            }
                                          }}
                                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        >
                                          <option value="active">Active</option>
                                          <option value="sold">Sold</option>
                                          <option value="inactive">Inactive</option>
                                        </select>
                                      </td>
                                      <td className="py-3 px-4 text-gray-600">{listing.views || 0}</td>
                                      <td className="py-3 px-4 text-gray-600 text-xs">
                                        {listing.createdAt instanceof Date
                                          ? listing.createdAt.toLocaleDateString()
                                          : new Date(listing.createdAt).toLocaleDateString()}
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex flex-col gap-2">
                                          <button
                                            onClick={() => navigate(`/listing/${listing.id}`)}
                                            className="text-primary-600 hover:text-primary-700 text-xs font-medium text-left"
                                          >
                                            View
                                          </button>
                                          <button
                                            onClick={async () => {
                                              if (confirm('Are you sure you want to permanently delete this listing? This action cannot be undone.')) {
                                                try {
                                                  await adminDeleteListing(listing.id)
                                                  toast.success('Listing deleted successfully')
                                                  setAllListings(prev => prev.filter(l => l.id !== listing.id))
                                                } catch (error: any) {
                                                  toast.error(error.message || 'Failed to delete listing')
                                                }
                                              }
                                            }}
                                            className="text-red-600 hover:text-red-700 text-xs font-medium text-left font-semibold"
                                          >
                                            <XCircle className="w-4 h-4 inline mr-1" />
                                            Delete
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
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
