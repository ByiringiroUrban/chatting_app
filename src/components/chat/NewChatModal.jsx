import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { useContactStore } from '../../stores/contactStore';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';
import { authApi } from '../../services/api';
import { Search, MessageSquare, UserPlus, Users, Sparkles } from 'lucide-react';

export default function NewChatModal({ isOpen, onClose }) {
  const { contacts, fetchContacts } = useContactStore();
  const { startDirectConversation } = useChatStore();
  const { showToast } = useUiStore();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' | 'discover'

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      setQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab !== 'discover' || !query.trim()) {
      setSearchResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const users = await authApi.searchUsers(query.trim());
        setSearchResults(users || []);
      } catch (err) {
        console.error("Failed to search users:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query, activeTab]);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    (c.phone && c.phone.includes(query)) ||
    (c.label && c.label.toLowerCase().includes(query.toLowerCase()))
  );

  const handleStartChatWithContact = async (contact) => {
    onClose();
    await startDirectConversation(contact);
  };

  const handleStartChatWithDiscoveredUser = async (user) => {
    onClose();
    await startDirectConversation({
      id: user.id,
      contactId: user.id,
      name: user.name || user.username || "User",
      avatar: user.avatar,
      status: user.status
    });
    showToast(`Started conversation with ${user.name || user.username}`, "success");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Conversation"
      description="Select a contact or discover users on Muraho to message."
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-3">
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            My Contacts ({contacts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-teal-400" />
            Discover Users
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              activeTab === 'contacts'
                ? "Search contacts by name or phone..."
                : "Search any Muraho user by name, username, or email..."
            }
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-brand-500 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Results Area */}
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 -mx-2 px-2">
          {activeTab === 'contacts' ? (
            filteredContacts.length > 0 ? (
              filteredContacts.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleStartChatWithContact(c)}
                  className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={c.avatar} alt={c.name} size="md" status={c.status} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {c.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {c.phone || c.label || "Contact"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-brand-700 dark:text-teal-400 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                    title="Send message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">
                  {contacts.length === 0 ? "You have no saved contacts yet" : "No contacts matched your search"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Try switching to the <span className="font-bold text-brand-600 dark:text-teal-400">Discover Users</span> tab.
                </p>
              </div>
            )
          ) : (
            // Discover tab
            isSearching ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Searching Muraho users...
              </div>
            ) : query.trim() ? (
              searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleStartChatWithDiscoveredUser(u)}
                    className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={u.avatar} alt={u.name} size="md" status={u.status} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {u.name || u.username}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          @{u.username || "user"} {u.phone ? `• ${u.phone}` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 flex items-center gap-1 shadow-xs"
                    >
                      <MessageSquare className="w-3 h-3" /> Chat
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No user found matching "{query}"</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">
                    This person might not be on Muraho yet or has disabled public discovery.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Join me on Muraho Chat',
                          text: `Hey! Chat with me privately on Muraho Chatting app: ${window.location.origin}`,
                          url: window.location.origin,
                        }).catch(() => {});
                      } else {
                        navigator.clipboard?.writeText(window.location.origin);
                        showToast("Invitation link copied to clipboard!", "success");
                      }
                    }}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Invite to Muraho
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-brand-500" />
                <p className="text-xs font-semibold">Discover registered users</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Type a name, username, or email to find anyone on the platform.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </Modal>
  );
}
