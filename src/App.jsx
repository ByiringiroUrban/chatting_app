import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OtpVerifyPage from './pages/auth/OtpVerifyPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Main App Pages
import ChatsPage from './pages/app/ChatsPage';
import GroupsPage from './pages/app/GroupsPage';
import StatusPage from './pages/app/StatusPage';
import ChannelsPage from './pages/app/ChannelsPage';
import CallsPage from './pages/app/CallsPage';
import ContactsPage from './pages/app/ContactsPage';
import ProfilePage from './pages/app/ProfilePage';
import SettingsPage from './pages/app/SettingsPage';

// Business Suite Pages
import BusinessDashboardPage from './pages/business/BusinessDashboardPage';
import BusinessInboxPage from './pages/business/BusinessInboxPage';
import BusinessCatalogPage from './pages/business/BusinessCatalogPage';
import BusinessAiPage from './pages/business/BusinessAiPage';
import BusinessAnalyticsPage from './pages/business/BusinessAnalyticsPage';
import BusinessAdsPage from './pages/business/BusinessAdsPage';
import BusinessSettingsPage from './pages/business/BusinessSettingsPage';

// Monetization Pages
import PricingPage from './pages/monetization/PricingPage';
import BillingPage from './pages/monetization/BillingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to /app/chats */}
        <Route path="/" element={<Navigate to="/app/chats" replace />} />

        {/* Public Authentication routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<OtpVerifyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Pricing & Billing (accessible publicly or within app layout) */}
        <Route path="/pricing" element={<AppLayout />}>
          <Route index element={<PricingPage />} />
        </Route>
        <Route path="/billing" element={<AppLayout />}>
          <Route index element={<BillingPage />} />
        </Route>

        {/* Main Application Routes inside AppLayout */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/chats" replace />} />
          <Route path="chats" element={<ChatsPage />} />
          <Route path="chats/:chatId" element={<ChatsPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="status" element={<StatusPage />} />
          <Route path="channels" element={<ChannelsPage />} />
          <Route path="calls" element={<CallsPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Business Suite Routes inside AppLayout */}
        <Route path="/business" element={<AppLayout />}>
          <Route index element={<Navigate to="/business/dashboard" replace />} />
          <Route path="dashboard" element={<BusinessDashboardPage />} />
          <Route path="inbox" element={<BusinessInboxPage />} />
          <Route path="catalog" element={<BusinessCatalogPage />} />
          <Route path="ai-assistant" element={<BusinessAiPage />} />
          <Route path="analytics" element={<BusinessAnalyticsPage />} />
          <Route path="advertising" element={<BusinessAdsPage />} />
          <Route path="settings" element={<BusinessSettingsPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/app/chats" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
