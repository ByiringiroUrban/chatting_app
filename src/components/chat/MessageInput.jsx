import React, { useState, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  X, 
  Sparkles,
  Bot
} from 'lucide-react';
import Dropdown from '../common/Dropdown';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';
import { useTranslation } from '../../hooks/useTranslation';

export default function MessageInput({ onOpenMediaModal }) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef(null);

  const { sendMessage, replyingTo, clearReplyingTo } = useChatStore();
  const { showToast } = useUiStore();
  const { t } = useTranslation();

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;

    sendMessage({ text: text.trim(), type: 'text' });
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice note simulation
  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds(s => s + 1);
    }, 1000);
  };

  const stopAndSendRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    
    const mins = Math.floor(recordingSeconds / 60);
    const secs = recordingSeconds % 60;
    const durStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    sendMessage({
      type: 'audio',
      duration: durStr,
      audioUrl: "https://actions.google.com/sounds/v1/water/rain_heavy.ogg"
    });
    setRecordingSeconds(0);
    showToast("Voice message sent!", "success");
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // AI Assistant quick prompt simulations
  const handleAiAction = (actionType) => {
    if (!text.trim()) {
      showToast("Type a draft message first to use AI assistant!", "info");
      return;
    }

    if (actionType === 'professional') {
      setText(`Dear colleague, I would like to formally follow up regarding the deliverables discussed earlier. Let us know if you require additional clarification.`);
      showToast("Draft rewritten professionally!", "success");
    } else if (actionType === 'shorten') {
      setText("Reviewed. Looks great, let's proceed.");
      showToast("Message shortened!", "success");
    } else if (actionType === 'translate') {
      setText("Mwaramutse, nashakaga kubaza niba mwarangije kureba dosiye yohererejwe ejo hashize.");
      showToast("Translated to Kinyarwanda!", "success");
    } else if (actionType === 'grammar') {
      setText(text.trim() + " (checked & polished)");
      showToast("Grammar and tone refined!", "success");
    }
  };

  const emojiList = ["😀", "😂", "😍", "👍", "🔥", "🎉", "🙏", "🇷🇼", "☕", "🚀", "💡", "✨", "❤️", "🥰", "👏", "🙌", "🥳", "😎"];

  return (
    <div className="p-2 sm:p-3 bg-transparent select-none flex-shrink-0 z-20 pb-safe">
      
      {/* Replying-to Preview banner */}
      {replyingTo && (
        <div className="flex items-center justify-between p-2.5 mb-2 mx-1 rounded-2xl bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md text-xs">
          <div className="truncate">
            <span className="font-semibold text-brand-700 dark:text-teal-400 block">
              Replying to {replyingTo.senderName || (replyingTo.senderId === 'user_me' ? 'You' : 'Contact')}
            </span>
            <span className="text-slate-600 dark:text-slate-300 truncate block">
              {replyingTo.text || replyingTo.caption || "Attachment"}
            </span>
          </div>
          <button
            onClick={clearReplyingTo}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recording audio bar simulation */}
      {isRecording ? (
        <div className="flex items-center justify-between p-2.5 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-lg animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
              Recording {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={stopAndSendRecording}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-sm"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Main Rounded Input Capsule (like WhatsApp Mobile pill) */}
          <div className="flex-1 flex items-center bg-white dark:bg-surface-dark border border-slate-200/90 dark:border-slate-800 rounded-3xl px-2 sm:px-3 py-1 shadow-xs">
            
            {/* Emoji Picker Dropdown */}
            <Dropdown
              align="left"
              trigger={
                <button
                  type="button"
                  className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full active:scale-90 transition-all flex-shrink-0"
                  title="Emojis"
                >
                  <Smile className="w-5 h-5 stroke-[1.8]" />
                </button>
              }
            >
              <div className="p-2 grid grid-cols-6 gap-1 w-56 max-h-60 overflow-y-auto">
                {emojiList.map((em) => (
                  <button
                    type="button"
                    key={em}
                    onClick={() => setText(t => t + em)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-lg text-center"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </Dropdown>

            {/* Message Text Input Field */}
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('typeMessage', 'Message')}
              className="flex-1 bg-transparent border-none px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none min-w-0"
            />

            {/* Attachment Button */}
            <button
              type="button"
              onClick={onOpenMediaModal}
              className="p-1.5 text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-teal-400 rounded-full active:scale-90 transition-all flex-shrink-0"
              title="Attach File"
            >
              <Paperclip className="w-5 h-5 -rotate-45 stroke-[1.8]" />
            </button>

            {/* AI Assistant Menu */}
            <Dropdown
              align="right"
              trigger={
                <button
                  type="button"
                  className="p-1.5 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-brand-950/40 rounded-full active:scale-90 transition-all flex-shrink-0"
                  title="AI Writing Assistant"
                >
                  <Sparkles className="w-4.5 h-4.5 stroke-[1.8]" />
                </button>
              }
            >
              <div className="py-1 text-xs text-slate-700 dark:text-slate-200 w-56">
                <div className="px-3 py-1 font-semibold text-[10px] text-teal-600 uppercase tracking-wider flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5" /> AI Composer Tools (Demo)
                </div>
                <button
                  type="button"
                  onClick={() => handleAiAction('professional')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Rewrite professionally
                </button>
                <button
                  type="button"
                  onClick={() => handleAiAction('shorten')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Make shorter & concise
                </button>
                <button
                  type="button"
                  onClick={() => handleAiAction('translate')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Translate to Kinyarwanda
                </button>
                <button
                  type="button"
                  onClick={() => handleAiAction('grammar')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Fix grammar & tone
                </button>
              </div>
            </Dropdown>
          </div>

          {/* WhatsApp Circular Action Floating Button (Send OR Green Voice Mic) */}
          {text.trim() ? (
            <button
              type="submit"
              className="w-11 h-11 rounded-full bg-brand-700 hover:bg-brand-800 active:scale-90 text-white shadow-md transition-all flex items-center justify-center flex-shrink-0"
              title="Send Message"
            >
              <Send className="w-5 h-5 ml-0.5 fill-white stroke-[1.5]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white shadow-md transition-all flex items-center justify-center flex-shrink-0"
              title="Record Voice Note"
            >
              <Mic className="w-5 h-5 stroke-[2.2]" />
            </button>
          )}

        </form>
      )}

    </div>
  );
}
