import { Heart, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">DormDeals</h3>
            <p className="text-gray-300 mb-4 max-w-md">
              Connecting UL students to buy, sell, and rent items within their campus community. 
              Making college life more affordable and sustainable.
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <Heart className="w-4 h-4 mr-1" />
              <span>Made with love for UL students</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/marketplace" className="text-gray-300 hover:text-white transition-colors">Marketplace</a></li>
              <li><a href="/create-listing" className="text-gray-300 hover:text-white transition-colors">Sell Items</a></li>
              <li><a href="/profile" className="text-gray-300 hover:text-white transition-colors">My Profile</a></li>
              <li><a href="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-2" />
                support@dormdeals.com
              </li>
              <li className="flex items-center text-gray-300">
                <Phone className="w-4 h-4 mr-2" />
                (555) 123-4567
              </li>
              <li className="flex items-center text-gray-300">
                <MapPin className="w-4 h-4 mr-2" />
                University of Louisiana
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 DormDeals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
