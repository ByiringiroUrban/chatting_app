import { create } from 'zustand';
import { initialStatuses } from '../data/mockStatuses';

const STATUS_STORAGE = 'muraho_statuses';

export const useStatusStore = create((set, get) => ({
  statuses: JSON.parse(localStorage.getItem(STATUS_STORAGE)) || initialStatuses,
  activeStatus: null,
  activeItemIndex: 0,
  isViewerOpen: false,
  isPaused: false,
  isCreateModalOpen: false,

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  
  openStatusViewer: (statusId, itemIndex = 0) => {
    const status = get().statuses.find(s => s.id === statusId);
    if (!status) return;

    // Mark as viewed
    const updatedStatuses = get().statuses.map(s =>
      s.id === statusId ? { ...s, hasUnseen: false } : s
    );
    localStorage.setItem(STATUS_STORAGE, JSON.stringify(updatedStatuses));

    set({
      statuses: updatedStatuses,
      activeStatus: status,
      activeItemIndex: itemIndex,
      isViewerOpen: true,
      isPaused: false
    });
  },

  closeStatusViewer: () => set({ isViewerOpen: false, activeStatus: null, activeItemIndex: 0, isPaused: false }),

  setIsPaused: (paused) => set({ isPaused: paused }),

  nextItem: () => {
    const { activeStatus, activeItemIndex, statuses } = get();
    if (!activeStatus) return;

    if (activeItemIndex < activeStatus.items.length - 1) {
      set({ activeItemIndex: activeItemIndex + 1 });
    } else {
      // Find next user's status
      const currentIndex = statuses.findIndex(s => s.id === activeStatus.id);
      if (currentIndex < statuses.length - 1) {
        const nextStatus = statuses[currentIndex + 1];
        get().openStatusViewer(nextStatus.id, 0);
      } else {
        get().closeStatusViewer();
      }
    }
  },

  prevItem: () => {
    const { activeStatus, activeItemIndex, statuses } = get();
    if (!activeStatus) return;

    if (activeItemIndex > 0) {
      set({ activeItemIndex: activeItemIndex - 1 });
    } else {
      // Go to previous user's status
      const currentIndex = statuses.findIndex(s => s.id === activeStatus.id);
      if (currentIndex > 0) {
        const prevStatus = statuses[currentIndex - 1];
        get().openStatusViewer(prevStatus.id, prevStatus.items.length - 1);
      }
    }
  },

  addStatus: ({ type, text, backgroundColor, mediaUrl, caption }) => {
    const newItem = {
      id: `item_me_${Date.now()}`,
      type,
      text,
      backgroundColor: backgroundColor || "from-teal-600 to-emerald-800",
      mediaUrl,
      caption,
      timestamp: "Just now",
      views: 0,
      viewers: []
    };

    set((state) => {
      let foundMe = false;
      const updated = state.statuses.map(s => {
        if (s.isMe) {
          foundMe = true;
          return {
            ...s,
            timestamp: "Just now",
            items: [newItem, ...s.items]
          };
        }
        return s;
      });

      if (!foundMe) {
        updated.unshift({
          id: "status_me",
          userId: "user_me",
          userName: "My Status",
          userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
          isMe: true,
          hasUnseen: false,
          timestamp: "Just now",
          items: [newItem]
        });
      }

      localStorage.setItem(STATUS_STORAGE, JSON.stringify(updated));
      return { statuses: updated, isCreateModalOpen: false };
    });
  }
}));
