import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ShopDrawers } from '@/context/ShopContext';
import LoginPopupWrapper from '@/components/LoginPopupWrapper';
import PageTransition from '@/components/PageTransition';
import DebugDrawer from '@/components/DebugDrawer';

// Lazy routes
const Home = lazy(() => import('@/pages/Home'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const ResultsPage = lazy(() => import('@/pages/ResultsPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const Profile = lazy(() => import('@/pages/Profile'));
const ItemDetail = lazy(() => import('@/pages/ItemDetail'));
const ListingDetailPage = lazy(() => import('@/pages/ListingDetailPage'));
const CreateListing = lazy(() => import('@/pages/CreateListing'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const MessagePage = lazy(() => import('@/pages/MessagePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const PremiumPage = lazy(() => import('@/pages/PremiumPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function App() {
  const location = useLocation();

  return (
    <Layout>
      <ShopDrawers />
      <LoginPopupWrapper />
      {import.meta.env.DEV && <DebugDrawer />}
      <PageTransition key={location.key}>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/messages" element={<MessagePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/premium" element={<PremiumPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </Layout>
  );
}

export default App;