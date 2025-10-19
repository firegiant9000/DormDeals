import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Settings, Heart, ShoppingBag, MessageSquare, Star, Edit3 } from 'lucide-react'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('listings')

  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@louisiana.edu',
    phone: '(555) 123-4567',
    location: 'UL Campus',
    joinedDate: 'August 2023',
    rating: 4.8,
    totalSales: 12,
    profileImage: null
  }

  const listings = [
    {
      id: 1,
      title: 'MacBook Pro 13"',
      price: 800,
      status: 'Active',
      views: 45,
      image: '/api/placeholder/200/150'
    },
    {
      id: 2,
      title: 'Calculus Textbook',
      price: 50,
      status: 'Sold',
      views: 23,
      image: '/api/placeholder/200/150'
    }
  ]

  const tabs = [
    { id: 'listings', label: 'My Listings', icon: ShoppingBag },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

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
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary-600" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold">{user.rating}</span>
                    </div>
                    <p className="text-sm text-gray-500">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{user.totalSales}</p>
                    <p className="text-sm text-gray-500">Items Sold</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <span className="ml-2 font-medium">{user.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-2 font-medium">{user.location}</span>
                </div>
                <div>
                  <span className="text-gray-500">Member since:</span>
                  <span className="ml-2 font-medium">{user.joinedDate}</span>
                </div>
              </div>
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
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'listings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">My Listings</h2>
                  <button className="btn-primary">
                    Create New Listing
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="dd-card bg-surface border-surface overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="h-32 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Image</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                        <p className="text-lg font-bold text-primary-600 mb-2">${listing.price}</p>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded text-xs ${
                            listing.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {listing.status}
                          </span>
                          <span>{listing.views} views</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-4">Items you favorite will appear here</p>
                <button className="btn-primary">Browse Marketplace</button>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages</h3>
                <p className="text-gray-500">Your conversations will appear here</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                      <input type="text" defaultValue={user.name} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" defaultValue={user.email} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input type="tel" defaultValue={user.phone} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input type="text" defaultValue={user.location} className="input-field" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <button className="btn-primary">Save Changes</button>
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
