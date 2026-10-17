import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  CircleDot, 
  Radio, 
  Phone, 
  Contact2, 
  Building2, 
  CreditCard, 
  Settings, 
  UserCircle,
  LogOut 
} from 'lucide-react';
import Avatar from '../common/Avatar';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSelector from '../common/LanguageSelector';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';

export default function MainNavigation() {
  const { user, openLogoutModal } = useAuthStore();
  const { conversations } = useChatStore();

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const mainNavItems = [
    { to: "/app/chats", icon: MessageSquare, label: "Chats", badge: totalUnread > 0 ? totalUnread : null },
    { to: "/app/groups", icon: Users, label: "Groups" },
    { to: "/app/status", icon: CircleDot, label: "Status" },
    { to: "/app/channels", icon: Radio, label: "Channels" },
    { to: "/app/calls", icon: Phone, label: "Calls" },
    { to: "/app/contacts", icon: Contact2, label: "Contacts" },
  ];

  const bottomNavItems = [
    { to: "/business/dashboard", icon: Building2, label: "Business Suite", highlight: true },
    { to: "/pricing", icon: CreditCard, label: "Pricing & Plans" },
    { to: "/app/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="w-16 md:w-20 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 justify-between z-30 select-none flex-shrink-0">
      {/* Top Branding & Main Tabs */}
      <div className="flex flex-col items-center gap-5 w-full">
        {/* Brand Logo */}
        <NavLink to="/app/chats" className="group p-2 transition-transform hover:scale-105 active:scale-95" title="Muraho Home">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center shadow-md shadow-brand-700/20 text-white font-black text-xl tracking-tight">
            M
          </div>
        </NavLink>

        {/* Primary Navigation Links */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  relative group flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-150
                  ${isActive 
                    ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 font-semibold shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }
                `}
                title={item.label}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                {item.badge && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-brand-600 text-white text-[10px] font-bold rounded-full min-w-4 text-center ring-2 ring-white dark:ring-surface-dark">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions (Business, Pricing, Settings, Profile, Theme) */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        <nav className="flex flex-col items-center gap-1 w-full">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  relative group flex items-center justify-center w-12 h-12 rounded-2xl transition-all
                  ${item.highlight ? 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40' : ''}
                  ${isActive 
                    ? 'bg-slate-100 dark:bg-slate-800 text-brand-700 dark:text-brand-400' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }
                `}
                title={item.label}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              </NavLink>
            );
          })}
        </nav>

        <div className="w-8 h-px bg-slate-200 dark:bg-slate-800 my-1" />

        <ThemeToggle />

        {/* Current User Profile Avatar */}
        <NavLink to="/app/profile" className="p-1 hover:scale-105 active:scale-95 transition-transform" title={`${user?.name} (Profile)`}>
          <Avatar 
            src={user?.avatar} 
            alt={user?.name || "User"} 
            size="sm" 
            status="online"
            className="ring-2 ring-brand-500/40"
          />
        </NavLink>

        {/* Dedicated Logout Action Button */}
        <button
          type="button"
          onClick={openLogoutModal}
          className="group flex items-center justify-center w-11 h-11 rounded-2xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all active:scale-90"
          title="Log Out of Muraho"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>
      </div>
    </aside>
  );
}
