import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { wsService } from './services/websocket';
import { useChatStore } from './stores/chatStore';
import { useAuthStore } from './stores/authStore';

// Layouts
import AppLayout from './components/layout/AppLayout';
import ToastContainer from './components/common/ToastContainer';

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
  const { user, isAuthenticated } = useAuthStore();
  const { fetchConversations, addInboundMessage, setInboundTyping, setInboundReaction } = useChatStore();

  useEffect(() => {
    // Only connect WebSocket and sync if user is authenticated
    if (!isAuthenticated || !user) {
      wsService.disconnect();
      return;
    }

    // 1. Initial backend sync
    fetchConversations();

    // 2. Real-time WebSocket connection
    const currentUserId = user.id || "user_me";
    wsService.connect(currentUserId);

    // 3. Register real-time event handlers
    const unsubMsg = wsService.on("chat.message", (msg) => {
      addInboundMessage(msg);
    });

    const unsubTyping = wsService.on("chat.typing", (data) => {
      setInboundTyping(data);
    });

    const unsubReaction = wsService.on("chat.reaction", (data) => {
      setInboundReaction(data);
    });

    // 4. Message status updates (sent -> delivered -> read)
    const unsubStatus = wsService.on("chat.message_status", (data) => {
      useChatStore.getState().updateMessageStatus(data);
    });

    // 5. Message edited by other user
    const unsubEdited = wsService.on("chat.message_edited", (data) => {
      useChatStore.getState().handleInboundMessageEdited(data);
    });

    // 6. Message deleted by other user
    const unsubDeleted = wsService.on("chat.message_deleted", (data) => {
      useChatStore.getState().handleInboundMessageDeleted(data);
    });

    // 7. User presence (online/offline/last seen)
    const unsubPresence = wsService.on("user.presence", (data) => {
      useChatStore.getState().updateUserPresence(data);
    });

    // 8. Reconnection recovery — resync missed messages
    const unsubReconnect = wsService.on("status", (data) => {
      if (data.connected) {
        // Re-join active conversation room and resync
        const activeId = useChatStore.getState().activeChatId;
        if (activeId) {
          wsService.joinConversation(activeId);
          wsService.send("chat.read", { conversationId: activeId });
        }
        useChatStore.getState().resyncAfterReconnect();
      }
    });

    return () => {
      unsubMsg();
      unsubTyping();
      unsubReaction();
      unsubStatus();
      unsubEdited();
      unsubDeleted();
      unsubPresence();
      unsubReconnect();
      wsService.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Redirect root based on auth status */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/app/chats" : "/login"} replace />} />

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
