import React, { useState } from 'react';
import { Search, Plus, Filter, MessageSquarePlus, MessageSquare } from 'lucide-react';
import ChatListItem from './ChatListItem';
import NewChatModal from './NewChatModal';
import { useChatStore } from '../../stores/chatStore';
import { useTranslation } from '../../hooks/useTranslation';

export default function ChatList({ onSelectChat }) {
  const { conversations, activeChatId, filter, setFilter, searchQuery, setSearchQuery } = useChatStore();
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const { t } = useTranslation();

  const filterTabs = [
    { id: 'all', label: t('all', 'All') },
    { id: 'unread', label: t('unread', 'Unread') },
    { id: 'groups', label: t('groups', 'Groups') },
    { id: 'favorites', label: t('favorites', 'Favorites') },
  ];

  // Filtering logic
  const filteredConversations = conversations.filter((conv) => {
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = conv.name.toLowerCase().includes(q);
      const matchMsg = conv.lastMessage?.text?.toLowerCase().includes(q);
      if (!matchName && !matchMsg) return false;
    }

    // Filter tabs
    if (filter === 'unread') return (conv.unreadCount || 0) > 0;
    if (filter === 'groups') return conv.type === 'group';
    if (filter === 'favorites') return conv.isPinned;

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 w-full select-none relative">
      {/* Top Header */}
      <div className="p-3.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {t('chats', 'Chats')}
            </h1>
          </div>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-2 rounded-xl text-brand-700 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-950/80 dark:text-teal-400 active:scale-95 transition-all"
            title="Start New Chat"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex items-center mb-2.5">
          <Search className="w-4 h-4 absolute left-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search', 'Search or start new chat')}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                filter === tab.id
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5 pb-20 md:pb-2">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <ChatListItem
              key={conv.id}
              conversation={conv}
              isActive={activeChatId === conv.id}
              onClick={() => onSelectChat(conv.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 my-auto h-full">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-brand-950/40 text-brand-600 dark:text-teal-400 flex items-center justify-center mb-3">
              <MessageSquarePlus className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No conversations yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Start a new private chat with friends or create a community group.
            </p>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Start New Chat
            </button>
          </div>
        )}
      </div>

      {/* WhatsApp Floating Action Button (FAB) on Mobile */}
      <button
        onClick={() => setIsNewChatModalOpen(true)}
        className="md:hidden fixed bottom-20 right-5 w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white shadow-xl flex items-center justify-center z-30 transition-transform"
        title="Start New Chat"
        aria-label="New chat"
      >
        <MessageSquare className="w-6 h-6 stroke-[2.2]" />
      </button>

      {/* New Conversation / Direct Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
      />
    </div>
  );
}
