import { create } from 'zustand';
import { initialConversations } from '../data/mockConversations';
import { initialMessages } from '../data/mockMessages';
import { chatApi } from '../services/api';
import { wsService } from '../services/websocket';

const getConvStorageKey = () => {
  try {
    const u = JSON.parse(localStorage.getItem('muraho_auth_user'));
    return u?.id ? `muraho_convs_${u.id}` : 'muraho_convs_guest';
  } catch (e) {
    return 'muraho_convs_guest';
  }
};

const getMsgStorageKey = () => {
  try {
    const u = JSON.parse(localStorage.getItem('muraho_auth_user'));
    return u?.id ? `muraho_msgs_${u.id}` : 'muraho_msgs_guest';
  } catch (e) {
    return 'muraho_msgs_guest';
  }
};

export const useChatStore = create((set, get) => ({
  conversations: [],
  messages: {},
  activeChatId: null,
  filter: "all", // 'all' | 'unread' | 'groups' | 'favorites'
  searchQuery: "",
  replyingTo: null,
  forwardingMessage: null,
  isRecordingVoice: false,
  isSearchingChat: false,
  isContactInfoOpen: false,
  failedMessages: {}, // { [tempId]: messagePayload } for retry
  onlineUsers: {}, // { [userId]: { status, lastSeen } }

  resetChatState: () => {
    // Clear user cached items
    localStorage.removeItem(getConvStorageKey());
    localStorage.removeItem(getMsgStorageKey());
    localStorage.removeItem('muraho_conversations');
    localStorage.removeItem('muraho_messages');
    set({
      conversations: [],
      messages: {},
      activeChatId: null,
      replyingTo: null,
      forwardingMessage: null,
      isRecordingVoice: false,
      isSearchingChat: false,
      isContactInfoOpen: false,
      searchQuery: ""
    });
  },

  setActiveChatId: (chatId) => {
    const currentId = get().activeChatId;
    if (currentId && currentId !== chatId) {
      wsService.leaveConversation(currentId);
    }
    if (chatId) {
      wsService.joinConversation(chatId);
      // Send read receipts via WebSocket
      wsService.send("chat.read", { conversationId: chatId });
      chatApi.markAsRead(chatId).catch(() => {});
      get().fetchMessages(chatId);
    }
    set((state) => {
      // Mark unread as 0 when opening chat
      const updatedConvs = state.conversations.map((c) =>
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      );
      localStorage.setItem(getConvStorageKey(), JSON.stringify(updatedConvs));
      return { activeChatId: chatId, conversations: updatedConvs, replyingTo: null };
    });
  },

  fetchConversations: async () => {
    try {
      const convs = await chatApi.getConversations();
      if (Array.isArray(convs)) {
        // Merge online status from our tracked state
        const { onlineUsers } = get();
        const merged = convs.map(c => ({
          ...c,
          status: onlineUsers[c.participantId]?.status || c.status,
          lastSeen: onlineUsers[c.participantId]?.lastSeen || c.lastSeen,
        }));
        set({ conversations: merged });
        localStorage.setItem(getConvStorageKey(), JSON.stringify(merged));
      }
    } catch (e) {
      // Graceful fallback to cached state
    }
  },

  fetchMessages: async (chatId) => {
    if (!chatId) return;
    try {
      const msgs = await chatApi.getMessages(chatId);
      if (msgs && Array.isArray(msgs)) {
        set((state) => {
          const newMessages = { ...state.messages, [chatId]: msgs };
          localStorage.setItem(getMsgStorageKey(), JSON.stringify(newMessages));
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

      // If user is viewing this chat, send read receipt
      if (chatId === activeChatId) {
        wsService.send("chat.read", { conversationId: chatId });
        chatApi.markAsRead(chatId).catch(() => {});
      }

      localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
      localStorage.setItem(CONV_STORAGE, JSON.stringify(updatedConvs));
      return { messages: newMessages, conversations: updatedConvs };
    });
  },

  setInboundTyping: ({ conversationId, isTyping, userId }) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, isTyping, typingUser: userId } : c
      )
    }));
  },

  setInboundReaction: ({ messageId, reactions }) => {
    // Update reactions across all conversations where message might exist
    set((state) => {
      const newMessages = { ...state.messages };
      for (const chatId of Object.keys(newMessages)) {
        const cur = newMessages[chatId] || [];
        const idx = cur.findIndex(m => m.id === messageId);
        if (idx !== -1) {
          newMessages[chatId] = cur.map((m) => (m.id === messageId ? { ...m, reactions } : m));
          break;
        }
      }
      localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
      return { messages: newMessages };
    });
  },

  updateMessageStatus: ({ messageId, conversationId, status }) => {
    set((state) => {
      const chatId = conversationId;
      if (!chatId || !state.messages[chatId]) return state;
      const updatedList = state.messages[chatId].map(m =>
        m.id === messageId ? { ...m, status } : m
      );
      const newMessages = { ...state.messages, [chatId]: updatedList };

      // Also update lastMessage status in conversations
      const updatedConvs = state.conversations.map(c => {
        if (c.id === chatId && c.lastMessage?.id === messageId) {
          return { ...c, lastMessage: { ...c.lastMessage, status } };
        }
        return c;
      });

      localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
      localStorage.setItem(CONV_STORAGE, JSON.stringify(updatedConvs));
      return { messages: newMessages, conversations: updatedConvs };
    });
  },

  updateUserPresence: ({ userId, status, lastSeen }) => {
    set((state) => {
      const onlineUsers = { ...state.onlineUsers, [userId]: { status, lastSeen } };
      const updatedConvs = state.conversations.map(c => {
        if (c.participantId === userId) {
          return { ...c, status, lastSeen };
        }
        return c;
      });
      localStorage.setItem(CONV_STORAGE, JSON.stringify(updatedConvs));
      return { onlineUsers, conversations: updatedConvs };
    });
  },

  handleInboundMessageEdited: (msg) => {
    const chatId = msg.conversationId;
    if (!chatId) return;
    set((state) => {
      const cur = state.messages[chatId] || [];
      const updated = cur.map(m => m.id === msg.id ? { ...m, ...msg } : m);
      const newMessages = { ...state.messages, [chatId]: updated };
      localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
      return { messages: newMessages };
    });
  },

  handleInboundMessageDeleted: ({ messageId, conversationId }) => {
    if (!conversationId) return;
    set((state) => {
      const cur = state.messages[conversationId] || [];
      const updated = cur.filter(m => m.id !== messageId);
      const newMessages = { ...state.messages, [conversationId]: updated };
      localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
      return { messages: newMessages };
    });
  },

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setReplyingTo: (message) => set({ replyingTo: message }),
  clearReplyingTo: () => set({ replyingTo: null }),
  setForwardingMessage: (message) => set({ forwardingMessage: message }),
  toggleSearchingChat: () => set((s) => ({ isSearchingChat: !s.isSearchingChat })),
  toggleContactInfo: () => set((s) => ({ isContactInfoOpen: !s.isContactInfoOpen })),

  sendMessage: async ({ text, type = 'text', mediaUrl = null, fileName = null, fileSize = null, duration = null, caption = null }) => {
    const { activeChatId, replyingTo, conversations, messages } = get();
    if (!activeChatId) return;

    const conv = conversations.find(c => c.id === activeChatId);
    if (!conv) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tempId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Resolve sender ID from auth store
    let senderId = "user_me";
    try {
      const authUser = JSON.parse(localStorage.getItem('muraho_auth_user'));
      if (authUser?.id) senderId = authUser.id;
    } catch (e) {}

    const newMsg = {
      id: tempId,
      conversationId: activeChatId,
      senderId,
      text: text || caption || (type === 'audio' ? `Voice note (${duration || '0:15'})` : fileName || ''),
      timestamp: timeString,
      date: "Today",
      status: "sending",
      type,
      mediaUrl,
      fileName,
      fileSize,
      duration,
      caption,
      reactions: [],
      replyTo: replyingTo ? {
        id: replyingTo.id,
        senderName: replyingTo.senderName || (replyingTo.senderId === senderId ? 'You' : conv.name),
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
            senderId,
            text: newMsg.text,
            timestamp: timeString,
            status: "sending",
            type: newMsg.type,
          }
        };
      }
      return c;
    });

    // Optimistic update
    set({
      messages: newMessages,
      conversations: updatedConvs,
      replyingTo: null
    });
    localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
    localStorage.setItem(CONV_STORAGE, JSON.stringify(updatedConvs));

    // Send to backend
    try {
      const backendMsg = await chatApi.sendMessage(activeChatId, {
        text: newMsg.text,
        type: newMsg.type,
        mediaUrl: newMsg.mediaUrl,
        fileName: newMsg.fileName,
        fileSize: newMsg.fileSize,
        duration: newMsg.duration,
        caption: newMsg.caption,
        replyTo: newMsg.replyTo
      });

      // Replace temp message with backend response (real ID, real timestamp)
      set((state) => {
        const chatMsgs = state.messages[activeChatId] || [];
        const replaced = chatMsgs.map(m =>
          m.id === tempId ? { ...backendMsg, status: backendMsg.status || 'sent' } : m
        );
        const newMsgs = { ...state.messages, [activeChatId]: replaced };

        const convs = state.conversations.map(c => {
          if (c.id === activeChatId && c.lastMessage?.id === tempId) {
            return { ...c, lastMessage: { ...c.lastMessage, id: backendMsg.id, status: 'sent' } };
          }
          return c;
        });

        // Remove from failed if it was there
        const failed = { ...state.failedMessages };
        delete failed[tempId];

        localStorage.setItem(MSG_STORAGE, JSON.stringify(newMsgs));
        localStorage.setItem(CONV_STORAGE, JSON.stringify(convs));
        return { messages: newMsgs, conversations: convs, failedMessages: failed };
      });
    } catch (error) {
      // Mark message as failed
      set((state) => {
        const chatMsgs = state.messages[activeChatId] || [];
        const updated = chatMsgs.map(m =>
          m.id === tempId ? { ...m, status: 'failed' } : m
        );
        const newMsgs = { ...state.messages, [activeChatId]: updated };
        const failed = {
          ...state.failedMessages,
          [tempId]: { text, type, mediaUrl, fileName, fileSize, duration, caption, replyTo: newMsg.replyTo, activeChatId }
        };
        localStorage.setItem(MSG_STORAGE, JSON.stringify(newMsgs));
        return { messages: newMsgs, failedMessages: failed };
      });
    }
  },

  retryMessage: async (tempId) => {
    const { failedMessages, messages, activeChatId } = get();
    const payload = failedMessages[tempId];
    if (!payload) return;

    const chatId = payload.activeChatId;

    // Mark as sending again
    set((state) => {
      const chatMsgs = state.messages[chatId] || [];
      const updated = chatMsgs.map(m =>
        m.id === tempId ? { ...m, status: 'sending' } : m
      );
      return { messages: { ...state.messages, [chatId]: updated } };
    });

    try {
      const backendMsg = await chatApi.sendMessage(chatId, {
        text: payload.text,
        type: payload.type,
        mediaUrl: payload.mediaUrl,
        fileName: payload.fileName,
        fileSize: payload.fileSize,
        duration: payload.duration,
        caption: payload.caption,
        replyTo: payload.replyTo
      });

      set((state) => {
        const chatMsgs = state.messages[chatId] || [];
        const replaced = chatMsgs.map(m =>
          m.id === tempId ? { ...backendMsg, status: backendMsg.status || 'sent' } : m
        );
        const newMsgs = { ...state.messages, [chatId]: replaced };
        const failed = { ...state.failedMessages };
        delete failed[tempId];
        localStorage.setItem(MSG_STORAGE, JSON.stringify(newMsgs));
        return { messages: newMsgs, failedMessages: failed };
      });
    } catch (e) {
      set((state) => {
        const chatMsgs = state.messages[chatId] || [];
        const updated = chatMsgs.map(m =>
          m.id === tempId ? { ...m, status: 'failed' } : m
        );
        return { messages: { ...state.messages, [chatId]: updated } };
      });
    }
  },

  addReaction: async (messageId, emoji) => {
    const { activeChatId, messages } = get();
    if (!activeChatId || !messages[activeChatId]) return;

    // Optimistic update
    const updatedList = messages[activeChatId].map((m) => {
      if (m.id === messageId) {
        const reactions = m.reactions ? [...m.reactions] : [];
        let senderId = "user_me";
        try {
          const authUser = JSON.parse(localStorage.getItem('muraho_auth_user'));
          if (authUser?.id) senderId = authUser.id;
        } catch (e) {}

        const existing = reactions.find(r => r.emoji === emoji);
        if (existing) {
          if (existing.users.includes(senderId)) {
            existing.users = existing.users.filter(u => u !== senderId);
            existing.count -= 1;
          } else {
            existing.users.push(senderId);
            existing.count += 1;
          }
        } else {
          reactions.push({ emoji, count: 1, users: [senderId] });
        }
        return { ...m, reactions: reactions.filter(r => r.count > 0) };
      }
      return m;
    });

    const newMessages = { ...messages, [activeChatId]: updatedList };
    set({ messages: newMessages });
    localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));

    // Call backend
    try {
      await chatApi.toggleReaction(messageId, emoji);
    } catch (e) {
      console.warn("[Muraho] Reaction API failed:", e.message);
    }
  },

  deleteMessage: async (messageId) => {
    const { activeChatId, messages } = get();
    if (!activeChatId || !messages[activeChatId]) return;

    // Optimistic update
    const updatedList = messages[activeChatId].filter(m => m.id !== messageId);
    const newMessages = { ...messages, [activeChatId]: updatedList };
    set({ messages: newMessages });
    localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));

    // Call backend
    try {
      await chatApi.deleteMessage(messageId);
    } catch (e) {
      console.warn("[Muraho] Delete API failed:", e.message);
      // Re-fetch messages to restore consistency
      get().fetchMessages(activeChatId);
    }
  },

  editMessage: async (messageId, newText) => {
    const { activeChatId, messages } = get();
    if (!activeChatId || !messages[activeChatId]) return;

    // Optimistic update
    const updatedList = messages[activeChatId].map(m =>
      m.id === messageId ? { ...m, text: newText, isEdited: true } : m
    );
    const newMessages = { ...messages, [activeChatId]: updatedList };
    set({ messages: newMessages });
    localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));

    // Call backend
    try {
      await chatApi.editMessage(messageId, newText);
    } catch (e) {
      console.warn("[Muraho] Edit API failed:", e.message);
      get().fetchMessages(activeChatId);
    }
  },

  togglePinMessage: async (messageId) => {
    const { activeChatId, messages } = get();
    if (!activeChatId || !messages[activeChatId]) return;

    const updatedList = messages[activeChatId].map(m =>
      m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
    );
    const newMessages = { ...messages, [activeChatId]: updatedList };
    set({ messages: newMessages });
    localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));

    try {
      await chatApi.togglePinMessage(messageId);
    } catch (e) {
      console.warn("[Muraho] Pin message API failed:", e.message);
    }
  },

  togglePinConversation: async (chatId) => {
    set((state) => {
      const updated = state.conversations.map(c =>
        c.id === chatId ? { ...c, isPinned: !c.isPinned } : c
      );
      localStorage.setItem(CONV_STORAGE, JSON.stringify(updated));
      return { conversations: updated };
    });

    try {
      await chatApi.togglePinConversation(chatId);
    } catch (e) {
      console.warn("[Muraho] Pin conversation API failed:", e.message);
    }
  },

  toggleMuteConversation: async (chatId) => {
    set((state) => {
      const updated = state.conversations.map(c =>
        c.id === chatId ? { ...c, isMuted: !c.isMuted } : c
      );
      localStorage.setItem(CONV_STORAGE, JSON.stringify(updated));
      return { conversations: updated };
    });

    try {
      await chatApi.toggleMuteConversation(chatId);
    } catch (e) {
      console.warn("[Muraho] Mute conversation API failed:", e.message);
    }
  },

  forwardMessageTo: async (targetChatId) => {
    const { forwardingMessage, messages, conversations } = get();
    if (!forwardingMessage || !targetChatId) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Call backend to forward
    try {
      const backendMsg = await chatApi.forwardMessage(forwardingMessage.id, targetChatId);

      const targetList = messages[targetChatId] || [];
      const newMessages = { ...messages, [targetChatId]: [...targetList, backendMsg] };

      const updatedConvs = conversations.map(c => {
        if (c.id === targetChatId) {
          return {
            ...c,
            lastMessage: {
              id: backendMsg.id,
              senderId: backendMsg.senderId,
              text: backendMsg.text,
              timestamp: backendMsg.timestamp,
              status: "delivered",
              type: backendMsg.type
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
    } catch (e) {
      console.warn("[Muraho] Forward API failed:", e.message);
      // Fallback: local only forward
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

      set({
        messages: newMessages,
        forwardingMessage: null
      });
      localStorage.setItem(MSG_STORAGE, JSON.stringify(newMessages));
    }
  },

  // Re-sync messages after reconnection to catch any missed during disconnect
  resyncAfterReconnect: async () => {
    const { activeChatId } = get();
    await get().fetchConversations();
    if (activeChatId) {
      await get().fetchMessages(activeChatId);
    }
  },

  startDirectConversation: async (contact) => {
    const { conversations, setActiveChatId, fetchConversations } = get();
    // Check if conversation already exists in state
    const existing = conversations.find(
      c => c.type === 'direct' && (c.participantId === contact.id || c.participantId === contact.contactId)
    );
    if (existing) {
      setActiveChatId(existing.id);
      return existing.id;
    }

    try {
      const created = await chatApi.createConversation({
        type: 'direct',
        participantId: contact.id || contact.contactId,
        name: contact.name,
        avatar: contact.avatar || null,
        tags: ["Personal"]
      });
      if (created) {
        await fetchConversations();
        setActiveChatId(created.id);
        return created.id;
      }
    } catch (e) {
      console.error("[Muraho] Failed to start direct conversation:", e);
    }
  }
}));
