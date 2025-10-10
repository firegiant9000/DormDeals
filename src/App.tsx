import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Marketplace from '@/pages/Marketplace'
import ItemDetail from '@/pages/ItemDetail'
import CreateListing from '@/pages/CreateListing'
import Profile from '@/pages/Profile'

function App() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </motion.div>
  )
}

export default App
