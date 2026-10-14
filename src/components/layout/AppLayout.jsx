import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MainNavigation from './MainNavigation';
import BottomNavigation from './BottomNavigation';
import ToastContainer from '../common/ToastContainer';
import ActiveCallModal from '../calls/ActiveCallModal';
import { useCallStore } from '../../stores/callStore';

export default function AppLayout() {
  const location = useLocation();
  const { activeCall } = useCallStore();

  // Determine if we should show bottom navigation (don't hide inside general app pages)
  const isBusinessPage = location.pathname.startsWith('/business');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-light dark:bg-bg-dark text-slate-900 dark:text-slate-100">
      {/* Toast notifications */}
      <ToastContainer />

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
