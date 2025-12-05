import { motion } from 'framer-motion'
import { Users, Shield, Heart, Target, Award, Globe } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const AboutPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleStartSelling = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAuthenticated) {
      navigate('/create-listing')
    } else {
      navigate('/login')
    }
  }
  const stats = [
    { label: 'Active Students', value: '1,200+' },
    { label: 'Items Listed', value: '5,000+' },
    { label: 'Successful Transactions', value: '3,500+' },
    { label: 'Money Saved', value: '$50K+' }
  ]

  const values = [
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in the power of student communities to support each other.'
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Every user is verified, and we provide secure transaction methods.'
    },
    {
      icon: Heart,
      title: 'Sustainability',
      description: 'We promote reuse and reduce waste by extending the life of items.'
    },
    {
      icon: Target,
      title: 'Affordability',
      description: 'Making college life more affordable for every student.'
    }
  ]

  return (
    <div className="min-h-[100svh] bg-transparent text-body">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              About DormDeals
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-100"
            >
              Connecting UL students to buy, and sell items within their campus community.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Award className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-body mb-4">
                Our Mission
              </h2>
            </motion.div>
            <p className="text-xl text-muted max-w-4xl mx-auto leading-relaxed">
              DormDeals was born from a simple idea: college students shouldn&apos;t have to pay full price for everything. 
              We&apos;re building a sustainable marketplace where UL students can buy and sell items from each other, 
              making campus life more affordable while reducing waste and building community connections.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-muted font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-body mb-4">
              Our Values
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              The principles that guide everything we do at DormDeals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow duration-300 dd-card bg-surface border-surface"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-body mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted">
                    {value.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

  

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Globe className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join Our Community
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              Be part of the movement making college life more affordable and sustainable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/marketplace"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Start Shopping
              </Link>
              <button
                onClick={handleStartSelling}
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Start Selling
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage

