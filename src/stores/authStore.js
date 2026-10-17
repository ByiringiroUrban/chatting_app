import { create } from 'zustand';
import { currentUser } from '../data/mockUsers';
import { authApi } from '../services/api';
import { wsService } from '../services/websocket';
import { useChatStore } from './chatStore';

const STORAGE_KEY = 'muraho_auth_user';
const TOKEN_KEY = 'muraho_access_token';
const LOGGED_OUT_KEY = 'muraho_logged_out';

// Determine initial auth state
const isExplicitlyLoggedOut = localStorage.getItem(LOGGED_OUT_KEY) === 'true';
const savedUserRaw = localStorage.getItem(STORAGE_KEY);
let initialUser = null;
if (!isExplicitlyLoggedOut) {
  try {
    initialUser = savedUserRaw ? JSON.parse(savedUserRaw) : currentUser;
  } catch (e) {
    initialUser = currentUser;
  }
}
const initialAuth = !isExplicitlyLoggedOut && initialUser !== null;

export const useAuthStore = create((set, get) => ({
  user: initialUser,
  isAuthenticated: initialAuth,
  isLoading: false,
  error: null,
  isLogoutModalOpen: false,

  openLogoutModal: () => set({ isLogoutModalOpen: true }),
  closeLogoutModal: () => set({ isLogoutModalOpen: false }),

  login: async ({ emailOrPhone, password, rememberMe }) => {
    set({ isLoading: true, error: null });
    
    // Simulate auth check or connect to backend
    if (!emailOrPhone || !password) {
      set({ isLoading: false, error: "Please enter your credentials." });
      return false;
    }

    let updatedUser = {
      ...currentUser,
      email: emailOrPhone.includes('@') ? emailOrPhone : currentUser.email,
      phone: !emailOrPhone.includes('@') ? emailOrPhone : currentUser.phone
    };

    try {
      const response = await authApi.login({ emailOrPhone, password, rememberMe });
      if (response?.access_token) {
        localStorage.setItem(TOKEN_KEY, response.access_token);
      }
      if (response?.user) {
        updatedUser = { ...currentUser, ...response.user };
      }
    } catch (e) {
      console.warn("[Muraho Auth] Backend API login offline/fallback, using local session:", e.message);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    localStorage.removeItem(LOGGED_OUT_KEY);
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    }
    
    set({ user: updatedUser, isAuthenticated: true, isLoading: false, error: null });
    return true;
  },

  register: async ({ fullName, username, email, phone, password, avatar, bio }) => {
    set({ isLoading: true, error: null });

    const cleanPhone = phone?.trim() || null;
    const cleanEmail = email?.trim() || null;
    const cleanName = fullName?.trim() || (cleanEmail ? cleanEmail.split('@')[0] : "New User");
    const cleanUsername = username?.trim() || (cleanName.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000));

    let newUser = {
      ...currentUser,
      id: `user_${Date.now()}`,
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail || (cleanPhone ? `${cleanPhone.replace(/\s+/g, '').replace('+', '')}@phone.muraho.rw` : "user@muraho.rw"),
      phone: cleanPhone || "+250 788 000 000",
      avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      bio: bio || "Hey there! I am using Muraho.",
      status: "online",
      role: "user",
      isBusiness: false,
      joinedDate: "Today"
    };

    try {
      const response = await authApi.register({
        fullName: newUser.name,
        username: newUser.username,
        email: cleanEmail,
        phone: cleanPhone,
        password: password || "password123",
        avatar: newUser.avatar,
        bio: newUser.bio
      });

      if (response?.access_token) {
        localStorage.setItem(TOKEN_KEY, response.access_token);
      }
      if (response?.user) {
        newUser = { ...newUser, ...response.user };
      }
    } catch (e) {
      console.warn("[Muraho Auth] Backend API registration fallback to local state:", e.message);
      await new Promise((resolve) => setTimeout(resolve, 700));
    }

    localStorage.removeItem(LOGGED_OUT_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    set({ user: newUser, isAuthenticated: true, isLoading: false, error: null });
    return true;
  },

  verifyOtp: async (otpCode) => {
    set({ isLoading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (otpCode.length === 6) {
      set({ isLoading: false, error: null });
      return true;
    } else {
      set({ isLoading: false, error: "Invalid 6-digit code. Please try 123456" });
      return false;
    }
  },

  resetPassword: async (emailOrPhone) => {
    set({ isLoading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 700));
    set({ isLoading: false });
    return true;
  },

  updateProfile: (updatedFields) => {
    set((state) => {
      const updated = { ...state.user, ...updatedFields };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { user: updated };
    });
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      await authApi.logout();
    } catch (e) {
      console.warn("[Muraho Auth] Backend logout notice:", e.message);
    }

    // 1. Disconnect active WebSocket connection
    wsService.disconnect();

    // 2. Reset active chat / call states
    try {
      useChatStore.getState().resetChatState();
    } catch (e) {}

    // 3. Clear local storage authentication and set logged_out sentinel
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(LOGGED_OUT_KEY, 'true');
    sessionStorage.clear();

    // 4. Update store state
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isLogoutModalOpen: false
    });

    return true;
  }
}));
