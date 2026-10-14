import { create } from 'zustand';
import { currentUser } from '../data/mockUsers';

const STORAGE_KEY = 'muraho_auth_user';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem(STORAGE_KEY)) || currentUser,
  isAuthenticated: true,
  isLoading: false,
  error: null,

  login: async ({ emailOrPhone, password, rememberMe }) => {
    set({ isLoading: true, error: null });
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Simulate auth check
    if (!emailOrPhone || !password) {
      set({ isLoading: false, error: "Please enter your credentials." });
      return false;
    }

    const updatedUser = {
      ...currentUser,
      email: emailOrPhone.includes('@') ? emailOrPhone : currentUser.email,
      phone: !emailOrPhone.includes('@') ? emailOrPhone : currentUser.phone
    };

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    }
    
    set({ user: updatedUser, isAuthenticated: true, isLoading: false, error: null });
    return true;
  },

  register: async ({ fullName, username, email, phone, password }) => {
    set({ isLoading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 900));

    const newUser = {
      ...currentUser,
      id: `user_${Date.now()}`,
      name: fullName || "New User",
      username: username || "user_rw",
      email: email || "user@muraho.rw",
      phone: phone || "+250 788 000 111",
    };

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

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ isAuthenticated: false });
  }
}));
