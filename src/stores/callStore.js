import { create } from 'zustand';
import { callApi } from '../services/api';

const CALLS_STORAGE = 'muraho_call_history';

export const useCallStore = create((set, get) => ({
  callHistory: JSON.parse(localStorage.getItem(CALLS_STORAGE)) || [],
  activeCall: null,
  callTimerInterval: null,
  isLoading: false,

  fetchCallHistory: async () => {
    set({ isLoading: true });
    try {
      const data = await callApi.getHistory();
      if (Array.isArray(data)) {
        set({ callHistory: data, isLoading: false });
        localStorage.setItem(CALLS_STORAGE, JSON.stringify(data));
      }
    } catch (err) {
      console.warn("Failed to fetch call history from DB:", err.message);
      set({ isLoading: false });
    }
  },

  startCall: (contact, type = 'voice') => {
    // End any existing call
    get().endCall();

    const newCall = {
      contact,
      type,
      status: 'ringing', // 'ringing' -> 'connected'
      direction: 'outgoing',
      isMuted: false,
      isCameraOff: false,
      isSpeakerOn: false,
      durationSeconds: 0
    };

    set({ activeCall: newCall });

    // Simulate contact answering after 2 seconds
    setTimeout(() => {
      if (get().activeCall && get().activeCall.status === 'ringing') {
        const interval = setInterval(() => {
          set((state) => {
            if (!state.activeCall) return { activeCall: null };
            return {
              activeCall: {
                ...state.activeCall,
                durationSeconds: state.activeCall.durationSeconds + 1
              }
            };
          });
        }, 1000);

        set((state) => ({
          activeCall: state.activeCall ? { ...state.activeCall, status: 'connected' } : null,
          callTimerInterval: interval
        }));
      }
    }, 2200);
  },

  receiveIncomingCall: (contact, type = 'voice') => {
    get().endCall();
    const incoming = {
      contact,
      type,
      status: 'incoming_ringing',
      direction: 'incoming',
      isMuted: false,
      isCameraOff: false,
      isSpeakerOn: false,
      durationSeconds: 0
    };
    set({ activeCall: incoming });
  },

  acceptIncomingCall: () => {
    const { activeCall } = get();
    if (!activeCall) return;

    const interval = setInterval(() => {
      set((state) => {
        if (!state.activeCall) return { activeCall: null };
        return {
          activeCall: {
            ...state.activeCall,
            durationSeconds: state.activeCall.durationSeconds + 1
          }
        };
      });
    }, 1000);

    set({
      activeCall: { ...activeCall, status: 'connected' },
      callTimerInterval: interval
    });
  },

  endCall: () => {
    const { activeCall, callTimerInterval, callHistory } = get();
    if (callTimerInterval) {
      clearInterval(callTimerInterval);
    }

    if (activeCall) {
      const minutes = Math.floor(activeCall.durationSeconds / 60);
      const seconds = activeCall.durationSeconds % 60;
      const durationStr = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

      const historyEntry = {
        id: `call_${Date.now()}`,
        contactId: activeCall.contact.id,
        name: activeCall.contact.name,
        avatar: activeCall.contact.avatar,
        type: activeCall.type,
        direction: activeCall.direction,
        status: activeCall.durationSeconds > 0 ? 'completed' : (activeCall.direction === 'incoming' ? 'missed' : 'cancelled'),
        timestamp: 'Just now',
        duration: activeCall.durationSeconds > 0 ? durationStr : '0s'
      };

      const updatedHistory = [historyEntry, ...callHistory];
      localStorage.setItem(CALLS_STORAGE, JSON.stringify(updatedHistory));
      set({ callHistory: updatedHistory, activeCall: null, callTimerInterval: null });
    } else {
      set({ activeCall: null, callTimerInterval: null });
    }
  },

  toggleMute: () => {
    set((state) => ({
      activeCall: state.activeCall ? { ...state.activeCall, isMuted: !state.activeCall.isMuted } : null
    }));
  },

  toggleCamera: () => {
    set((state) => ({
      activeCall: state.activeCall ? { ...state.activeCall, isCameraOff: !state.activeCall.isCameraOff } : null
    }));
  },

  toggleSpeaker: () => {
    set((state) => ({
      activeCall: state.activeCall ? { ...state.activeCall, isSpeakerOn: !state.activeCall.isSpeakerOn } : null
    }));
  }
}));
