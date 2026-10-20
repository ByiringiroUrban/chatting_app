import { create } from 'zustand';
import { authApi } from '../services/api';
import { wsService } from '../services/websocket';
import { useChatStore } from './chatStore';

const STORAGE_KEY = 'muraho_auth_user';
const TOKEN_KEY = 'muraho_access_token';
const LOGGED_OUT_KEY = 'muraho_logged_out';

// Determine initial auth state: ONLY restore if a valid token and user exist in storage
const isExplicitlyLoggedOut = localStorage.getItem(LOGGED_OUT_KEY) === 'true';
const savedUserRaw = localStorage.getItem(STORAGE_KEY);
const savedToken = localStorage.getItem(TOKEN_KEY);
let initialUser = null;

if (!isExplicitlyLoggedOut && savedToken && savedUserRaw) {
  try {
    initialUser = JSON.parse(savedUserRaw);
  } catch (e) {
    initialUser = null;
  }
}
const initialAuth = !isExplicitlyLoggedOut && initialUser !== null && Boolean(savedToken);

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
    
    if (!emailOrPhone?.trim() || !password) {
      set({ isLoading: false, error: "Please enter your email/phone and password." });
      return false;
    }

    try {
      const response = await authApi.login({ 
        emailOrPhone: emailOrPhone.trim(), 
        password, 
        rememberMe 
      });

      if (!response?.access_token || !response?.user) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.removeItem(LOGGED_OUT_KEY);
      
      const authenticatedUser = response.user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
      
      set({ user: authenticatedUser, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (e) {
      const errorMsg = e.message || "Invalid credentials or account does not exist.";
      set({ isLoading: false, error: errorMsg });
      return false;
    }
  },

  register: async ({ fullName, username, email, phone, password, avatar, bio }) => {
    set({ isLoading: true, error: null });

    const cleanPhone = phone?.trim() || null;
    const cleanEmail = email?.trim() || null;
    const cleanName = fullName?.trim() || (cleanEmail ? cleanEmail.split('@')[0] : "New User");
    const cleanUsername = username?.trim() || (cleanName.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000));

    try {
      const response = await authApi.register({
        fullName: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        phone: cleanPhone,
        password: password || "password123",
        avatar: avatar || null,
        bio: bio || "Hey there! I am using Muraho."
      });

      if (!response?.access_token || !response?.user) {
        throw new Error("Registration failed: Invalid response from server");
      }

      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.removeItem(LOGGED_OUT_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
      
      set({ user: response.user, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (e) {
      console.error("[Muraho Auth] Backend registration error:", e.message);
      const msg = e.message || "Registration failed. An account with this phone/email may already exist.";
      set({ isLoading: false, error: msg });
      return false;
    }
  },

  sendOtp: async ({ email, phone, fullName }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.sendOtp({ email, phone, fullName });
      set({ isLoading: false });
      return { success: true, message: res.message, emailSent: res.emailSent };
    } catch (e) {
      const msg = e.message || "Failed to dispatch verification code";
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  verifyOtp: async (otpCode, emailOrPhone = null) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.verifyOtp(otpCode, emailOrPhone);
      set({ isLoading: false, error: null });
      return true;
    } catch (e) {
      const msg = e.message || "Invalid 6-digit verification code.";
      set({ isLoading: false, error: msg });
      return false;
    }
  },

  resetPassword: async (emailOrPhone) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.forgotPassword(emailOrPhone);
      set({ isLoading: false });
      return { success: true, message: res.message };
    } catch (e) {
      const msg = e.message || "Failed to send reset code. Please check your email or phone number.";
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  confirmPasswordReset: async ({ emailOrPhone, otpCode, newPassword }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.resetPasswordConfirm({ emailOrPhone, otpCode, newPassword });
      set({ isLoading: false, error: null });
      return { success: true, message: res.message };
    } catch (e) {
      const msg = e.message || "Failed to reset password. Please check your OTP code.";
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
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

    // 2. Reset active chat, contact, group, and call states
    try {
      useChatStore.getState().resetChatState();
    } catch (e) {}
    try {
      const { useContactStore } = await import('./contactStore');
      useContactStore.getState().resetContactsState();
    } catch (e) {}
    try {
      const { useGroupStore } = await import('./groupStore');
      useGroupStore.getState().resetGroupsState();
    } catch (e) {}

    // 3. Clear local storage authentication and sensitive cached keys
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(LOGGED_OUT_KEY, 'true');
    // Clear all legacy and scoped keys
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith('muraho_convs_') ||
        key.startsWith('muraho_msgs_') ||
        key.startsWith('muraho_contacts_') ||
        key.startsWith('muraho_groups_')
      ) {
        localStorage.removeItem(key);
      }
    });
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
