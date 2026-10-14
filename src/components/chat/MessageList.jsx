import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { Lock } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function MessageList({ messages = [], conversation = null }) {
  const bottomRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by date
  let lastDate = null;

  return (
    <div className="flex-1 overflow-y-auto px-2.5 sm:px-4 py-3 space-y-1.5 chat-pattern-light dark:chat-pattern-dark">
      {/* End to end WhatsApp style encryption disclaimer badge */}
      <div className="flex justify-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8E6] dark:bg-[#182229] border border-[#FFE7A8] dark:border-[#222E35] text-[11px] text-[#54656F] dark:text-[#8696A0] shadow-2xs text-center max-w-sm sm:max-w-md select-none leading-relaxed">
          <Lock className="w-3 h-3 text-[#E5A700] flex-shrink-0" />
          <span>{t('endToEndEncrypted', 'Messages are end-to-end encrypted. No one outside of this chat can read them.')}</span>
        </div>
      </div>

      {messages.map((msg, index) => {
        const showDateSeparator = msg.date && msg.date !== lastDate;
        if (showDateSeparator) {
          lastDate = msg.date;
        }

        return (
          <React.Fragment key={msg.id || index}>
            {showDateSeparator && (
              <div className="flex justify-center my-2.5 select-none">
                <span className="px-2.5 py-0.5 rounded-lg bg-white/90 dark:bg-[#182229]/90 border border-slate-200/60 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
                  {msg.date}
                </span>
              </div>
            )}
            <MessageBubble
              message={msg}
              isGroup={conversation?.type === 'group'}
            />
          </React.Fragment>
        );
      })}

      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
