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
  Share2
} from 'lucide-react';
import { Item, User as UserType } from '../types';
import { formatCurrency, formatRelativeTime } from '../utils/helpers';

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get listing data from location state or fetch from API
  const [listing, setListing] = useState<Item | null>(location.state?.listing || null);
  const [loading, setLoading] = useState(!listing);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load listing data if not provided in state
  useEffect(() => {
    if (!listing && id) {
      // In a real app, you would fetch from API here
      // For now, we'll use mock data
      const mockListing: Item = {
        id: id,
        title: "MacBook Pro 13-inch M2",
        description: "Excellent condition MacBook Pro with M2 chip. Perfect for students. Includes original charger and box. No scratches or dents. Used for one semester only.",
        price: 1200,
        originalPrice: 1599,
        condition: "LIKE_NEW" as any,
        category: "ELECTRONICS" as any,
        images: [
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
          "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500",
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"
        ],
        seller: {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          rating: 4.8,
          totalSales: 15,
          isVerified: true,
          school: "University of Louisiana",
          joinDate: "2023-01-15",
          joinedDate: "2023-01-15",
          reviewCount: 12
        } as UserType,
        location: "Lafayette, LA",
        pickupAvailable: true,
        deliveryAvailable: true,
        deliveryFee: 5,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        posted: "2024-01-15",
        status: "ACTIVE" as any,
        views: 45,
        likes: 8,
        isLiked: false,
        isInCart: false,
        isInWishlist: false,
        tags: ["laptop", "macbook", "m2", "student", "electronics"],
        pickupMethod: "BOTH" as any
      };
      setListing(mockListing);
      setLoading(false);
    }
  }, [id, listing]);

  const handleAddToCart = () => {
    if (listing) {
      // You could add a toast notification here
      console.log('Added to cart:', listing.title);
    }
  };

  const handleAddToWishlist = () => {
    if (listing) {
      // You could add a toast notification here
      console.log('Added to wishlist:', listing.title);
    }
  };

  const handleContactSeller = () => {
    // Navigate to chat or contact form
    navigate('/chat', { state: { seller: listing?.seller, listing } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h2>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddToWishlist}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span className="hidden sm:inline">Wishlist</span>
              </button>
              
              <button
                onClick={handleAddToCart}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
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
            <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={listing.images[currentImageIndex] || '/api/placeholder/600/400'}
                alt={listing.title}
                className="w-full h-96 object-cover"
              />
            </div>
            
            {/* Thumbnail Gallery */}
            {listing.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-primary-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-primary-600">
                  {formatCurrency(listing.price)}
                </span>
                {listing.originalPrice && listing.originalPrice > listing.price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatCurrency(listing.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Condition and Category */}
            <div className="flex items-center space-x-4">
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                {listing.condition}
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                {listing.category}
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                {listing.pickupMethod}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
            </div>

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Information */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{listing.seller.name}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {listing.seller.rating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">
                      {listing.seller.totalSales} sales
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleContactSeller}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contact Seller</span>
              </button>
            </div>

            {/* Listing Details */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Listing Details</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{listing.location}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Posted {formatRelativeTime(listing.posted)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700">
                    {listing.pickupAvailable ? 'Pickup Available' : 'Pickup Not Available'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700">
                    {listing.deliveryAvailable ? 'Delivery Available' : 'Delivery Not Available'}
                  </span>
                </div>
                {listing.deliveryFee && (
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-700">
                      Delivery Fee: {formatCurrency(listing.deliveryFee)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
              
              <button
                onClick={handleAddToWishlist}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Heart className="w-5 h-5" />
                <span>Add to Wishlist</span>
              </button>
              
              <button className="p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListingDetailPage;
