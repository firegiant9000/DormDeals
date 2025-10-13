import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Shield, 
  Search, 
  MessageCircle, 
  CreditCard,
  TrendingUp,
  Heart
} from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: ShoppingBag,
      title: 'Easy Marketplace',
      description: 'Browse and discover items from fellow UL students with our intuitive marketplace interface.'
    },
    {
      icon: DollarSign,
      title: 'Affordable Prices',
      description: 'Save money by buying used items or make extra cash by selling what you no longer need.'
    },
    {
      icon: Users,
      title: 'Trusted Community',
      description: 'Connect with verified UL students in a safe and secure campus environment.'
    },
    {
      icon: Shield,
      title: 'Safe Transactions',
      description: 'Secure payment processing and user verification for complete peace of mind.'
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find exactly what you need with our advanced filtering and search capabilities.'
    },
    {
      icon: Heart,
      title: 'Sustainable Living',
      description: 'Reduce waste and promote sustainability by giving items a second life.'
    }
  ]

  const howItWorks = [
    {
      step: 1,
      icon: Search,
      title: 'Browse & Search',
      description: 'Explore our marketplace to find items you need or discover something new.'
    },
    {
      step: 2,
      icon: MessageCircle,
      title: 'Connect & Chat',
      description: 'Connect with fellow students to ask questions and arrange meetups.'
    },
    {
      step: 3,
      icon: CreditCard,
      title: 'Secure Payment',
      description: 'Complete your transaction safely with our secure payment system.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-40 -translate-x-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
            >
              Your Campus
              <span className="block text-primary-200">Marketplace</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-primary-100 leading-relaxed"
            >
              The ultimate marketplace for UL students to buy, sell, and rent items within their campus community. 
              Save money, make money, and build connections.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link
                to="/marketplace"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-10 rounded-xl transition-all duration-300 flex items-center justify-center text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-10 rounded-xl transition-all duration-300 text-lg"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose DormDeals?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're built specifically for UL students, making campus life more affordable, sustainable, and connected.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border border-gray-100 hover:border-primary-200"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started is simple. Follow these three easy steps to join our community.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorks.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative text-center"
                >
                  {/* Connection line for desktop */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-300 to-primary-200 transform translate-x-1/2"></div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-primary-100">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-200">Active Students</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold mb-2">1,200+</div>
              <div className="text-primary-200">Items Listed</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold mb-2">$15K+</div>
              <div className="text-primary-200">Money Saved</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <div className="text-primary-200">User Rating</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Campus Life?
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Join hundreds of UL students who are already buying, selling, and saving money with DormDeals. 
              Start your journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/marketplace"
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center"
              >
                Explore Marketplace
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/create-listing"
                className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300 text-lg inline-flex items-center justify-center"
              >
                Start Selling
                <TrendingUp className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
