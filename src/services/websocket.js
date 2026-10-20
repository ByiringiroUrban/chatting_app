class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.userId = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 50; // Allow many more reconnection attempts
    this.isIntentionalClose = false;
  }

  connect(userId = "user_me") {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const token = localStorage.getItem("muraho_access_token") || "";
    this.userId = userId;
    this.isIntentionalClose = false;
    const wsBase = import.meta.env.VITE_WS_URL || `ws://localhost:8000/ws`;
    const wsUrl = `${wsBase.replace(/\/ws\/?$/, '')}/ws/${userId}?token=${encodeURIComponent(token)}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log(`[Muraho WS] Connected as ${userId}`);
        this.reconnectAttempts = 0;
        this.emit("status", { connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event) {
            this.emit(parsed.event, parsed.data);
          }
        } catch (err) {
          console.error("[Muraho WS] Parse error:", err);
        }
      };

      this.ws.onclose = (event) => {
        console.log("[Muraho WS] Disconnected", event.code);
        this.emit("status", { connected: false });
        if (!this.isIntentionalClose) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        console.warn("[Muraho WS] Connection notice:", err.message || "Offline / Reconnecting");
      };
    } catch (e) {
      console.warn("[Muraho WS] Failed to initialize socket connection:", e);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`[Muraho WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => {
        if (this.userId && !this.isIntentionalClose) this.connect(this.userId);
      }, delay);
    } else {
      console.warn("[Muraho WS] Max reconnection attempts reached. Connection lost.");
      this.emit("status", { connected: false, maxRetriesReached: true });
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[Muraho WS] Error in listener for ${event}:`, err);
        }
      });
    }
  }

  send(event, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  sendTyping(conversationId, isTyping = true) {
    this.send("chat.typing", { conversationId, isTyping });
  }

  joinConversation(conversationId) {
    this.send("room.join", { conversationId });
  }

  leaveConversation(conversationId) {
    this.send("room.leave", { conversationId });
  }

  sendCallSignal(targetUserId, signalType, payload) {
    this.send(signalType, { targetUserId, ...payload });
  }

  disconnect() {
    this.isIntentionalClose = true;
    clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
