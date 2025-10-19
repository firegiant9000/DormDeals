import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import { ShopDrawers } from '@/context/ShopContext'
import Home from '@/pages/Home'
import Marketplace from '@/pages/Marketplace'
import ItemDetail from '@/pages/ItemDetail'
import CreateListing from '@/pages/CreateListing'
import Profile from '@/pages/Profile'
import ResultsPage from '@/pages/ResultsPage'
import AboutPage from '@/pages/AboutPage'
import MainFeaturePage from '@/pages/MainFeaturePage'
import ListingDetailPage from '@/pages/ListingDetailPage'
import MessagePage from '@/pages/MessagePage'
import Checkout from '@/pages/Checkout'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[100svh] bg-transparent text-body"
    >
      <Layout>
        <Routes>
        <Route path="/" element={<MainFeaturePage />} />  {/* Now the homepage */}
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/chat" element={<MessagePage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/:feature" element={<MainFeaturePage />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
      <ShopDrawers />
    </motion.div>
  )
}

export default App
