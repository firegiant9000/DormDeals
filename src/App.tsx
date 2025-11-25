import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '@/components/Layout'
import { ShopDrawers } from '@/context/ShopContext'
import LoginPopupWrapper from '@/components/LoginPopupWrapper'
import PageTransition from '@/components/PageTransition'
import ProtectedRoute from '@/components/ProtectedRoute'

const MainFeaturePage = lazy(() => import('@/pages/MainFeaturePage'))
const Marketplace = lazy(() => import('@/pages/Marketplace'))
const ResultsPage = lazy(() => import('@/pages/ResultsPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const Profile = lazy(() => import('@/pages/Profile'))
const ItemDetail = lazy(() => import('@/pages/ItemDetail'))
const ListingDetailPage = lazy(() => import('@/pages/ListingDetailPage'))
const CreateListing = lazy(() => import('@/pages/CreateListing'))
const Checkout = lazy(() => import('@/pages/Checkout'))
const MessagePage = lazy(() => import('@/pages/MessagePage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const Home = lazy(() => import('@/pages/Home'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function App() {
  const location = useLocation();
  const RouteFallback = (
    <div className="min-h-[50vh] flex items-center justify-center text-muted">
      Loading...
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[100svh] bg-transparent text-body"
    >
      <Layout>
        <Suspense fallback={RouteFallback}>
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
              <ProtectedRoute>
                <PageTransition>
                  <Profile />
                </PageTransition>
              </ProtectedRoute>
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
              <ProtectedRoute>
                <PageTransition>
                  <CreateListing />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <PageTransition>
                  <Checkout />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <PageTransition>
                  <MessagePage />
                </PageTransition>
              </ProtectedRoute>
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
        </Suspense>
      </Layout>
      <ShopDrawers />
      <LoginPopupWrapper />
    </motion.div>
  )
}

export default App
