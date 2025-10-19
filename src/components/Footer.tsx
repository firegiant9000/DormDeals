import { Heart, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Brand */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">DormDeals</span>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
            <Link to="/marketplace" className="text-gray-300 hover:text-white transition-colors text-sm">
              Marketplace
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
              About
            </Link>
            <Link to="/profile" className="text-gray-300 hover:text-white transition-colors text-sm">
              Profile
            </Link>
            <a href="mailto:support@dormdeals.com" className="flex items-center text-gray-300 hover:text-white transition-colors text-sm">
              <Mail className="w-4 h-4 mr-1" />
              Support
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-400">
            &copy; 2024 DormDeals. Made with ❤️ for UL students.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
