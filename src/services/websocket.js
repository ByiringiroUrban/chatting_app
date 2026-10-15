class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.userId = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(userId = "user_me") {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.userId = userId;
    const wsUrl = import.meta.env.VITE_WS_URL || `ws://localhost:8000/ws/${userId}`;

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

      this.ws.onclose = () => {
        console.log("[Muraho WS] Disconnected");
        this.emit("status", { connected: false });
        this.scheduleReconnect();
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
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => {
        if (this.userId) this.connect(this.userId);
      }, delay);
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
    clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new WebSocketService();
