import { create } from 'zustand';

const THEME_STORAGE = 'muraho_theme';
const LANG_STORAGE = 'muraho_language';

// Helper to apply dark class
const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

const initialTheme = localStorage.getItem(THEME_STORAGE) || 'light';
applyTheme(initialTheme);

export const useUiStore = create((set, get) => ({
  theme: initialTheme,
  language: localStorage.getItem(LANG_STORAGE) || 'en',
  accentColor: '#0F766E',
  fontSize: 'normal', // 'small' | 'normal' | 'large'
  mobileView: 'list', // 'list' | 'chat'
  toasts: [],

  setTheme: (theme) => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE, theme);
    set({ theme });
  },

  setLanguage: (language) => {
    localStorage.setItem(LANG_STORAGE, language);
    set({ language });
  },

  setMobileView: (view) => set({ mobileView: view }),
  setAccentColor: (color) => set({ accentColor: color }),
  setFontSize: (size) => set({ fontSize: size }),

  showToast: (message, type = 'success', duration = 3000) => {
    const id = `toast_${Date.now()}`;
    const newToast = { id, message, type };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  }
}));
