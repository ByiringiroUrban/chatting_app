import { create } from 'zustand';

export const useMobileNavStore = create((set) => ({
  isChatOpenOnMobile: false,
  setChatOpenOnMobile: (isOpen) => set({ isChatOpenOnMobile: isOpen }),
}));
