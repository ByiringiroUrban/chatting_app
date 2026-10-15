const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("muraho_access_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // If backend is unreachable or returns error, log informative warning
    console.warn(`[Muraho API] Request to ${endpoint} failed:`, error.message);
    throw error;
  }
}

export const authApi = {
  login: (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  verifyOtp: (otpCode) => request("/auth/verify-otp", { method: "POST", body: JSON.stringify({ otpCode }) }),
  getMe: () => request("/users/me"),
  updateMe: (data) => request("/users/me", { method: "PATCH", body: JSON.stringify(data) }),
  getContacts: () => request("/users/contacts")
};

export const chatApi = {
  getConversations: () => request("/conversations"),
  getMessages: (conversationId) => request(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, messageData) =>
    request(`/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify(messageData) }),
  togglePinConversation: (conversationId) =>
    request(`/conversations/${conversationId}/pin`, { method: "PATCH" }),
  toggleMuteConversation: (conversationId) =>
    request(`/conversations/${conversationId}/mute`, { method: "PATCH" }),
  markAsRead: (conversationId) =>
    request(`/conversations/${conversationId}/read`, { method: "PATCH" }),
  editMessage: (messageId, text) =>
    request(`/messages/${messageId}`, { method: "PATCH", body: JSON.stringify({ text }) }),
  deleteMessage: (messageId) =>
    request(`/messages/${messageId}`, { method: "DELETE" }),
  toggleReaction: (messageId, emoji) =>
    request(`/messages/${messageId}/reaction`, { method: "POST", body: JSON.stringify({ emoji }) }),
  togglePinMessage: (messageId) =>
    request(`/messages/${messageId}/pin`, { method: "PATCH" }),
  forwardMessage: (messageId, targetChatId) =>
    request(`/messages/${messageId}/forward`, { method: "POST", body: JSON.stringify({ targetChatId }) })
};

export const groupApi = {
  getGroups: () => request("/groups"),
  getGroup: (id) => request(`/groups/${id}`),
  createGroup: (groupData) => request("/groups", { method: "POST", body: JSON.stringify(groupData) }),
  addMember: (groupId, userId) => request(`/groups/${groupId}/members?user_id=${userId}`, { method: "POST" }),
  removeMember: (groupId, userId) => request(`/groups/${groupId}/members/${userId}`, { method: "DELETE" })
};

export const statusApi = {
  getFeed: () => request("/statuses/feed"),
  createStatus: (items) => request("/statuses", { method: "POST", body: JSON.stringify({ items }) }),
  recordView: (storyId) => request(`/statuses/${storyId}/views`, { method: "POST" })
};

export const channelApi = {
  getChannels: (category) => request(`/channels${category ? `?category=${category}` : ""}`),
  getChannel: (id) => request(`/channels/${id}`),
  subscribeChannel: (id) => request(`/channels/${id}/subscribe`, { method: "POST" }),
  createPost: (id, postData) => request(`/channels/${id}/posts`, { method: "POST", body: JSON.stringify(postData) })
};

export const businessApi = {
  getProfile: () => request("/business/profile"),
  updateProfile: (updates) => request("/business/profile", { method: "PATCH", body: JSON.stringify(updates) }),
  getCatalog: () => request("/business/catalog"),
  createProduct: (data) => request("/business/catalog", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/business/catalog/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/business/catalog/${id}`, { method: "DELETE" }),
  getInbox: (status) => request(`/business/inbox${status ? `?status_filter=${status}` : ""}`),
  updateTicket: (id, updates) => request(`/business/inbox/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),
  getAnalytics: () => request("/business/analytics"),
  testAiSupport: (question) => request("/business/ai-support/test", { method: "POST", body: JSON.stringify({ question }) })
};

export const callApi = {
  getHistory: () => request("/calls/history"),
  logCall: (callData) => request("/calls/log", { method: "POST", body: JSON.stringify(callData) })
};

export const subscriptionApi = {
  getPlans: () => request("/subscriptions/plans"),
  checkout: (checkoutData) => request("/subscriptions/checkout", { method: "POST", body: JSON.stringify(checkoutData) }),
  getHistory: () => request("/subscriptions/history")
};

export const uploadApi = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("muraho_access_token");
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    if (!res.ok) throw new Error("File upload failed");
    return await res.json();
  }
};
