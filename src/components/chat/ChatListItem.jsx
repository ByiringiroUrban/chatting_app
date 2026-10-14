import React from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { Pin, BellOff, Check, CheckCheck } from 'lucide-react';

export default function ChatListItem({ conversation, isActive, onClick }) {
  const {
    id,
    name,
    avatar,
    lastMessage,
    unreadCount,
    status,
    isPinned,
    isMuted,
    isTyping,
    typingUser,
    type,
    memberCount
  } = conversation;

  // Determine tick status for message sent by user_me
  const isMine = lastMessage?.senderId === 'user_me';
  const renderStatusTicks = () => {
    if (!isMine) return null;
    if (lastMessage?.status === 'read') {
      return <CheckCheck className="w-3.5 h-3.5 text-teal-500 inline mr-1 flex-shrink-0" />;
    }
    if (lastMessage?.status === 'delivered') {
      return <CheckCheck className="w-3.5 h-3.5 text-slate-400 inline mr-1 flex-shrink-0" />;
    }
    return <Check className="w-3.5 h-3.5 text-slate-400 inline mr-1 flex-shrink-0" />;
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-3.5 py-3 cursor-pointer select-none rounded-xl transition-all duration-150 mx-2
        ${isActive 
          ? 'bg-teal-50/80 dark:bg-brand-950/40 text-slate-900 dark:text-slate-100 shadow-xs' 
          : 'hover:bg-slate-100/80 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200'
        }
      `}
    >
      {/* Avatar with status indicator */}
      <Avatar
        src={avatar}
        alt={name}
        size="md"
        status={type === 'direct' ? status : null}
      />

      {/* Main Conversation Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">
            {name}
          </h4>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex-shrink-0 ml-2">
            {lastMessage?.timestamp || ""}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1 text-xs">
          {/* Last message text or typing indicator */}
          <div className="flex items-center truncate text-slate-500 dark:text-slate-400">
            {isTyping ? (
              <span className="text-teal-600 dark:text-teal-400 font-medium animate-pulse">
                {typingUser ? `${typingUser} is typing...` : 'typing...'}
              </span>
            ) : (
              <>
                {renderStatusTicks()}
                <span className="truncate">
                  {lastMessage?.text || "Started a conversation"}
                </span>
              </>
            )}
          </div>

          {/* Badges / indicators (unread count, pin, mute) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isMuted && <BellOff className="w-3.5 h-3.5 text-slate-400" />}
            {isPinned && <Pin className="w-3.5 h-3.5 text-brand-600 rotate-45" />}
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 min-w-4 text-center rounded-full bg-brand-600 text-white font-bold text-[10px] leading-tight shadow-sm">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
