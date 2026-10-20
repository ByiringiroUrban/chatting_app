import { create } from 'zustand';
import { businessApi } from '../services/api';

const BIZ_PROFILE_STORAGE = 'muraho_biz_profile';
const BIZ_PRODUCTS_STORAGE = 'muraho_biz_products';
const BIZ_INBOX_STORAGE = 'muraho_biz_inbox';

export const useBusinessStore = create((set, get) => ({
  profile: JSON.parse(localStorage.getItem(BIZ_PROFILE_STORAGE)) || null,
  products: JSON.parse(localStorage.getItem(BIZ_PRODUCTS_STORAGE)) || [],
  customerInbox: JSON.parse(localStorage.getItem(BIZ_INBOX_STORAGE)) || [],
  analytics: null,
  selectedCustomer: null,
  isProductModalOpen: false,
  editingProduct: null,
  isLoading: false,

  setSelectedCustomer: (cust) => set({ selectedCustomer: cust }),
  setProductModalOpen: (open, product = null) => set({ isProductModalOpen: open, editingProduct: product }),

  fetchBusinessData: async () => {
    set({ isLoading: true });
    try {
      const [profileData, catalogData, inboxData, analyticsData] = await Promise.allSettled([
        businessApi.getProfile(),
        businessApi.getCatalog(),
        businessApi.getInbox(),
        businessApi.getAnalytics()
      ]);

      const updates = {};
      if (profileData.status === 'fulfilled' && profileData.value) {
        updates.profile = profileData.value;
        localStorage.setItem(BIZ_PROFILE_STORAGE, JSON.stringify(profileData.value));
      }
      if (catalogData.status === 'fulfilled' && Array.isArray(catalogData.value)) {
        updates.products = catalogData.value;
        localStorage.setItem(BIZ_PRODUCTS_STORAGE, JSON.stringify(catalogData.value));
      }
      if (inboxData.status === 'fulfilled' && Array.isArray(inboxData.value)) {
        updates.customerInbox = inboxData.value;
        localStorage.setItem(BIZ_INBOX_STORAGE, JSON.stringify(inboxData.value));
      }
      if (analyticsData.status === 'fulfilled' && analyticsData.value) {
        updates.analytics = analyticsData.value;
      }
      set({ ...updates, isLoading: false });
    } catch (e) {
      console.warn("Business sync error:", e);
      set({ isLoading: false });
    }
  },

  updateProfile: (updates) => {
    set((state) => {
      const updated = { ...state.profile, ...updates };
      localStorage.setItem(BIZ_PROFILE_STORAGE, JSON.stringify(updated));
      return { profile: updated };
    });
  },

  toggleAiSupport: () => {
    set((state) => {
      const updatedProfile = {
        ...state.profile,
        aiSupport: {
          ...state.profile.aiSupport,
          enabled: !state.profile.aiSupport.enabled
        }
      };
      localStorage.setItem(BIZ_PROFILE_STORAGE, JSON.stringify(updatedProfile));
      return { profile: updatedProfile };
    });
  },

  addFaq: ({ question, answer }) => {
    set((state) => {
      const newFaq = { id: `faq_${Date.now()}`, question, answer };
      const updatedProfile = {
        ...state.profile,
        aiSupport: {
          ...state.profile.aiSupport,
          faqs: [...state.profile.aiSupport.faqs, newFaq]
        }
      };
      localStorage.setItem(BIZ_PROFILE_STORAGE, JSON.stringify(updatedProfile));
      return { profile: updatedProfile };
    });
  },

  deleteFaq: (faqId) => {
    set((state) => {
      const updatedProfile = {
        ...state.profile,
        aiSupport: {
          ...state.profile.aiSupport,
          faqs: state.profile.aiSupport.faqs.filter(f => f.id !== faqId)
        }
      };
      localStorage.setItem(BIZ_PROFILE_STORAGE, JSON.stringify(updatedProfile));
      return { profile: updatedProfile };
    });
  },

  addProduct: (product) => {
    const newProduct = {
      id: `prod_${Date.now()}`,
      currency: "RWF",
      status: "in_stock",
      salesCount: 0,
      image: product.image || "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80",
      ...product,
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 10
    };

    set((state) => {
      const updated = [newProduct, ...state.products];
      localStorage.setItem(BIZ_PRODUCTS_STORAGE, JSON.stringify(updated));
      return { products: updated, isProductModalOpen: false, editingProduct: null };
    });
  },

  updateProduct: (productId, updates) => {
    set((state) => {
      const updated = state.products.map(p =>
        p.id === productId ? { ...p, ...updates, price: Number(updates.price ?? p.price) } : p
      );
      localStorage.setItem(BIZ_PRODUCTS_STORAGE, JSON.stringify(updated));
      return { products: updated, isProductModalOpen: false, editingProduct: null };
    });
  },

  deleteProduct: (productId) => {
    set((state) => {
      const updated = state.products.filter(p => p.id !== productId);
      localStorage.setItem(BIZ_PRODUCTS_STORAGE, JSON.stringify(updated));
      return { products: updated };
    });
  },

  updateCustomerStatus: (customerId, status) => {
    set((state) => {
      const updated = state.customerInbox.map(c =>
        c.id === customerId ? { ...c, status } : c
      );
      localStorage.setItem(BIZ_INBOX_STORAGE, JSON.stringify(updated));
      return {
        customerInbox: updated,
        selectedCustomer: state.selectedCustomer?.id === customerId ? { ...state.selectedCustomer, status } : state.selectedCustomer
      };
    });
  },

  updateCustomerNote: (customerId, notes) => {
    set((state) => {
      const updated = state.customerInbox.map(c =>
        c.id === customerId ? { ...c, notes } : c
      );
      localStorage.setItem(BIZ_INBOX_STORAGE, JSON.stringify(updated));
      return {
        customerInbox: updated,
        selectedCustomer: state.selectedCustomer?.id === customerId ? { ...state.selectedCustomer, notes } : state.selectedCustomer
      };
    });
  }
}));
