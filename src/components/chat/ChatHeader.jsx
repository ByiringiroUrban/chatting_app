import React from 'react';
import Avatar from '../common/Avatar';
import { 
  Phone, 
  Video, 
  Search, 
  MoreVertical, 
  Pin, 
  BellOff, 
  Bell, 
  ArrowLeft,
  Users
} from 'lucide-react';
import Dropdown from '../common/Dropdown';
import { useChatStore } from '../../stores/chatStore';
import { useCallStore } from '../../stores/callStore';
import { useGroupStore } from '../../stores/groupStore';
import { useTranslation } from '../../hooks/useTranslation';

export default function ChatHeader({ conversation, onBack }) {
  const { togglePinConversation, toggleMuteConversation, toggleSearchingChat, toggleContactInfo } = useChatStore();
  const { startCall } = useCallStore();
  const { setMemberDrawerOpen, setActiveGroupId } = useGroupStore();
  const { t } = useTranslation();

  if (!conversation) return null;

  const handleVoiceCall = () => {
    startCall({
      id: conversation.participantId || conversation.id,
      name: conversation.name,
      avatar: conversation.avatar,
    }, 'voice');
  };

  const handleVideoCall = () => {
    startCall({
      id: conversation.participantId || conversation.id,
      name: conversation.name,
      avatar: conversation.avatar,
    }, 'video');
  };

  const handleOpenGroupDetails = () => {
    if (conversation.type === 'group') {
      setActiveGroupId(conversation.groupId);
      setMemberDrawerOpen(true);
    } else {
      toggleContactInfo();
    }
  };

  return (
    <header className="h-15 sm:h-16 px-2.5 sm:px-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md flex items-center justify-between z-20 flex-shrink-0 select-none shadow-2xs">
      {/* Contact Profile info with prominent mobile back arrow */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full active:scale-90 transition-all flex items-center justify-center"
            title="Back to conversations"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        <div 
          onClick={handleOpenGroupDetails} 
          className="cursor-pointer flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 py-1 hover:opacity-90 transition-opacity"
        >
          <Avatar
            src={conversation.avatar}
            alt={conversation.name}
            size="md"
            status={conversation.type === 'direct' ? conversation.status : null}
            className="flex-shrink-0"
          />
          <div className="min-w-0 flex-1 text-left">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1">
              <span className="truncate">{conversation.name}</span>
              {conversation.isPinned && <Pin className="w-3 h-3 text-brand-600 rotate-45 flex-shrink-0" />}
              {conversation.isMuted && <BellOff className="w-3 h-3 text-slate-400 flex-shrink-0" />}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {conversation.type === 'group' 
                ? `${conversation.memberCount || 'Community'} members` 
                : conversation.isTyping 
                  ? <span className="text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">typing...</span> 
                  : conversation.status === 'online' ? <span className="text-emerald-600 dark:text-emerald-400 font-medium">online</span> : conversation.lastSeen || 'Active recently'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons (voice call, video call, search in chat, more dropdown) */}
      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        <button
          onClick={handleVideoCall}
          className="p-2 text-slate-600 hover:text-brand-700 dark:text-slate-300 dark:hover:text-teal-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          title={t('startVideoCall', 'Video Call')}
        >
          <Video className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        <button
          onClick={handleVoiceCall}
          className="p-2 text-slate-600 hover:text-brand-700 dark:text-slate-300 dark:hover:text-teal-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          title={t('startVoiceCall', 'Voice Call')}
        >
          <Phone className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        <button
          onClick={toggleSearchingChat}
          className="hidden sm:flex p-2 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={t('searchInChat', 'Search in Chat')}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* More Menu Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button className="p-2 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all">
              <MoreVertical className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          }
        >
          <div className="py-1 text-xs text-slate-700 dark:text-slate-200">
            <button
              onClick={handleOpenGroupDetails}
              className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-slate-400" />
              {conversation.type === 'group' ? 'Group Details' : 'Contact Profile'}
            </button>
            <button
              onClick={() => togglePinConversation(conversation.id)}
              className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
            >
              <Pin className="w-4 h-4 text-slate-400" />
              {conversation.isPinned ? t('unpin', 'Unpin Chat') : t('pin', 'Pin Chat')}
            </button>
            <button
              onClick={() => toggleMuteConversation(conversation.id)}
              className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
            >
              {conversation.isMuted ? (
                <>
                  <Bell className="w-4 h-4 text-slate-400" />
                  {t('unmute', 'Unmute Notifications')}
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 text-slate-400" />
                  {t('mute', 'Mute Notifications')}
                </>
              )}
            </button>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}
