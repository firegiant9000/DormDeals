import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '@/components/Layout'
import { ShopDrawers } from '@/context/ShopContext'
import LoginPopupWrapper from '@/components/LoginPopupWrapper'
import PageTransition from '@/components/PageTransition'
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
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  const location = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[100svh] bg-transparent text-body"
    >
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <PageTransition>
                <MainFeaturePage />
              </PageTransition>
            } />
            <Route path="/marketplace" element={
              <PageTransition>
                <Marketplace />
              </PageTransition>
            } />
            <Route path="/results" element={
              <PageTransition>
                <ResultsPage />
              </PageTransition>
            } />
            <Route path="/about" element={
              <PageTransition>
                <AboutPage />
              </PageTransition>
            } />
            <Route path="/profile" element={
              <PageTransition>
                <Profile />
              </PageTransition>
            } />
            <Route path="/item/:id" element={
              <PageTransition>
                <ItemDetail />
              </PageTransition>
            } />
            <Route path="/listing/:id" element={
              <PageTransition>
                <ListingDetailPage />
              </PageTransition>
            } />
            <Route path="/create-listing" element={
              <PageTransition>
                <CreateListing />
              </PageTransition>
            } />
            <Route path="/checkout" element={
              <PageTransition>
                <Checkout />
              </PageTransition>
            } />
            <Route path="/chat" element={
              <PageTransition>
                <MessagePage />
              </PageTransition>
            } />
            <Route path="/login" element={
              <PageTransition>
                <LoginPage />
              </PageTransition>
            } />
            <Route path="/register" element={
              <PageTransition>
                <RegisterPage />
              </PageTransition>
            } />
            <Route path="/home" element={
              <PageTransition>
                <Home />
              </PageTransition>
            } />
            <Route path="/:feature" element={
              <PageTransition>
                <MainFeaturePage />
              </PageTransition>
            } />
            <Route path="*" element={
              <PageTransition>
                <NotFoundPage />
              </PageTransition>
            } />
          </Routes>
        </AnimatePresence>
      </Layout>
      <ShopDrawers />
      <LoginPopupWrapper />
    </motion.div>
  )
}

export default App
