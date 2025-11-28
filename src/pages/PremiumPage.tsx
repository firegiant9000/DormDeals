import { motion } from 'framer-motion'
import { Crown, ArrowRight, Sparkles, TrendingUp, Zap, Shield, BarChart3 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAccessControl } from '../hooks/useAccessControl'
import { useEffect } from 'react'

const PremiumPage = () => {
  const { isAuthenticated } = useAuth()
  const { isPremium } = useAccessControl()
  const navigate = useNavigate()

  useEffect(() => {
    // If user is already premium, redirect to profile
    if (isAuthenticated && isPremium()) {
      navigate('/profile')
    }
  }, [isAuthenticated, isPremium, navigate])

  const features = [
    {
      icon: Sparkles,
      title: 'Featured Listings',
      description: 'Get your listings featured at the top of search results and on the homepage'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Track your listing performance with detailed analytics and insights'
    },
    {
      icon: Zap,
      title: 'Unlimited Listings',
      description: 'Post as many items as you want without any restrictions'
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: 'Get faster response times and dedicated support for your account'
    },
    {
      icon: BarChart3,
      title: 'Custom Reports',
      description: 'Export your data and generate custom reports for your listings'
    }
  ]

  if (isAuthenticated && isPremium()) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-body mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Unlock powerful features to boost your sales and grow your marketplace presence
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="dd-card bg-surface border-surface border-2 border-primary-200 dark:border-primary-800 p-8 md:p-12 mb-12 shadow-xl"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-baseline mb-4">
              <span className="text-5xl font-bold text-body">$0.99</span>
              <span className="text-xl text-muted ml-2">/month</span>
            </div>
            <p className="text-muted">Cancel anytime. No hidden fees.</p>
          </div>

          <div className="space-y-6 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-body mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-muted">{feature.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    // In a real app, this would integrate with a payment provider
                    alert('Payment integration coming soon! For now, please contact an admin to upgrade your account.')
                  }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <Crown className="w-5 h-5" />
                  Subscribe Now
                </button>
                <Link
                  to="/profile"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-surface text-body rounded-xl font-semibold hover:bg-surface-2 transition-colors"
                >
                  Maybe Later
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Sign In to Subscribe
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-surface text-body rounded-xl font-semibold hover:bg-surface-2 transition-colors"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dd-card bg-surface border-surface p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-body mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-body mb-2">Can I cancel anytime?</h3>
              <p className="text-muted">Yes, you can cancel your premium subscription at any time. Your premium features will remain active until the end of your billing period.</p>
            </div>
            <div>
              <h3 className="font-semibold text-body mb-2">What happens to my featured listings if I cancel?</h3>
              <p className="text-muted">Your listings will remain featured until the end of your billing period. After that, they will return to regular listings.</p>
            </div>
            <div>
              <h3 className="font-semibold text-body mb-2">Do I get a refund if I cancel?</h3>
              <p className="text-muted">We offer a 30-day money-back guarantee. If you&apos;re not satisfied, contact us within 30 days for a full refund.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PremiumPage

