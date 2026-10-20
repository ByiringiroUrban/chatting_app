import { create } from 'zustand';
import { statusApi } from '../services/api';

const STATUS_STORAGE = 'muraho_statuses';

export const useStatusStore = create((set, get) => ({
  statuses: JSON.parse(localStorage.getItem(STATUS_STORAGE)) || [],
  activeStatus: null,
  activeItemIndex: 0,
  isViewerOpen: false,
  isPaused: false,
  isCreateModalOpen: false,
  isLoading: false,

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),

  fetchStatuses: async () => {
    set({ isLoading: true });
    try {
      const feed = await statusApi.getFeed();
      if (Array.isArray(feed)) {
        set({ statuses: feed, isLoading: false });
        localStorage.setItem(STATUS_STORAGE, JSON.stringify(feed));
      }
    } catch (err) {
      console.warn("Failed to fetch statuses from DB:", err.message);
      set({ isLoading: false });
    }
  },
  
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

  addStatus: async ({ type, text, backgroundColor, mediaUrl, caption }) => {
    const newItem = {
      type,
      text,
      backgroundColor: backgroundColor || "from-teal-600 to-emerald-800",
      mediaUrl,
      caption,
    };

    try {
      await statusApi.createStatus([newItem]);
      await get().fetchStatuses();
    } catch (e) {
      console.warn("Backend status creation fallback:", e.message);
    }
  }
}));
