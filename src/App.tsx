import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '@/components/Layout'
import { ShopDrawers } from '@/context/ShopContext'
import LoginPopupWrapper from '@/components/LoginPopupWrapper'
import PageTransition from '@/components/PageTransition'
import ProtectedRoute from '@/components/ProtectedRoute'
import DebugDrawer from '@/components/DebugDrawer'

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
const PremiumPage = lazy(() => import('@/pages/PremiumPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function App() {
  const location = useLocation()
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
              <Route
                path="/"
                element={
                  <PageTransition key={location.key}>
                    <MainFeaturePage />
                  </PageTransition>
                }
              />
              <Route
                path="/marketplace"
                element={
                  <PageTransition key={location.key}>
                    <Marketplace />
                  </PageTransition>
                }
              />
              <Route
                path="/results"
                element={
                  <PageTransition key={location.key}>
                    <ResultsPage />
                  </PageTransition>
                }
              />
              <Route
                path="/about"
                element={
                  <PageTransition key={location.key}>
                    <AboutPage />
                  </PageTransition>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <PageTransition key={location.key}>
                      <Profile />
                    </PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/item/:id"
                element={
                  <PageTransition key={location.key}>
                    <ItemDetail />
                  </PageTransition>
                }
              />
              <Route
                path="/listing/:id"
                element={
                  <PageTransition key={location.key}>
                    <ListingDetailPage />
                  </PageTransition>
                }
              />
              <Route
                path="/create-listing"
                element={
                  <ProtectedRoute>
                    <PageTransition key={location.key}>
                      <CreateListing />
                    </PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <PageTransition key={location.key}>
                      <Checkout />
                    </PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <PageTransition key={location.key}>
                      <MessagePage />
                    </PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PageTransition key={location.key}>
                    <LoginPage />
                  </PageTransition>
                }
              />
              <Route
                path="/register"
                element={
                  <PageTransition key={location.key}>
                    <RegisterPage />
                  </PageTransition>
                }
              />
              <Route
                path="/home"
                element={
                  <PageTransition key={location.key}>
                    <Home />
                  </PageTransition>
                }
              />
              <Route
                path="/premium"
                element={
                  <PageTransition key={location.key}>
                    <PremiumPage />
                  </PageTransition>
                }
              />
              <Route
                path="/:feature"
                element={
                  <PageTransition key={location.key}>
                    <MainFeaturePage />
                  </PageTransition>
                }
              />
              <Route
                path="*"
                element={
                  <PageTransition key={location.key}>
                    <NotFoundPage />
                  </PageTransition>
                }
              />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </Layout>
      <ShopDrawers />
      <LoginPopupWrapper />
      {import.meta.env.DEV && <DebugDrawer />}
    </motion.div>
  )
}

export default App
