# FRONTEND HANDOFF SPECIFICATION (PHASE 2 BACKEND INTEGRATION)

## 1. Overview & Current Mock Architecture
All frontend interactions in Phase 1 run client-side using **Zustand stores** with automatic fallback to structured mock datasets and `localStorage` persistence. The architecture is cleanly decoupled into UI components, Zustand state stores, and data services to enable drop-in replacement with REST or WebSocket APIs in Phase 2.

---

## 2. Planned Backend API Endpoints

### 2.1 Authentication & Profile (`/api/v1/auth`)
| Method | Endpoint | Description | Phase 1 Simulation |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Email/Phone + Password login | `authStore.login()` |
| `POST` | `/api/v1/auth/register` | User onboarding + avatar | `authStore.register()` |
| `POST` | `/api/v1/auth/verify-otp` | 6-digit SMS verification | `authStore.verifyOtp()` |
| `POST` | `/api/v1/auth/forgot-password` | Password reset link dispatch | `authStore.resetPassword()` |
| `GET` | `/api/v1/users/me` | Fetch active user profile | `authStore.user` |
| `PATCH` | `/api/v1/users/me` | Update bio, avatar, name | `authStore.updateProfile()` |

### 2.2 Messaging & WebSocket (`/api/v1/chats` + `ws://`)
| Method / Event | Endpoint / Event | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/conversations` | List user direct & group conversations |
| `GET` | `/api/v1/conversations/:id/messages` | Paginated message history (cursor-based) |
| `POST` | `/api/v1/conversations/:id/messages` | Send message (REST fallback) |
| `WS send` | `chat.send` | Real-time message dispatch |
| `WS receive` | `chat.message` | Real-time inbound message broadcast |
| `WS receive` | `chat.typing` | Typing indicator broadcast |
| `WS send` | `chat.reaction` | Add/remove emoji reaction |
| `PATCH` | `/api/v1/conversations/:id/pin` | Pin/unpin conversation |

### 2.3 Status Stories (`/api/v1/statuses`)
- `GET /api/v1/statuses/feed`| Aggregated active 24h stories from user contacts. |
- `POST /api/v1/statuses`: | Post text gradient or media story. |
- `POST /api/v1/statuses/:id/views`: Record viewer timestamp.

### 2.4 Channels & Subscriptions (`/api/v1/channels`)
- `GET /api/v1/channels`: Channel discovery by category (`Technology`, `Business`, etc.).
- `POST /api/v1/channels/:id/subscribe`: Follow or pay subscription.
- `POST /api/v1/channels/:id/posts`: Channel administrator broadcasts.

### 2.5 Business Commerce & Customer Inbox (`/api/v1/business`)
- `GET /api/v1/business/inbox`: Triage customer tickets (`Open`, `Pending`, `Resolved`).
- `PATCH /api/v1/business/inbox/:id`: Update ticket state and assignees.
- `GET /api/v1/business/catalog`: Fetch catalog products with prices in RWF.
- `POST /api/v1/business/catalog`: Create new SKU with photo upload.
- `GET /api/v1/business/analytics`: Return metrics (daily volumes, conversion channels).

### 2.6 Audio / Video Signaling (`/api/v1/calls`)
- In Phase 2, integrate WebRTC signaling via WebSockets (`offer`, `answer`, `ice-candidate`) with a TURN/STUN server.
- The UI in [ActiveCallModal.jsx](file:///d:/New%20Downloads/Chatting%20app/src/components/calls/ActiveCallModal.jsx) already provides state bindings for `isMuted`, `isCameraOff`, `durationSeconds`, and call termination.

---

## 3. Data Schema Specifications

### Message Object
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  text?: string;
  timestamp: string;
  date: string; // "Today", "Yesterday", "Oct 12"
  status: "sent" | "delivered" | "read";
  type: "text" | "image" | "audio" | "document";
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: string;
  caption?: string;
  isPinned?: boolean;
  isEdited?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  reactions?: Array<{
    emoji: string;
    count: number;
    users?: string[];
  }>;
}
```

### Product Catalog Item (RWF Currency)
```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: "RWF";
  stock: number;
  status: "in_stock" | "out_of_stock";
  image: string;
  description: string;
  salesCount: number;
}
```
