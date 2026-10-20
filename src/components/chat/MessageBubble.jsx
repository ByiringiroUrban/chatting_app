import React, { useState, useRef, useEffect } from 'react';
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
  Download,
  Pencil,
  RotateCcw,
  AlertCircle,
  X,
  Maximize2,
  Loader2
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
    isEdited,
    isForwarded
  } = message;

  let isMe = senderId === 'user_me';
  // Also check against actual auth user id
  try {
    const authUser = JSON.parse(localStorage.getItem('muraho_auth_user'));
    if (authUser?.id && authUser.id === senderId) isMe = true;
  } catch(e) {}

  const { addReaction, deleteMessage, editMessage, setReplyingTo, togglePinMessage, setForwardingMessage, retryMessage } = useChatStore();
  const { showToast } = useUiStore();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || "0:00");
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text || '');
  const audioRef = useRef(null);

  const emojiChoices = ["❤️", "👍", "😂", "🔥", "🎉", "👏", "🙏", "😍"];

  const handleCopyText = () => {
    navigator.clipboard.writeText(text || caption || '');
    showToast("Copied to clipboard!", "info");
    setShowMobileToolbar(false);
  };

  // Real audio playback
  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().catch(() => {
        showToast("Unable to play audio", "error");
      });
      setIsPlayingAudio(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      const cur = audioRef.current.currentTime;
      const mins = Math.floor(cur / 60);
      const secs = Math.floor(cur % 60);
      setAudioDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setAudioDuration(duration || "0:00");
  };

  const handleAudioSeek = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  const handleEditSubmit = () => {
    if (editText.trim() && editText.trim() !== text) {
      editMessage(id, editText.trim());
    }
    setIsEditing(false);
    setShowMobileToolbar(false);
  };

  const handleForward = () => {
    setForwardingMessage(message);
    setShowMobileToolbar(false);
    showToast("Select a chat to forward this message", "info");
  };

  const handleRetry = () => {
    retryMessage(id);
  };

  // Resolve media URL for backend-hosted files
  const resolveUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    return `http://localhost:8000${url}`;
  };

  return (
    <>
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

        {/* Forwarded label */}
        {isForwarded && (
          <span className={`text-[10px] text-slate-400 italic mb-0.5 ${isMe ? 'mr-2.5' : 'ml-2.5'} flex items-center gap-1`}>
            <Forward className="w-3 h-3" /> Forwarded
          </span>
        )}

        {/* Main message bubble with WhatsApp/Telegram tailored corners & elevation */}
        <div 
          className={`relative px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl shadow-xs transition-all max-w-[88%] sm:max-w-[75%] ${
            status === 'failed'
              ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800'
              : isMe 
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
            <div 
              className="rounded-xl overflow-hidden mb-1 max-w-sm cursor-pointer group/img"
              onClick={(e) => { e.stopPropagation(); setShowLightbox(true); }}
            >
              <div className="relative">
                <img 
                  src={resolveUrl(mediaUrl)} 
                  alt="attachment" 
                  className="w-full max-h-72 object-cover rounded-xl transition-transform hover:scale-[1.01]" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors rounded-xl flex items-center justify-center">
                  <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-80 transition-opacity drop-shadow-lg" />
                </div>
              </div>
            </div>
          )}

          {/* Render by type: Video */}
          {type === 'video' && mediaUrl && (
            <div className="rounded-xl overflow-hidden mb-1 max-w-sm">
              <video 
                src={resolveUrl(mediaUrl)} 
                controls 
                className="w-full max-h-72 rounded-xl"
                preload="metadata"
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
                <p className="text-[10px] opacity-75">{fileSize || ""}</p>
              </div>
              <a 
                href={resolveUrl(mediaUrl) || '#'}
                download={fileName || 'document'}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 hover:opacity-80 transition-opacity text-teal-600 dark:text-teal-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-4 h-4" />
              </a>
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

              {/* Audio waveform / progress bar */}
              <div 
                className="flex-1 cursor-pointer relative h-8 flex items-center"
                onClick={(e) => { e.stopPropagation(); handleAudioSeek(e); }}
              >
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-100 ${
                      isMe ? 'bg-teal-700 dark:bg-teal-300' : 'bg-brand-700 dark:bg-brand-400'
                    }`}
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                {/* Waveform visualization overlay */}
                <div className="absolute inset-0 flex items-center gap-0.5 sm:gap-1 px-0.5 opacity-30 pointer-events-none">
                  {[40, 70, 30, 90, 60, 80, 50, 95, 30, 75, 45, 85, 60, 40, 90, 70, 50, 80].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-0.5 sm:w-1 rounded-full ${
                        isMe ? 'bg-teal-700 dark:bg-teal-300' : 'bg-slate-400 dark:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <span className="text-[10px] sm:text-[11px] font-mono opacity-80 flex-shrink-0">
                {audioDuration}
              </span>

              {/* Hidden audio element for real playback */}
              {mediaUrl && (
                <audio
                  ref={audioRef}
                  src={resolveUrl(mediaUrl)}
                  onTimeUpdate={handleAudioTimeUpdate}
                  onEnded={handleAudioEnded}
                  preload="metadata"
                  className="hidden"
                />
              )}
            </div>
          )}

          {/* Text message content with WhatsApp inline timestamp layout */}
          {isEditing ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEditSubmit(); if (e.key === 'Escape') setIsEditing(false); }}
                className="flex-1 bg-white/50 dark:bg-black/20 border border-teal-300 dark:border-teal-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                autoFocus
              />
              <button onClick={handleEditSubmit} className="text-teal-600 hover:text-teal-700 text-xs font-bold">Save</button>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 text-xs">Cancel</button>
            </div>
          ) : (type === 'text' || caption) && (
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
                    {status === 'sending' ? (
                      <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                    ) : status === 'failed' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    ) : status === 'read' ? (
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

          {/* Failed message retry */}
          {status === 'failed' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleRetry(); }}
              className="flex items-center gap-1.5 mt-1.5 text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Tap to retry
            </button>
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

          {/* Forward */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleForward();
            }}
            className="p-1 text-slate-500 hover:text-brand-600 transition-colors"
            title="Forward"
          >
            <Forward className="w-3.5 h-3.5" />
          </button>

          {/* Edit (only own text messages) */}
          {isMe && type === 'text' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditText(text || '');
                setIsEditing(true);
                setShowMobileToolbar(false);
              }}
              className="p-1 text-slate-500 hover:text-amber-600 transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

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

          {/* Pin */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePinMessage(id);
              setShowMobileToolbar(false);
            }}
            className={`p-1 transition-colors ${isPinned ? 'text-amber-500' : 'text-slate-500 hover:text-amber-500'}`}
            title={isPinned ? "Unpin" : "Pin"}
          >
            <Pin className="w-3.5 h-3.5" />
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

      {/* Image Lightbox Modal */}
      {showLightbox && type === 'image' && mediaUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button 
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full backdrop-blur-sm z-10"
            onClick={() => setShowLightbox(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={resolveUrl(mediaUrl)} 
            alt="Full size" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {caption && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-xl max-w-md text-center">
              {caption}
            </div>
          )}
        </div>
      )}
    </>
  );
}
