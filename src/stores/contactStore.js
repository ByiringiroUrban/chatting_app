import { create } from 'zustand';
import { mockContacts } from '../data/mockUsers';

const CONTACTS_STORAGE = 'muraho_contacts';

export const useContactStore = create((set, get) => ({
  contacts: JSON.parse(localStorage.getItem(CONTACTS_STORAGE)) || mockContacts,
  searchQuery: "",
  selectedContact: null,
  isAddModalOpen: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedContact: (contact) => set({ selectedContact: contact }),
  setAddModalOpen: (open) => set({ isAddModalOpen: open }),

  addContact: ({ name, phone, email, bio, avatar, label }) => {
    const newContact = {
      id: `user_${Date.now()}`,
      name,
      username: name.toLowerCase().replace(/\s+/g, '_'),
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.rw`,
      bio: bio || "Muraho user",
      avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
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
