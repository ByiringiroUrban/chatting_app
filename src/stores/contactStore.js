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

  addContact: async ({ name, phone, email, bio, avatar, label }) => {
    const newContact = {
      id: `user_${Date.now()}`,
      name,
      username: name.toLowerCase().replace(/\s+/g, '_'),
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.rw`,
      bio: bio || "Muraho user",
      avatar: avatar || null,
      status: "offline",
      lastSeen: "Recently added",
      isFavorite: false,
      isBlocked: false,
      label: label || "Contact"
    };

    set((state) => {
      const updated = [newContact, ...state.contacts];
      localStorage.setItem(CONTACTS_STORAGE, JSON.stringify(updated));
      return { contacts: updated, isAddModalOpen: false };
    });
  },

  toggleFavorite: (contactId) => {
    set((state) => {
      const updated = state.contacts.map(c =>
        c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c
      );
      localStorage.setItem(CONTACTS_STORAGE, JSON.stringify(updated));
      return { contacts: updated };
    });
  },

  toggleBlock: (contactId) => {
    set((state) => {
      const updated = state.contacts.map(c =>
        c.id === contactId ? { ...c, isBlocked: !c.isBlocked } : c
      );
      localStorage.setItem(CONTACTS_STORAGE, JSON.stringify(updated));
      return { contacts: updated };
    });
  },

  deleteContact: (contactId) => {
    set((state) => {
      const updated = state.contacts.filter(c => c.id !== contactId);
      localStorage.setItem(CONTACTS_STORAGE, JSON.stringify(updated));
      return {
        contacts: updated,
        selectedContact: state.selectedContact?.id === contactId ? null : state.selectedContact
      };
    });
  }
}));
