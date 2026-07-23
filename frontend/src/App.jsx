import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SplitLogin from './pages/SplitLogin';
import SplitRegister from './pages/SplitRegister';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

// Platform Pages
import LiveStreamingPage from './pages/platform/LiveStreamingPage';
import AnalyticsPage from './pages/platform/AnalyticsPage';
import BrandMarketplacePage from './pages/platform/BrandMarketplacePage';
import MobileAppPage from './pages/platform/MobileAppPage';

// Services Pages
import CreatorManagementPage from './pages/services/CreatorManagementPage';
import BrandPartnershipsPage from './pages/services/BrandPartnershipsPage';
import GrowthStrategyPage from './pages/services/GrowthStrategyPage';
import TrainingMentorshipPage from './pages/services/TrainingMentorshipPage';
import TechnicalSupportPage from './pages/services/TechnicalSupportPage';

// Company Pages
import AboutUsPage from './pages/company/AboutUsPage';
import CareersPage from './pages/company/CareersPage';
import PressKitPage from './pages/company/PressKitPage';
import CreatorStoriesPage from './pages/company/CreatorStoriesPage';
import BlogPage from './pages/company/BlogPage';
import ContactPage from './pages/company/ContactPage';

// Legal Pages
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsOfServicePage from './pages/legal/TermsOfServicePage';

import './App.css';

const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('elvooriq_admin_auth') === 'true';
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<SplitLogin />} />
          <Route path="/register" element={<SplitRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Platform Routes */}
          <Route path="/platform/live-streaming" element={<LiveStreamingPage />} />
          <Route path="/platform/analytics" element={<AnalyticsPage />} />
          <Route path="/platform/brand-marketplace" element={<BrandMarketplacePage />} />
          <Route path="/platform/mobile-app" element={<MobileAppPage />} />

          {/* Services Routes */}
          <Route path="/services/creator-management" element={<CreatorManagementPage />} />
          <Route path="/services/brand-partnerships" element={<BrandPartnershipsPage />} />
          <Route path="/services/growth-strategy" element={<GrowthStrategyPage />} />
          <Route path="/services/training-mentorship" element={<TrainingMentorshipPage />} />
          <Route path="/services/technical-support" element={<TechnicalSupportPage />} />

          {/* Company Routes */}
          <Route path="/company/about" element={<AboutUsPage />} />
          <Route path="/company/careers" element={<CareersPage />} />
          <Route path="/company/press-kit" element={<PressKitPage />} />
          <Route path="/company/creator-stories" element={<CreatorStoriesPage />} />
          <Route path="/company/blog" element={<BlogPage />} />
          <Route path="/company/contact" element={<ContactPage />} />

          {/* Legal Routes */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
