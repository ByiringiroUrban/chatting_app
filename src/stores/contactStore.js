import { create } from 'zustand';
import { authApi } from '../services/api';

const getContactsStorageKey = () => {
  try {
    const u = JSON.parse(localStorage.getItem('muraho_auth_user'));
    return u?.id ? `muraho_contacts_${u.id}` : 'muraho_contacts_guest';
  } catch (e) {
    return 'muraho_contacts_guest';
  }
};

export const useContactStore = create((set, get) => ({
  contacts: [],
  searchQuery: "",
  selectedContact: null,
  isAddModalOpen: false,
  isLoading: false,

  resetContactsState: () => {
    localStorage.removeItem(getContactsStorageKey());
    localStorage.removeItem('muraho_contacts');
    set({
      contacts: [],
      searchQuery: "",
      selectedContact: null,
      isAddModalOpen: false,
      isLoading: false
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedContact: (contact) => set({ selectedContact: contact }),
  setAddModalOpen: (open) => set({ isAddModalOpen: open }),

  fetchContacts: async () => {
    set({ isLoading: true });
    try {
      const data = await authApi.getContacts();
      if (Array.isArray(data)) {
        set({ contacts: data, isLoading: false });
        localStorage.setItem(getContactsStorageKey(), JSON.stringify(data));
      }
    } catch (err) {
      console.warn("Failed to fetch contacts from DB:", err.message);
      set({ isLoading: false });
    }
  },

  addContact: async ({ contactId, name, phone, email, bio, avatar, label }) => {
    try {
      const payload = {
        contactId: contactId || `user_${Date.now()}`,
        name,
        phone,
        email,
        label: label || "Contact"
      };
      await authApi.addContact(payload);
      await get().fetchContacts();
      set({ isAddModalOpen: false });
    } catch (e) {
      console.warn("Failed to add contact on server:", e.message);
      // Fallback local update
      const newContact = {
        id: contactId || `user_${Date.now()}`,
        name,
        phone,
        email,
        bio: bio || "Muraho user",
        avatar: avatar || null,
        status: "offline",
        lastSeen: "Recently",
        isFavorite: false,
        isBlocked: false,
        label: label || "Contact"
      };
      set((state) => {
        const updated = [newContact, ...state.contacts];
        localStorage.setItem(getContactsStorageKey(), JSON.stringify(updated));
        return { contacts: updated, isAddModalOpen: false };
      });
    }
  },

  updateContactNickname: async (contactId, newName, newLabel) => {
    try {
      await authApi.updateContact(contactId, { name: newName, label: newLabel });
    } catch (e) {
      console.warn("Failed to update contact on server:", e);
    }
    set((state) => {
      const updated = state.contacts.map(c =>
        c.id === contactId || c.contactId === contactId
          ? { ...c, name: newName || c.name, label: newLabel !== undefined ? newLabel : c.label }
          : c
      );
      localStorage.setItem(getContactsStorageKey(), JSON.stringify(updated));
      return { contacts: updated };
    });
  },

  toggleFavorite: async (contactId) => {
    const contact = get().contacts.find(c => c.id === contactId);
    const newStatus = !contact?.isFavorite;
    try {
      await authApi.updateContact(contactId, { isFavorite: newStatus });
    } catch (e) {
      console.warn("Failed to update favorite on server:", e);
    }
    set((state) => {
      const updated = state.contacts.map(c =>
        c.id === contactId ? { ...c, isFavorite: newStatus } : c
      );
      localStorage.setItem(getContactsStorageKey(), JSON.stringify(updated));
      return { contacts: updated };
    });
  },

  toggleBlock: async (contactId) => {
    const contact = get().contacts.find(c => c.id === contactId);
    const newStatus = !contact?.isBlocked;
    try {
      await authApi.updateContact(contactId, { isBlocked: newStatus });
    } catch (e) {
      console.warn("Failed to update block status on server:", e);
    }
    set((state) => {
      const updated = state.contacts.map(c =>
        c.id === contactId ? { ...c, isBlocked: newStatus } : c
      );
      localStorage.setItem(getContactsStorageKey(), JSON.stringify(updated));
      return { contacts: updated };
    });
  },

  deleteContact: async (contactId) => {
    try {
      await authApi.deleteContact(contactId);
    } catch (e) {
      console.warn("Failed to delete contact on server:", e);
    }
    set((state) => {
      const updated = state.contacts.filter(c => c.id !== contactId && c.contactId !== contactId);
      localStorage.setItem(getContactsStorageKey(), JSON.stringify(updated));
      return {
        contacts: updated,
        selectedContact: state.selectedContact?.id === contactId ? null : state.selectedContact
      };
    });
  }
}));
