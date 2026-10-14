import React, { useState } from 'react';
import { 
  Check, 
  CheckCheck, 
  Smile, 
  Reply, 
  Trash2, 
  Copy, 
  Forward, 
  Pin, 
  FileText, 
  Play, 
  Pause,
  Download
} from 'lucide-react';
import Dropdown from '../common/Dropdown';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';

export default function MessageBubble({ message, isGroup = false }) {
  const { 
    id, 
    senderId, 
    senderName, 
    text, 
    timestamp, 
    status, 
    type, 
    mediaUrl, 
    fileName, 
    fileSize, 
    duration, 
    caption, 
    reactions, 
    replyTo, 
    isPinned, 
    isEdited 
  } = message;

  const isMe = senderId === 'user_me';
  const { addReaction, deleteMessage, setReplyingTo, togglePinMessage } = useChatStore();
  const { showToast } = useUiStore();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);

  const emojiChoices = ["❤️", "👍", "😂", "🔥", "🎉", "👏", "🙏", "😍"];

  const handleCopyText = () => {
    navigator.clipboard.writeText(text || caption || '');
    showToast("Copied to clipboard!", "info");
    setShowMobileToolbar(false);
  };

  const toggleAudioPlay = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      setTimeout(() => setIsPlayingAudio(false), 4000);
    }
  };

  return (
    <div 
      className={`group relative flex flex-col my-1 select-none ${isMe ? 'items-end' : 'items-start'} w-full`}
      onClick={() => setShowMobileToolbar(!showMobileToolbar)}
    >
      
      {/* Sender name for group chats if not me */}
      {!isMe && isGroup && senderName && (
        <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 mb-0.5 ml-2.5">
          {senderName}
        </span>
      )}

      {/* Main message bubble with WhatsApp/Telegram tailored corners & elevation */}
      <div 
        className={`relative px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl shadow-xs transition-all max-w-[88%] sm:max-w-[75%] ${
          isMe 
            ? 'bg-[#E7F8F4] dark:bg-[#005C4B] text-slate-900 dark:text-white rounded-tr-xs border border-teal-100/60 dark:border-teal-900/30' 
            : 'bg-white dark:bg-[#202C33] text-slate-900 dark:text-[#E9EDEF] rounded-tl-xs border border-slate-200/50 dark:border-slate-800'
        }`}
      >

        {/* Replying-to Preview box */}
        {replyTo && (
          <div className={`mb-1 p-2 rounded-xl text-xs border-l-4 ${
            isMe 
              ? 'bg-teal-100/60 dark:bg-[#025144] border-teal-600 dark:border-teal-400 text-teal-900 dark:text-teal-100' 
              : 'bg-slate-100 dark:bg-[#111B21] border-brand-600 text-slate-700 dark:text-slate-300'
          }`}>
            <span className="font-bold block text-[11px]">{replyTo.senderName}</span>
            <span className="line-clamp-1 text-[11px] opacity-90">{replyTo.text}</span>
          </div>
        )}

        {/* Pinned indicator banner */}
        {isPinned && (
          <div className="flex items-center gap-1 text-[10px] font-medium opacity-80 mb-1 border-b border-black/10 dark:border-white/10 pb-0.5">
            <Pin className="w-2.5 h-2.5" /> Pinned message
          </div>
        )}

        {/* Render by type: Image */}
        {type === 'image' && mediaUrl && (
          <div className="rounded-xl overflow-hidden mb-1 max-w-sm">
            <img 
              src={mediaUrl} 
              alt="attachment" 
              className="w-full max-h-72 object-cover rounded-xl" 
            />
          </div>
        )}

        {/* Render by type: Document */}
        {type === 'document' && (
          <div className={`flex items-center gap-3 p-2 rounded-xl mb-1 ${
            isMe ? 'bg-teal-100/40 dark:bg-black/20' : 'bg-slate-100 dark:bg-black/20'
          }`}>
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-300">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold truncate">{fileName || text || "Document.pdf"}</p>
              <p className="text-[10px] opacity-75">{fileSize || "1.8 MB"}</p>
            </div>
            <button className="p-1.5 hover:opacity-80 transition-opacity">
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Render by type: Audio Voice Note */}
        {type === 'audio' && (
          <div className="flex items-center gap-2 sm:gap-3 py-1 min-w-[190px] sm:min-w-[240px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleAudioPlay();
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 flex-shrink-0 ${
                isMe ? 'bg-teal-700 text-white dark:bg-teal-400 dark:text-slate-900' : 'bg-brand-700 text-white'
              }`}
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Simulated Audio Waveform */}
            <div className="flex-1 flex items-center gap-0.5 sm:gap-1 h-6">
              {[40, 70, 30, 90, 60, 80, 50, 95, 30, 75, 45, 85, 60, 40, 90, 70, 50, 80].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`w-0.5 sm:w-1 rounded-full transition-all duration-200 ${
                    isPlayingAudio && i % 3 === 0 
                      ? 'bg-amber-400 animate-pulse' 
                      : isMe ? 'bg-teal-700 dark:bg-teal-300' : 'bg-slate-400 dark:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <span className="text-[10px] sm:text-[11px] font-mono opacity-80 flex-shrink-0">
              {duration || "0:24"}
            </span>
          </div>
        )}

        {/* Text message content with WhatsApp inline timestamp layout */}
        {(type === 'text' || caption) && (
          <div className="relative leading-relaxed">
            <span className="text-sm whitespace-pre-wrap break-words pr-14 block">
              {text || caption}
            </span>
            
            {/* Inline WhatsApp-style Bottom Right Timestamp */}
            <span className={`absolute bottom-0 right-0 inline-flex items-center gap-1 text-[10px] ${
              isMe ? 'text-teal-800/80 dark:text-teal-200/80' : 'text-slate-400 dark:text-slate-400'
            }`}>
              {isEdited && <span className="text-[9px]">(edited)</span>}
              <span>{timestamp}</span>
              {isMe && (
                <span className="inline-flex items-center">
                  {status === 'read' ? (
                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                  ) : status === 'delivered' ? (
                    <CheckCheck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300" />
                  )}
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Floating Action Menu (Supports both Desktop hover and Mobile tap) */}
      <div className={`
        ${showMobileToolbar ? 'flex' : 'hidden group-hover:flex'} 
        items-center gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full px-2 py-1 shadow-lg z-20 transition-all mt-1 animate-slide-up
        ${isMe ? 'self-end mr-1' : 'self-start ml-1'}
      `}>
        {/* Quick Reactions */}
        <Dropdown
          align={isMe ? "right" : "left"}
          trigger={
            <button className="p-1 text-slate-500 hover:text-amber-500 transition-colors" title="React">
              <Smile className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="flex items-center gap-1.5 p-1.5">
            {emojiChoices.map((emoji) => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  addReaction(id, emoji);
                  setShowMobileToolbar(false);
                }}
                className="hover:scale-130 transition-transform p-1 text-base active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </Dropdown>

        {/* Reply */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setReplyingTo(message);
            setShowMobileToolbar(false);
          }}
          className="p-1 text-slate-500 hover:text-brand-600 transition-colors"
          title="Reply"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>

        {/* Copy */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopyText();
          }}
          className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          title="Copy"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteMessage(id);
            setShowMobileToolbar(false);
          }}
          className="p-1 text-slate-500 hover:text-rose-600 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Render reactions pill badges */}
      {reactions && reactions.length > 0 && (
        <div className={`flex flex-wrap gap-1 mt-0.5 ${isMe ? 'justify-end mr-1' : 'justify-start ml-1'}`}>
          {reactions.map((r, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                addReaction(id, r.emoji);
              }}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-xs active:scale-90 transition-transform"
            >
              <span>{r.emoji}</span>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{r.count}</span>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
