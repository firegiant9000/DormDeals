import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-[100svh] bg-transparent text-inherit flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-6xl font-bold text-primary-600 mb-4">404</div>
            <div className="text-gray-400 mb-4">
              <Search className="w-24 h-24 mx-auto" />
            </div>
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-primary-600 text-white hover:bg-primary-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Or try these popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/marketplace"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
              >
                Marketplace
              </Link>
              <Link
                to="/about"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/profile"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
              >
                Profile
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFoundPage

