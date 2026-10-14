import React, { useEffect } from 'react';
import { useStatusStore } from '../../stores/statusStore';
import { X, ChevronLeft, ChevronRight, Eye, Pause, Play, Send } from 'lucide-react';
import Avatar from '../common/Avatar';

export default function StatusViewerModal() {
  const {
    activeStatus,
    activeItemIndex,
    isViewerOpen,
    isPaused,
    closeStatusViewer,
    nextItem,
    prevItem,
    setIsPaused
  } = useStatusStore();

  useEffect(() => {
    if (!isViewerOpen || isPaused) return;

    // Auto progress after 5 seconds
    const timer = setTimeout(() => {
      nextItem();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isViewerOpen, activeItemIndex, activeStatus, isPaused, nextItem]);

  if (!isViewerOpen || !activeStatus) return null;

  const currentItem = activeStatus.items[activeItemIndex] || activeStatus.items[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in">
      
      {/* Click zones for Previous & Next */}
      <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={prevItem} />
      <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" onClick={nextItem} />

      <div className="relative w-full max-w-sm sm:max-w-md h-[88vh] max-h-[750px] bg-slate-900 rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-slate-800 z-20">
        
        {/* Top Progress Bars */}
        <div className="p-3.5 z-30 flex flex-col gap-2.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-1.5 w-full">
            {activeStatus.items.map((_, i) => (
              <div key={i} className="flex-1 h-1 bg-white/25 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-white transition-all duration-linear ${
                    i < activeItemIndex ? 'w-full' : i === activeItemIndex && !isPaused ? 'w-full duration-5000' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* User info & Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar src={activeStatus.userAvatar} alt={activeStatus.userName} size="sm" />
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">{activeStatus.userName}</h4>
                <p className="text-[10px] text-slate-300">{currentItem?.timestamp || activeStatus.timestamp}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
                title={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={closeStatusViewer}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Content (Text gradient or Image) */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden px-6 text-center">
          {currentItem?.type === 'text' ? (
            <div className={`w-full h-full flex items-center justify-center p-6 bg-gradient-to-tr ${currentItem.backgroundColor || 'from-teal-600 to-emerald-800'} rounded-2xl shadow-inner`}>
              <p className="text-xl sm:text-2xl font-bold text-white tracking-wide leading-relaxed font-sans">
                {currentItem.text}
              </p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <img
                src={currentItem?.mediaUrl}
                alt="Status update"
                className="max-h-full max-w-full object-contain rounded-xl"
              />
              {currentItem?.caption && (
                <div className="absolute bottom-16 inset-x-4 bg-black/60 backdrop-blur-xs p-3 rounded-2xl text-xs text-white">
                  {currentItem.caption}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer: View count or Reply to status */}
        <div className="p-3 z-30 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between">
          {activeStatus.isMe ? (
            <div className="w-full flex items-center justify-center gap-1.5 text-white text-xs font-semibold py-1">
              <Eye className="w-4 h-4 text-teal-400" />
              <span>{currentItem?.views || 0} views</span>
            </div>
          ) : (
            <div className="w-full flex items-center gap-2">
              <input
                type="text"
                placeholder="Reply to status..."
                className="flex-1 bg-white/20 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-white/70 focus:outline-none focus:bg-white/30"
              />
              <button className="p-2 rounded-full bg-brand-600 text-white hover:bg-brand-500">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
