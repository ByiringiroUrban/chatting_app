import { create } from 'zustand';
import { channelApi } from '../services/api';

const CHANNELS_STORAGE = 'muraho_channels';

export const useChannelStore = create((set, get) => ({
  channels: JSON.parse(localStorage.getItem(CHANNELS_STORAGE)) || [],
  activeChannelId: null,
  categoryFilter: "All",
  searchQuery: "",
  isCreateModalOpen: false,
  isSubscriptionModalOpen: false,
  selectedChannelForSub: null,
  isLoading: false,

  setActiveChannelId: (id) => set({ activeChannelId: id }),
  setCategoryFilter: (cat) => set({ categoryFilter: cat }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setSubscriptionModalOpen: (open, channel = null) =>
    set({ isSubscriptionModalOpen: open, selectedChannelForSub: channel }),

  fetchChannels: async (category) => {
    set({ isLoading: true });
    try {
      const data = await channelApi.getChannels(category);
      if (Array.isArray(data)) {
        set({ 
          channels: data, 
          isLoading: false,
          activeChannelId: get().activeChannelId || (data[0]?.id || null)
        });
        localStorage.setItem(CHANNELS_STORAGE, JSON.stringify(data));
      }
    } catch (err) {
      console.warn("Failed to fetch channels from DB:", err.message);
      set({ isLoading: false });
    }
  },

  toggleSubscribe: async (channelId) => {
    const channel = get().channels.find(c => c.id === channelId);
    if (!channel) return;

    if (channel.isPremium && !channel.isSubscribed) {
      set({ isSubscriptionModalOpen: true, selectedChannelForSub: channel });
      return;
    }

    try {
      const res = await channelApi.subscribeChannel(channelId);
      if (res) {
        set((state) => {
          const updated = state.channels.map(c =>
            c.id === channelId ? { ...c, isSubscribed: res.isSubscribed, subscribers: res.subscribers } : c
          );
          localStorage.setItem(CHANNELS_STORAGE, JSON.stringify(updated));
          return { channels: updated };
        });
        return;
      }
    } catch (e) {
      // fallback local update
    }

    set((state) => {
      const updated = state.channels.map(c => {
        if (c.id === channelId) {
          const isSubscribed = !c.isSubscribed;
          return {
            ...c,
            isSubscribed,
            subscribers: isSubscribed ? c.subscribers + 1 : c.subscribers - 1
          };
        }
        return c;
      });
      localStorage.setItem(CHANNELS_STORAGE, JSON.stringify(updated));
      return { channels: updated };
    });
  },

  unlockPremiumChannel: (channelId) => {
    set((state) => {
      const updated = state.channels.map(c => {
        if (c.id === channelId) {
          return {
            ...c,
            isSubscribed: true,
            subscribers: c.subscribers + 1,
            posts: c.posts.map(p => ({ ...p, isLocked: false }))
          };
        }
        return c;
      });
      localStorage.setItem(CHANNELS_STORAGE, JSON.stringify(updated));
      return { channels: updated, isSubscriptionModalOpen: false, selectedChannelForSub: null };
    });
  },

  addReactionToPost: (channelId, postId, emoji) => {
    set((state) => {
      const updated = state.channels.map(c => {
        if (c.id === channelId) {
          return {
            ...c,
            posts: c.posts.map(p => {
              if (p.id === postId) {
                const reactions = p.reactions ? [...p.reactions] : [];
                const existing = reactions.find(r => r.emoji === emoji);
                if (existing) {
                  existing.count += 1;
                } else {
                  reactions.push({ emoji, count: 1 });
                }
                return { ...p, reactions };
              }
              return p;
            })
          };
        }
        return c;
      });
      localStorage.setItem(CHANNELS_STORAGE, JSON.stringify(updated));
      return { channels: updated };
    });
  },

  createChannel: ({ name, handle, description, category, isPremium, priceMonthly, avatar }) => {
    const newChannel = {
      id: `channel_${Date.now()}`,
      name,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      avatar: avatar || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&q=80",
      category: category || "General",
      description: description || "Channel created on Muraho",
      subscribers: 1,
      isSubscribed: true,
      isVerified: false,
      isPremium: Boolean(isPremium),
      priceMonthly: isPremium ? Number(priceMonthly) || 3000 : 0,
      posts: [
        {
          id: `post_${Date.now()}`,
          title: "Welcome to " + name,
          content: "Thank you for joining our official updates channel!",
          timestamp: "Just now",
          views: "1",
          reactions: [{ emoji: "🎉", count: 1 }]
        }
      ]
    };

    set((state) => {
      const updated = [newChannel, ...state.channels];
      localStorage.setItem(CHANNELS_STORAGE, JSON.stringify(updated));
      return { channels: updated, isCreateModalOpen: false, activeChannelId: newChannel.id };
    });
  }
}));
