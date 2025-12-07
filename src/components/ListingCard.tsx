import { Heart, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Item } from '@/types'
import { useShop } from '@/context/ShopContext'
import { formatCurrency } from '@/utils/helpers'

interface ListingCardProps {
  listing: Item
  onClick?: () => void
}

const ListingCard = ({ listing, onClick }: ListingCardProps) => {
  const navigate = useNavigate()
  const { addToCart, addToWishlist, isInCart, isInWishlist } = useShop()

  const handleCardClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(`/listing/${listing.id}`)
    }
  }
  if (import.meta.env.DEV) {
    console.log('[CARD] listing', listing.id, listing.title, 'isFeatured =', listing.isFeatured);
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(listing)
  }

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToWishlist(listing)
  }

  // Handle both imageUrls and images properties
  const coverImage = (listing as any).imageUrls?.[0] || listing.images?.[0]
  const inCart = isInCart(listing.id)
  const inWishlist = isInWishlist(listing.id)

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden cursor-pointer flex flex-col h-full"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={listing.title} 
            className="w-full h-full object-cover" 
            loading="lazy" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Name */}
        <h3 className={`font-semibold text-lg mb-2 line-clamp-2 ${
          listing.isFeatured 
            ? 'text-yellow-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.6)]' 
            : 'text-gray-900'
        }`}>
          {listing.title}
        </h3>

        {/* Price */}
        <div className="text-xl font-bold text-primary-600 mb-2">
          {formatCurrency(listing.price)}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
          {listing.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              inCart
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <ShoppingCart size={16} />
            {inCart ? 'In Cart' : 'Add to Cart'}
          </button>
          <button
            onClick={handleAddToWishlist}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              inWishlist
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart size={16} className={inWishlist ? 'fill-current' : ''} />
          </button>
        </div>
      </div>
    </div>
  )
  
}

export default ListingCard

