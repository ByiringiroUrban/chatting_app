import { create } from 'zustand';
import { mockGroups } from '../data/mockGroups';

const GROUPS_STORAGE = 'muraho_groups';

export const useGroupStore = create((set, get) => ({
  groups: JSON.parse(localStorage.getItem(GROUPS_STORAGE)) || mockGroups,
  activeGroupId: "group_1",
  isCreateModalOpen: false,
  isMemberDrawerOpen: false,

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setMemberDrawerOpen: (open) => set({ isMemberDrawerOpen: open }),
  setActiveGroupId: (id) => set({ activeGroupId: id }),

  createGroup: ({ name, description, avatar, selectedMembers = [] }) => {
    const newGroup = {
      id: `group_${Date.now()}`,
      name,
      description: description || "New community group on Muraho",
      avatar: avatar || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80",
      createdAt: new Date().toISOString().split('T')[0],
      members: [
        { id: "user_me", name: "Jean-Luc Mugisha", role: "admin", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" },
        ...selectedMembers
      ],
      settings: {
        onlyAdminsCanPost: false,
        approveNewMembers: false,
        allowMediaSharing: true
      }
    };

    set((state) => {
      const updated = [newGroup, ...state.groups];
      localStorage.setItem(GROUPS_STORAGE, JSON.stringify(updated));
      return { groups: updated, isCreateModalOpen: false, activeGroupId: newGroup.id };
    });

    return newGroup;
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
