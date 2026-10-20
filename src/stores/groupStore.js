import { create } from 'zustand';
import { groupApi } from '../services/api';

const getGroupsStorageKey = () => {
  try {
    const u = JSON.parse(localStorage.getItem('muraho_auth_user'));
    return u?.id ? `muraho_groups_${u.id}` : 'muraho_groups_guest';
  } catch (e) {
    return 'muraho_groups_guest';
  }
};

export const useGroupStore = create((set, get) => ({
  groups: [],
  activeGroupId: null,
  isCreateModalOpen: false,
  isMemberDrawerOpen: false,
  isLoading: false,

  resetGroupsState: () => {
    localStorage.removeItem(getGroupsStorageKey());
    localStorage.removeItem('muraho_groups');
    set({
      groups: [],
      activeGroupId: null,
      isCreateModalOpen: false,
      isMemberDrawerOpen: false,
      isLoading: false
    });
  },

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setMemberDrawerOpen: (open) => set({ isMemberDrawerOpen: open }),
  setActiveGroupId: (id) => set({ activeGroupId: id }),

  fetchGroups: async () => {
    set({ isLoading: true });
    try {
      const data = await groupApi.getGroups();
      if (Array.isArray(data)) {
        set({ 
          groups: data, 
          isLoading: false, 
          activeGroupId: get().activeGroupId || (data[0]?.id || null) 
        });
        localStorage.setItem(getGroupsStorageKey(), JSON.stringify(data));
      }
    } catch (err) {
      console.warn("Failed to fetch groups from DB:", err.message);
      set({ isLoading: false });
    }
  },

  createGroup: async ({ name, description, avatar, selectedMembers = [] }) => {
    const memberIds = selectedMembers.map(m => m.id || m);
    try {
      const created = await groupApi.createGroup({
        name,
        description: description || "New community group on Muraho",
        avatar: avatar || null,
        memberIds
      });
      if (created) {
        set((state) => {
          const updated = [created, ...state.groups];
          localStorage.setItem(GROUPS_STORAGE, JSON.stringify(updated));
          return { groups: updated, isCreateModalOpen: false, activeGroupId: created.id };
        });
        return created;
      }
    } catch (e) {
      console.error("Failed to create group on backend:", e);
    }
  },

  addMember: (groupId, member) => {
    set((state) => {
      const updated = state.groups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            members: [...g.members, { ...member, role: 'member' }]
          };
        }
        return g;
      });
      localStorage.setItem(GROUPS_STORAGE, JSON.stringify(updated));
      return { groups: updated };
    });
  },

  removeMember: (groupId, memberId) => {
    set((state) => {
      const updated = state.groups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            members: g.members.filter(m => m.id !== memberId)
          };
        }
        return g;
      });
      localStorage.setItem(GROUPS_STORAGE, JSON.stringify(updated));
      return { groups: updated };
    });
  }
}));
