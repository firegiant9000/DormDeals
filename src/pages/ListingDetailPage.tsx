import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  ShoppingCart, 
  Star, 
  MapPin, 
  Calendar,
  User,
  MessageCircle,
  Share2,
  Trash2
} from 'lucide-react';
import { Item } from '../types';
import { useShop } from '@/context/ShopContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatRelativeTime } from '../utils/helpers';
import { deleteListing } from '@/services/listingService';
import toast from 'react-hot-toast';

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const DEBUG = new URLSearchParams(location.search).has('debug');
  const dlog = (...a: any[]) => { if (DEBUG) console.log('[LISTING_DETAIL]', ...a); };
  
  // Get listing data from location state or fetch from API
  const [listing, setListing] = useState<Item | null>(location.state?.listing || null);
  
  useEffect(() => {
    if (listing) {
      const listingData = listing as any
      dlog('imageUrls', listingData?.imageUrls);
    }
  }, [listing]);
  const [loading, setLoading] = useState(!listing);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart, addToWishlist, removeFromCart, removeFromWishlist, openCart, openWishlist, isInCart, isInWishlist } = useShop();
  const authContext = useAuth();
  const user = authContext?.user || null;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load listing data if not provided in state
  useEffect(() => {
    const fetchListing = async () => {
      if (!listing && id) {
        try {
          setLoading(true);
          const { getListingById } = await import('../services/listingsService');
          const fetchedListing = await getListingById(id);
          
          if (fetchedListing) {
            setListing(fetchedListing);
            // Increment view count
            const { incrementListingViews } = await import('../services/listingsService');
            incrementListingViews(id).catch(console.error);
          } else {
            throw new Error('Listing not found');
          }
        } catch (error) {
          console.error('Error fetching listing:', error);
          toast.error('Failed to load listing');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchListing();
  }, [id, listing]);

  const handleAddToCart = () => {
    if (!listing) return;
    if (!isInCart(listing.id)) addToCart(listing); else openCart();
  };

  const handleAddToWishlist = () => {
    if (!listing) return;
    if (!isInWishlist(listing.id)) addToWishlist(listing); else openWishlist();
  };

  const handleContactSeller = () => {
    // Navigate to messages page with seller and listing info
    const sellerId = listing?.seller?.id || (listing as any)?.ownerId
    navigate('/messages', { state: { to: sellerId, listingId: listing?.id } });
  };

  if (loading) {
    return (
      <div className="min-h-[100svh] bg-transparent text-body flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-[100svh] bg-transparent text-body flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-body mb-4">Listing Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-transparent text-body">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-surface sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-body hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={openWishlist}
                className="flex items-center space-x-2 text-body hover:text-primary-600 transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span className="hidden sm:inline">Wishlist</span>
              </button>
              
              <button
                onClick={openCart}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="w-full max-w-[900px]">
              <div className="relative w-full rounded-xl overflow-hidden bg-muted/20" style={{ aspectRatio: '16 / 9' }}>
                {(() => {
                  const listingData = listing as any
                  const imageUrls = listingData?.imageUrls || listing?.images || []
                  const cover = imageUrls[currentImageIndex] ?? imageUrls[0] ?? ''
                  
                  if (cover) {
                    return (
                      <img
                        src={cover}
                        alt={listing?.title ?? 'Listing image'}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    )
                  }
                  return (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                      No image
                    </div>
                  )
                })()}
              </div>
            </div>
            
            {/* Thumbnail Gallery */}
            {(() => {
              const listingData = listing as any
              const imageUrls = listingData?.imageUrls || listing?.images || []
              if (imageUrls.length > 1) {
                return (
                  <div className="flex space-x-2 overflow-x-auto">
                    {imageUrls.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 h-16 w-20 overflow-hidden rounded-lg border border-surface bg-surface ${
                          currentImageIndex === index ? 'border-primary-600' : ''
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${listing?.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                )
              }
              return null
            })()}
          </div>

          {/* Listing Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-body mb-2">{listing.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-primary-600">
                  {formatCurrency(listing.price)}
                </span>
                {listing.originalPrice && listing.originalPrice > listing.price && (
                  <span className="text-xl text-muted line-through">
                    {formatCurrency(listing.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Condition and Category */}
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-surface-2 border border-surface text-muted">
                {listing.condition}
              </span>
              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-surface-2 border border-surface text-muted">
                {listing.category}
              </span>
              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-surface-2 border border-surface text-muted">
                {listing.pickupMethod}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-body mb-3">Description</h3>
              <p className="text-muted leading-relaxed">{listing.description}</p>
            </div>

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-body mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-surface-2 border border-surface text-body"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Information */}
            <div className="dd-card bg-surface border-surface p-6">
              <h3 className="text-lg font-semibold text-body mb-4">Seller Information</h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-surface-2 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-muted" />
                </div>
                <div>
                  <h4 className="font-semibold text-body">{listing.seller.name}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-muted ml-1">
                        {listing.seller.rating}
                      </span>
                    </div>
                    <span className="text-sm text-muted">•</span>
                    <span className="text-sm text-muted">
                      {listing.seller.totalSales} sales
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleContactSeller}
                className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contact Seller</span>
              </button>
              {user && (listing as any)?.ownerId === (user as any)?.uid && (
                <button
                  onClick={async () => {
                    if (confirm('Delete this listing? This cannot be undone.')) {
                      try {
                        await deleteListing(listing.id, (user as any).uid)
                        toast.success('Listing deleted')
                        navigate('/profile?tab=listings')
                      } catch (e: any) {
                        toast.error(e.message ?? 'Failed to delete listing')
                      }
                    }
                  }}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete listing</span>
                </button>
              )}
            </div>

            {/* Listing Details */}
            <div className="dd-card bg-surface border-surface p-6">
              <h3 className="text-lg font-semibold text-body mb-4">Listing Details</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-muted" />
                  <span className="text-body">{listing.location}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-muted" />
                  <span className="text-body">Posted {formatRelativeTime(listing.posted)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-body">
                    {listing.pickupAvailable ? 'Pickup Available' : 'Pickup Not Available'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-body">
                    {listing.deliveryAvailable ? 'Delivery Available' : 'Delivery Not Available'}
                  </span>
                </div>
                {listing.deliveryFee && (
                  <div className="flex items-center space-x-3">
                    <span className="text-body">
                      Delivery Fee: {formatCurrency(listing.deliveryFee)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => { if (!isInCart(listing.id)) handleAddToCart(); else removeFromCart(listing.id); }}
                  className={`flex-1 py-3 rounded-lg flex items-center justify-center space-x-2 ${isInCart(listing.id) ? 'border border-red-300 text-red-700 hover:bg-red-50' : 'bg-primary-600 text-white hover:bg-primary-700 transition-colors'}`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{isInCart(listing.id) ? 'Remove from Cart' : 'Add to Cart'}</span>
                </button>
                
                <button
                  onClick={() => { if (!isInWishlist(listing.id)) handleAddToWishlist(); else removeFromWishlist(listing.id); }}
                  className={`flex-1 py-3 rounded-lg flex items-center justify-center space-x-2 ${isInWishlist(listing.id) ? 'border border-red-300 text-red-600 hover:bg-red-50' : 'border border-surface text-body hover:bg-surface-2 transition-colors'}`}
                >
                  <Heart className="w-5 h-5" />
                  <span>{isInWishlist(listing.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                </button>
                
                <button className="p-3 border border-surface text-body rounded-lg hover:bg-surface-2 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Global drawers are rendered at App root via ShopDrawers */}
    </div>
  );
};

export default ListingDetailPage;
