import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  X, 
  Sparkles,
  Bot,
  AlertCircle,
  RotateCcw,
  Square,
  Play,
  Pause,
  Trash2
} from 'lucide-react';
import Dropdown from '../common/Dropdown';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';
import { useTranslation } from '../../hooks/useTranslation';
import { wsService } from '../../services/websocket';
import { uploadApi } from '../../services/api';

export default function MessageInput({ onOpenMediaModal }) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [micError, setMicError] = useState(null);
  const [isSendingVoice, setIsSendingVoice] = useState(false);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const previewAudioRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, replyingTo, clearReplyingTo, activeChatId } = useChatStore();
  const { showToast } = useUiStore();
  const { t } = useTranslation();

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Send typing indicator with debounce
  const handleTextChange = (e) => {
    setText(e.target.value);
    
    if (activeChatId && e.target.value.trim()) {
      wsService.sendTyping(activeChatId, true);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        wsService.sendTyping(activeChatId, false);
      }, 2000);
    } else if (activeChatId) {
      wsService.sendTyping(activeChatId, false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;

    // Stop typing indicator
    if (activeChatId) {
      wsService.sendTyping(activeChatId, false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    sendMessage({ text: text.trim(), type: 'text' });
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Real voice recording with MediaRecorder
  const startRecording = async () => {
    setMicError(null);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setIsPreviewing(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        setIsPreviewing(true);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(250); // Collect data every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.error("[Muraho] Microphone access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError("Microphone access denied. Please allow microphone permissions in your browser settings.");
      } else if (err.name === 'NotFoundError') {
        setMicError("No microphone found. Please connect a microphone and try again.");
      } else {
        setMicError("Could not access microphone. Please check your device settings.");
      }
      showToast(micError || "Microphone error", "error");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    // Clean up audio stream
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setRecordedBlob(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setIsPreviewing(false);
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current) return;
    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current.play();
      setIsPreviewPlaying(true);
    }
  };

  const sendVoiceNote = async () => {
    if (!recordedBlob) return;
    setIsSendingVoice(true);

    const mins = Math.floor(recordingSeconds / 60);
    const secs = recordingSeconds % 60;
    const durStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    try {
      // Upload the audio blob to backend
      const file = new File([recordedBlob], `voice_note_${Date.now()}.webm`, {
        type: recordedBlob.type
      });
      const uploadResult = await uploadApi.uploadFile(file);
      const rawAudioUrl = uploadResult.url || '';
      const audioUrl = rawAudioUrl.startsWith('http') ? rawAudioUrl : `http://localhost:8000${rawAudioUrl}`;

      sendMessage({
        type: 'audio',
        duration: durStr,
        mediaUrl: audioUrl,
        fileName: uploadResult.filename || file.name,
        fileSize: uploadResult.size ? `${(uploadResult.size / 1024).toFixed(1)} KB` : null
      });

      showToast("Voice message sent!", "success");
    } catch (err) {
      console.error("[Muraho] Voice upload error:", err);
      showToast("Failed to send voice note. Try again.", "error");
      // Send with local URL as fallback for preview
      sendMessage({
        type: 'audio',
        duration: durStr,
        mediaUrl: recordedUrl,
      });
    }

    // Cleanup
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setIsPreviewing(false);
    setRecordingSeconds(0);
    setIsSendingVoice(false);
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

      {/* Microphone error banner */}
      {micError && (
        <div className="flex items-center gap-2 p-2.5 mb-2 mx-1 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{micError}</span>
          <button onClick={() => setMicError(null)} className="p-1 hover:opacity-70">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Voice note preview bar */}
      {isPreviewing && recordedUrl ? (
        <div className="flex items-center justify-between p-2.5 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-lg">
          <div className="flex items-center gap-2.5 flex-1">
            <button
              type="button"
              onClick={togglePreviewPlay}
              className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center active:scale-90 transition-transform"
            >
              {isPreviewPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-1 h-6">
                {[40, 70, 30, 90, 60, 80, 50, 95, 30, 75, 45, 85, 60, 40, 90, 70, 50, 80].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1 rounded-full bg-emerald-500 dark:bg-emerald-400"
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <audio
              ref={previewAudioRef}
              src={recordedUrl}
              onEnded={() => setIsPreviewPlaying(false)}
              className="hidden"
            />
          </div>
          <div className="flex items-center gap-2 ml-3">
            <button
              type="button"
              onClick={cancelRecording}
              className="p-2 text-slate-500 hover:text-rose-600 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Discard"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={sendVoiceNote}
              disabled={isSendingVoice}
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-full shadow-sm flex items-center gap-1.5"
            >
              {isSendingVoice ? (
                <span className="animate-pulse">Sending...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Send
                </>
              )}
            </button>
          </div>
        </div>
      ) : isRecording ? (
        /* Recording in progress bar */
        <div className="flex items-center justify-between p-2.5 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-lg">
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
              onClick={stopRecording}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-sm flex items-center gap-1.5"
            >
              <Square className="w-3 h-3 fill-white" /> Stop
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
              onChange={handleTextChange}
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
