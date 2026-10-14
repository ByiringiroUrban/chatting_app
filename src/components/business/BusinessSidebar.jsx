import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Inbox, 
  ShoppingBag, 
  Bot, 
  BarChart3, 
  Megaphone, 
  Settings,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import Avatar from '../common/Avatar';
import { useBusinessStore } from '../../stores/businessStore';

export default function BusinessSidebar() {
  const { profile, customerInbox } = useBusinessStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const openTickets = customerInbox.filter(c => c.status === 'Open').length;

  const links = [
    { to: "/business/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/business/inbox", icon: Inbox, label: "Customer Inbox", badge: openTickets > 0 ? openTickets : null },
    { to: "/business/catalog", icon: ShoppingBag, label: "Product Catalog" },
    { to: "/business/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/business/ai-assistant", icon: Bot, label: "AI Customer Support" },
    { to: "/business/advertising", icon: Megaphone, label: "Advertising" },
    { to: "/business/settings", icon: Settings, label: "Business Profile" },
  ];

  return (
    <>
      {/* Mobile Top App Bar for Business Suite */}
      <div className="md:hidden flex items-center justify-between px-3 py-2.5 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 w-full flex-shrink-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
            aria-label="Open Business Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <Avatar src={profile.logo} alt={profile.name} size="xs" />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[170px]">
              {profile.name}
            </span>
          </div>
        </div>

        <NavLink to="/app/chats" className="text-xs font-semibold text-teal-600 dark:text-teal-400 p-1">
          Chats →
        </NavLink>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar: Desktop fixed width & Mobile slide-over drawer */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 md:z-auto
        w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 
        flex flex-col h-full flex-shrink-0 select-none transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="min-w-0">
            <NavLink 
              to="/app/chats" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-700 dark:hover:text-teal-400 mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Chats
            </NavLink>

            <div className="flex items-center gap-3">
              <Avatar src={profile.logo} alt={profile.name} size="md" />
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{profile.name}</h3>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wider">
                  Verified Business
                </span>
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg -mt-8"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                  ${isActive
                    ? 'bg-teal-50 dark:bg-brand-950/50 text-brand-700 dark:text-teal-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-1.5 py-0.2 bg-brand-600 text-white text-[10px] font-bold rounded-full min-w-4 text-center">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
          Muraho Business Suite • Kigali, Rwanda
        </div>
      </aside>
    </>
  );
}
