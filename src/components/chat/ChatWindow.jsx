import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MediaAttachmentsModal from './MediaAttachmentsModal';
import { useChatStore } from '../../stores/chatStore';
import { MessageSquareDashed } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function ChatWindow({ onBack }) {
  const { activeChatId, conversations, messages } = useChatStore();
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const { t } = useTranslation();

  const activeConversation = conversations.find(c => c.id === activeChatId);
  const currentMessages = messages[activeChatId] || [];

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-slate-50 dark:bg-bg-dark h-full">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-teal-400 flex items-center justify-center mb-4 shadow-sm">
          <MessageSquareDashed className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
          {t('selectChatToStart', 'Select a conversation to start messaging')}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Stay connected with friends, colleagues, developer groups, and local businesses in Rwanda.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-white dark:bg-surface-dark overflow-hidden relative">
      {/* WhatsApp/Telegram style Conversation Header */}
      <ChatHeader
        conversation={activeConversation}
        onBack={onBack}
      />

      {/* Messages Scroll Area with authentic WhatsApp wallpaper & bubbles */}
      <MessageList
        messages={currentMessages}
        conversation={activeConversation}
      />

      {/* Message Composer with floating voice button and mobile-optimized touch padding */}
      <MessageInput
        onOpenMediaModal={() => setIsMediaModalOpen(true)}
      />

      {/* Attachment Upload / Selection Modal */}
      <MediaAttachmentsModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
      />
    </div>
  );
}
