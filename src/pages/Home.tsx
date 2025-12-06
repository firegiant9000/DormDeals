import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Item } from '@/types'
import { getListings } from '@/services/listingsService'
import { formatCurrency, formatRelativeTime } from '@/utils/helpers'
import ListingCard from '@/components/ListingCard'

const Home = () => {
  const navigate = useNavigate()
  const [featuredItems, setFeaturedItems] = useState<Item[]>([])
  const [featuredItem, setFeaturedItem] = useState<Item | null>(null)
  
  // Fetch featured item (single featured item for hero section)
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const featured = await getListings({ featured: true, active: true, limitCount: 1 })
        if (featured.length > 0) {
          setFeaturedItem(featured[0])
          if (import.meta.env.DEV) console.log('[HOME] Featured item loaded', featured[0])
        }
      } catch (err: any) {
        if (import.meta.env.DEV) console.error('[HOME] Error fetching featured item', err)
      }
    }
    fetchFeatured()
  }, [])

  // Fetch all featured items
  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const featured = await getListings({ featured: true, active: true })
        setFeaturedItems(featured)
        if (import.meta.env.DEV) console.log('[HOME] Featured items loaded', featured.length)
      } catch (err: any) {
        if (import.meta.env.DEV) console.error('[HOME] Error fetching featured items', err)
      }
    }
    fetchFeaturedItems()
  }, [])

  return (
    <div>
      {/* Small Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
            Find Your Perfect Dorm Items
          </h1>
          <p className="text-lg md:text-xl text-primary-100 text-center">
            Browse items from fellow UL students and discover great deals on campus
          </p>
        </div>
      </div>

      {/* Featured Item Card */}
      {featuredItem && (
        <div className="container mx-auto px-4 py-6">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 border-2 border-primary-200 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-primary-600 fill-primary-600" />
              <h2 className="text-xl font-bold text-primary-900">Featured Item</h2>
            </div>
            <div 
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col md:flex-row"
              onClick={() => navigate(`/listing/${featuredItem.id}`)}
            >
              <div className="md:w-1/3 h-64 md:h-auto bg-gray-200 overflow-hidden">
                <img
                  src={featuredItem.images?.[0] || (featuredItem as any).imageUrls?.[0] || '/api/placeholder/400/300'}
                  alt={featuredItem.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'
                  }}
                />
              </div>
              <div className="md:w-2/3 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 pr-4">{featuredItem.title}</h3>
                    <span className="text-3xl font-bold text-primary-600 whitespace-nowrap">
                      {formatCurrency(featuredItem.price)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">{featuredItem.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                      {featuredItem.category}
                    </span>
                    <span>{formatRelativeTime(featuredItem.posted)}</span>
                  </div>
                </div>
                <button 
                  className="btn-primary w-full md:w-auto self-start"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/listing/${featuredItem.id}`)
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Items Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-primary-600 fill-primary-600" />
          <h2 className="text-2xl font-semibold">Featured Items</h2>
        </div>

        {featuredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No featured items available at the moment.</p>
            <p className="text-sm mt-2">Check back later for featured listings!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
