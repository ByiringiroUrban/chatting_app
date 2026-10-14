import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, Users, CircleDot, Radio, Phone, Building2 } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useMobileNavStore } from '../../stores/mobileNavStore';

export default function BottomNavigation() {
  const { conversations } = useChatStore();
  const { isChatOpenOnMobile } = useMobileNavStore();
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // If mobile user has an active chat open, hide the bottom bar so keyboard and input area have 100% space!
  if (isChatOpenOnMobile) {
    return null;
  }

  const mobileNavItems = [
    { to: "/app/chats", icon: MessageSquare, label: "Chats", badge: totalUnread > 0 ? totalUnread : null },
    { to: "/app/groups", icon: Users, label: "Groups" },
    { to: "/app/status", icon: CircleDot, label: "Status" },
    { to: "/app/channels", icon: Radio, label: "Channels" },
    { to: "/app/calls", icon: Phone, label: "Calls" },
    { to: "/business/dashboard", icon: Building2, label: "Business" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-40 shadow-lg select-none pb-safe">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-90
              ${isActive 
                ? 'text-brand-700 dark:text-brand-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }
            `}
          >
            <div className="relative">
              <Icon className="w-5 h-5 stroke-[2.2]" />
              {item.badge && (
                <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-emerald-600 text-white text-[9px] font-black rounded-full min-w-4 text-center ring-2 ring-white dark:ring-surface-dark">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
