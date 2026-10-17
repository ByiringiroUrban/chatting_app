import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import MainNavigation from './MainNavigation';
import BottomNavigation from './BottomNavigation';
import ActiveCallModal from '../calls/ActiveCallModal';
import LogoutModal from '../common/LogoutModal';
import { useCallStore } from '../../stores/callStore';
import { useAuthStore } from '../../stores/authStore';

export default function AppLayout() {
  const location = useLocation();
  const { activeCall } = useCallStore();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-light dark:bg-bg-dark text-slate-900 dark:text-slate-100">
      {/* Logout Confirmation Modal */}
      <LogoutModal />

      {/* Active Call UI (modal overlay when voice/video call is ongoing) */}
      {activeCall && <ActiveCallModal />}

      {/* Desktop Left Nav Sidebar */}
      <div className="hidden md:flex h-full flex-shrink-0">
        <MainNavigation />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
