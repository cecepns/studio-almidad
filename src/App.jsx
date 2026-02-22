import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect } from 'react';
import AOS from 'aos';

// Layouts
import Layout from './components/Layout/Layout';
import ScrollToTop from './components/Common/ScrollToTop';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Contact from './pages/Contact';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminBanners from './pages/admin/Banners';
import AdminCategories from './pages/admin/Categories';
import AdminSettings from './pages/admin/Settings';

// Admin Layout
import AdminLayout from './components/Admin/AdminLayout';
import ProtectedRoute from './components/Admin/ProtectedRoute';
import { settingsAPI } from './utils/api';
import { initFacebookPixel } from './utils/facebookPixel';
import ProductDetail from './pages/ProductDetail';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }, []);

  useEffect(() => {
    const initializePixel = async () => {
      try {
        const response = await settingsAPI.get();
        const data = response.data?.data || {};
        const pixelId = data.facebook_pixel_id;

        if (pixelId) {
          initFacebookPixel(pixelId);
        }
      } catch (error) {
        console.error('Error initializing Facebook Pixel:', error);
      }
    };

    initializePixel();
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/about"
            element={
              <Layout>
                <About />
              </Layout>
            }
          />
          <Route
            path="/services"
            element={
              <Layout>
                <Services />
              </Layout>
            }
          />
          <Route
            path="/services/:slug"
            element={
              <Layout>
                <ProductDetail />
              </Layout>
            }
          />
          <Route
            path="/contact"
            element={
              <Layout>
                <Contact />
              </Layout>
            }
          />

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;