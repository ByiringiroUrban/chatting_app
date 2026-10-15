import { create } from 'zustand';
import { initialConversations } from '../data/mockConversations';
import { initialMessages } from '../data/mockMessages';
import { chatApi } from '../services/api';
import { wsService } from '../services/websocket';

const CONV_STORAGE = 'muraho_conversations';
const MSG_STORAGE = 'muraho_messages';

export const useChatStore = create((set, get) => ({
  conversations: JSON.parse(localStorage.getItem(CONV_STORAGE)) || initialConversations,
  messages: JSON.parse(localStorage.getItem(MSG_STORAGE)) || initialMessages,
  activeChatId: null,
  filter: "all", // 'all' | 'unread' | 'groups' | 'favorites'
  searchQuery: "",
  replyingTo: null,
  forwardingMessage: null,
  isRecordingVoice: false,
  isSearchingChat: false,
  isContactInfoOpen: false,

  setActiveChatId: (chatId) => {
    const currentId = get().activeChatId;
    if (currentId && currentId !== chatId) {
      wsService.leaveConversation(currentId);
    }
    if (chatId) {
      wsService.joinConversation(chatId);
      chatApi.markAsRead(chatId).catch(() => {});
      get().fetchMessages(chatId);
    }
    set((state) => {
      // Mark unread as 0 when opening chat
      const updatedConvs = state.conversations.map((c) =>
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      );
      localStorage.setItem(CONV_STORAGE, JSON.stringify(updatedConvs));
      return { activeChatId: chatId, conversations: updatedConvs, replyingTo: null };
    });
  },

  fetchConversations: async () => {
    try {
      const convs = await chatApi.getConversations();
      if (convs && convs.length > 0) {
        set({ conversations: convs });
        localStorage.setItem(CONV_STORAGE, JSON.stringify(convs));
      }
    } catch (e) {
      // Graceful fallback to cached state
    }
  },

  fetchMessages: async (chatId) => {
    if (!chatId) return;
    try {
      const msgs = await chatApi.getMessages(chatId);
      if (msgs && msgs.length > 0) {
        set((state) => {
          const newMessages = { ...state.messages, [chatId]: msgs };
          localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
          return { messages: newMessages };
        });
      }
    } catch (e) {
      // Graceful fallback
    }
  },

  addInboundMessage: (msg) => {
    const { activeChatId } = get();
    const chatId = msg.conversationId;
    if (!chatId) return;

    set((state) => {
      const curList = state.messages[chatId] || [];
      if (curList.some((m) => m.id === msg.id)) return state;

      const updatedChatMsgs = [...curList, msg];
      const newMessages = { ...state.messages, [chatId]: updatedChatMsgs };

      const updatedConvs = state.conversations.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            unreadCount: c.id === activeChatId ? 0 : (c.unreadCount || 0) + 1,
            isTyping: false,
            lastMessage: {
              id: msg.id,
              senderId: msg.senderId,
              text: msg.text,
              timestamp: msg.timestamp,
              status: msg.status,
              type: msg.type
            }
          };
        }
        return c;
      });

      localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
      localStorage.setItem(CONV_STORAGE, JSON.stringify(updatedConvs));
      return { messages: newMessages, conversations: updatedConvs };
    });
  },

  setInboundTyping: ({ conversationId, isTyping }) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, isTyping } : c
      )
    }));
  },

  setInboundReaction: ({ messageId, reactions }) => {
    const { activeChatId } = get();
    if (!activeChatId) return;
    set((state) => {
      const cur = state.messages[activeChatId] || [];
      const updated = cur.map((m) => (m.id === messageId ? { ...m, reactions } : m));
      return { messages: { ...state.messages, [activeChatId]: updated } };
    });
  },

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setReplyingTo: (message) => set({ replyingTo: message }),
  clearReplyingTo: () => set({ replyingTo: null }),
  setForwardingMessage: (message) => set({ forwardingMessage: message }),
  toggleSearchingChat: () => set((s) => ({ isSearchingChat: !s.isSearchingChat })),
  toggleContactInfo: () => set((s) => ({ isContactInfoOpen: !s.isContactInfoOpen })),

  sendMessage: ({ text, type = 'text', mediaUrl = null, fileName = null, fileSize = null, duration = null, caption = null }) => {
    const { activeChatId, replyingTo, conversations, messages } = get();
    if (!activeChatId) return;

    const conv = conversations.find(c => c.id === activeChatId);
    if (!conv) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      conversationId: activeChatId,
      senderId: "user_me",
      text: text || caption || (type === 'audio' ? `Voice note (${duration || '0:15'})` : fileName || ''),
      timestamp: timeString,
      date: "Today",
      status: "sent",
      type,
      mediaUrl,
      fileName,
      fileSize,
      duration,
      caption,
      reactions: [],
      replyTo: replyingTo ? {
        id: replyingTo.id,
        senderName: replyingTo.senderName || (replyingTo.senderId === 'user_me' ? 'You' : conv.name),
        text: replyingTo.text || replyingTo.caption || 'Attachment'
      } : null
    };

    const currentChatMsgs = messages[activeChatId] || [];
    const updatedChatMsgs = [...currentChatMsgs, newMsg];
    const newMessages = { ...messages, [activeChatId]: updatedChatMsgs };

    const updatedConvs = conversations.map((c) => {
      if (c.id === activeChatId) {
        return {
          ...c,
          lastMessage: {
            id: newMsg.id,
            senderId: "user_me",
            text: newMsg.text,
            timestamp: timeString,
            status: "sent",
            type: newMsg.type,
          }
        };
      }
      return c;
    });

    // Save to state and localStorage
    set({
      messages: newMessages,
      conversations: updatedConvs,
      replyingTo: null
    });
    localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
    localStorage.setItem(CONV_STORAGE, JSON.stringify(updatedConvs));

    // Send to Python backend if reachable
    chatApi.sendMessage(activeChatId, {
      text: newMsg.text,
      type: newMsg.type,
      mediaUrl: newMsg.mediaUrl,
      fileName: newMsg.fileName,
      fileSize: newMsg.fileSize,
      duration: newMsg.duration,
      caption: newMsg.caption,
      replyTo: newMsg.replyTo
    }).catch(() => {});

    // Simulate tick to 'delivered' then 'read'
    setTimeout(() => {
      set((state) => {
        const msgs = { ...state.messages };
        if (msgs[activeChatId]) {
          msgs[activeChatId] = msgs[activeChatId].map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m);
        }
        return { messages: msgs };
      });
    }, 700);

    setTimeout(() => {
      set((state) => {
        const msgs = { ...state.messages };
        if (msgs[activeChatId]) {
          msgs[activeChatId] = msgs[activeChatId].map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m);
        }
        return { messages: msgs };
      });
    }, 1500);

    // Simulate reply if direct conversation
    if (conv.type === 'direct') {
      setTimeout(() => {
        // Show typing indicator
        set((state) => ({
          conversations: state.conversations.map(c => c.id === activeChatId ? { ...c, isTyping: true } : c)
        }));

        setTimeout(() => {
          // Send simulated response
          get().simulateContactReply(activeChatId, conv.participantId, conv.name);
        }, 2200);
      }, 1800);
    }
  },

  simulateContactReply: (chatId, participantId, participantName) => {
    const replies = [
      "Murakoze cyane! I just reviewed this and everything looks great.",
      "Sounds like a fantastic plan! Let's follow up on this during our call.",
      "Noted! I will make sure the team gets the updated details right away.",
      "Nibyo kabisa! Thanks for sharing this update.",
      "Perfect. I'll get back to you with the finalized documentation shortly."
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const replyMsg = {
      id: `msg_reply_${Date.now()}`,
      conversationId: chatId,
      senderId: participantId,
      text: randomReply,
      timestamp: timeString,
      date: "Today",
      status: "read",
      type: "text",
      reactions: []
    };

    set((state) => {
      const msgs = { ...state.messages };
      const currentList = msgs[chatId] || [];
      msgs[chatId] = [...currentList, replyMsg];

      const convs = state.conversations.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            isTyping: false,
            lastMessage: {
              id: replyMsg.id,
              senderId: participantId,
              text: replyMsg.text,
              timestamp: timeString,
              status: "read",
              type: "text"
            }
          };
        }
        return c;
      });

      localStorage.setItem(MSG_STORAGE, JSON.stringify(msgs));
      localStorage.setItem(CONV_STORAGE, JSON.stringify(convs));
      return { messages: msgs, conversations: convs };
    });
  },

  addReaction: (messageId, emoji) => {
    const { activeChatId, messages } = get();
    if (!activeChatId || !messages[activeChatId]) return;

    const updatedList = messages[activeChatId].map((m) => {
      if (m.id === messageId) {
        const reactions = m.reactions ? [...m.reactions] : [];
        const existing = reactions.find(r => r.emoji === emoji);
        if (existing) {
          if (existing.users.includes('user_me')) {
            existing.users = existing.users.filter(u => u !== 'user_me');
            existing.count -= 1;
          } else {
            existing.users.push('user_me');
            existing.count += 1;
          }
        } else {
          reactions.push({ emoji, count: 1, users: ['user_me'] });
        }
        return { ...m, reactions: reactions.filter(r => r.count > 0) };
      }
      return m;
    });

    const newMessages = { ...messages, [activeChatId]: updatedList };
    set({ messages: newMessages });
    localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
  },

  deleteMessage: (messageId) => {
    const { activeChatId, messages } = get();
    if (!activeChatId || !messages[activeChatId]) return;

    const updatedList = messages[activeChatId].filter(m => m.id !== messageId);
    const newMessages = { ...messages, [activeChatId]: updatedList };
    set({ messages: newMessages });
    localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
  },

  editMessage: (messageId, newText) => {
    const { activeChatId, messages } = get();
    if (!activeChatId || !messages[activeChatId]) return;

    const updatedList = messages[activeChatId].map(m =>
      m.id === messageId ? { ...m, text: newText, isEdited: true } : m
    );
    const newMessages = { ...messages, [activeChatId]: updatedList };
    set({ messages: newMessages });
    localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
  },

  togglePinMessage: (messageId) => {
    const { activeChatId, messages } = get();
    if (!activeChatId || !messages[activeChatId]) return;

    const updatedList = messages[activeChatId].map(m =>
      m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
    );
    const newMessages = { ...messages, [activeChatId]: updatedList };
    set({ messages: newMessages });
    localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
  },

  togglePinConversation: (chatId) => {
    set((state) => {
      const updated = state.conversations.map(c =>
        c.id === chatId ? { ...c, isPinned: !c.isPinned } : c
      );
      localStorage.setItem(CONV_STORAGE, JSON.stringify(updated));
      return { conversations: updated };
    });
  },

  toggleMuteConversation: (chatId) => {
    set((state) => {
      const updated = state.conversations.map(c =>
        c.id === chatId ? { ...c, isMuted: !c.isMuted } : c
      );
      localStorage.setItem(CONV_STORAGE, JSON.stringify(updated));
      return { conversations: updated };
    });
  },

  forwardMessageTo: (targetChatId) => {
    const { forwardingMessage, messages, conversations } = get();
    if (!forwardingMessage || !targetChatId) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const forwardedMsg = {
      ...forwardingMessage,
      id: `msg_fwd_${Date.now()}`,
      conversationId: targetChatId,
      senderId: "user_me",
      timestamp: timeString,
      date: "Today",
      isForwarded: true,
      reactions: []
    };

    const targetList = messages[targetChatId] || [];
    const newMessages = { ...messages, [targetChatId]: [...targetList, forwardedMsg] };

    const updatedConvs = conversations.map(c => {
      if (c.id === targetChatId) {
        return {
          ...c,
          lastMessage: {
            id: forwardedMsg.id,
            senderId: "user_me",
            text: forwardedMsg.text,
            timestamp: timeString,
            status: "delivered",
            type: forwardedMsg.type
          }
        };
      }
      return c;
    });

    set({
      messages: newMessages,
      conversations: updatedConvs,
      forwardingMessage: null
    });
    localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
    localStorage.setItem(CONV_STORAGE, JSON.stringify(updatedConvs));
  }
}));
