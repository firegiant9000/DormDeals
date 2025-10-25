import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Plus, User, Home, Menu, X, ChevronDown, Moon, Sun, ShoppingCart, Heart, MessageCircle, GraduationCap, Info, LogIn, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const location = useLocation()
  const { theme, toggle } = useTheme()
  const { openCart, openWishlist } = useShop()
  const { isAuthenticated, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { path: '/about', label: 'About', icon: Info },
  ]

  const userMenuItems = isAuthenticated ? [
    { path: '/profile', label: 'Profile' },
    { path: '/create-listing', label: 'Create Listing' },
    { path: '/logout', label: 'Logout', action: logout },
  ] : [
    { path: '/login', label: 'Login' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-surface-2 border-b border-surface sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg relative flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-primary-600">DormDeals</span>
          </Link>

          {/* Desktop Navigation Items */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className="flex items-center justify-center w-10 h-10 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
            {/* Cart, Wishlist, Chat */}
            <div className="flex items-center gap-3">
              <button onClick={openCart} className="px-3 py-2 rounded-lg border border-surface hover:bg-surface-2">
                <ShoppingCart className="w-4 h-4" />
              </button>
              <button onClick={openWishlist} className="px-3 py-2 rounded-lg border border-surface hover:bg-surface-2">
                <Heart className="w-4 h-4" />
              </button>
              <Link to="/chat" className="px-3 py-2 rounded-lg border border-surface hover:bg-surface-2">
                <MessageCircle className="w-4 h-4" />
              </Link>
            </div>
            
            <Link
              to="/create-listing"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 border border-transparent dark:focus:ring-offset-slate-900"
            >
              <Plus className="w-4 h-4" />
              <span>Sell</span>
            </Link>
            
            {/* User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {isAuthenticated ? <User className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span>{isAuthenticated ? 'Account' : 'Login'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 dd-card bg-surface border-surface text-body py-1 z-50"
                  >
                    {userMenuItems.map((item) => (
                      item.action ? (
                        <button
                          key={item.path}
                          onClick={() => {
                            item.action?.()
                            setIsUserMenuOpen(false)
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-surface-2 w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-surface-2"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {item.path === '/login' && <LogIn className="w-4 h-4" />}
                          {item.label}
                        </Link>
                      )
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile menu button and theme toggle */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggle}
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 p-2"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-surface"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                
                <div className="border-t border-surface pt-4 mt-4 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => { openCart(); setIsMobileMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-surface rounded-lg hover:bg-surface-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm">Cart</span>
                    </button>
                    <button
                      onClick={() => { openWishlist(); setIsMobileMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-surface rounded-lg hover:bg-surface-2"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">Wishlist</span>
                    </button>
                    <Link
                      to="/chat"
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-surface rounded-lg hover:bg-surface-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Chat</span>
                    </Link>
                  </div>
                  {isAuthenticated ? (
                    <Link
                      to="/create-listing"
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 border border-transparent dark:focus:ring-offset-slate-900"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create Listing</span>
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 border border-transparent dark:focus:ring-offset-slate-900"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Login</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar
