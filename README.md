# Muraho — Modern Messaging & Rwandan Business Platform (Frontend)

Muraho is a modern, high-performance messaging web application inspired by WhatsApp Web, Telegram, and enterprise communication suites. It provides free messaging for individuals and a business suite with a customer inbox, product catalog, AI customer support, analytics, and advertising management.

---

## 🚀 Key Features

### 1. Modern 3-Panel Messaging Interface
- **Sidebar**: Conversation filtering (`All`, `Unread`, `Groups`, `Favorites`), search bar, pinned/muted badges, unread badges, typing indicators.
- **Chat Window**: Rich conversation header, voice note recorder with simulated audio waveform playback, photo & document attachments, emoji reactions, message replies, forwarding, editing, message pinning, and simulated reply triggers.
- **Responsive Mobile Layout**: Single-column view on mobile screens with bottom navigation and back navigation.

### 2. Group Messaging
- Dedicated Rwandan communities: **Software Developers Rwanda**, **AI & Machine Learning Rwanda**, **Business Community Kigali**, **University Students**, **Startup Founders**.
- Create group modal with multi-member selector.
- Group participants drawer with admin badges and remove/leave actions.

### 3. Status Stories
- 24-hour disappearing stories with gradient text cards and photo uploads.
- Full-screen status viewer with automatic progress bars, pause/resume, previous/next navigation, and view counts.

### 4. Public & Premium Paid Channels
- Discover official channels (Rwanda Tech Community, AI News, Business Opportunities, Education).
- Paid subscription channels with locked content previews and simulated MTN Mobile Money (`*182#`) checkout.

### 5. HD Voice & Video Calling (Simulation)
- Incoming and outgoing call screen overlay with ring animations.
- Active call duration timer, microphone toggle, camera toggle, speaker toggle, and call termination.
- Call history log with missed, incoming, and outgoing call filters.

### 6. Full Business Suite
- **Business Dashboard**: Overview metrics (Total messages, response rates, average response time) with interactive Recharts area and bar charts.
- **Customer Inbox**: Triage customer requests across `Open`, `Pending`, and `Resolved` states with internal team notes.
- **Product Catalog**: Add, edit, and delete products with prices in Rwandan Francs (RWF). Share products directly into chats.
- **AI Customer Support**: Knowledge base FAQ management, confidence threshold toggles, and live testing simulator.
- **Advertising Manager**: Target audiences in Rwanda with RWF budgets, creative uploads, and impression/click analytics.

### 7. Monetization & Subscriptions
- **Personal** (Free), **Premium** (3,000 RWF/mo), **Business Starter** (15,000 RWF/mo), and **Business AI** (30,000 RWF/mo).
- Monthly and annual billing toggle with 20% discount.
- Mock checkout modal and downloadable billing history.

### 8. Localization & Theme
- **Themes**: Instant light, dark, and system theme switching.
- **Languages**: English, Ikinyarwanda, and Français.

---

## 🛠️ Tech Stack

- **Framework**: React.js 19 with Vite
- **Language**: JavaScript (JSX)
- **Styling**: Tailwind CSS with custom brand palette (`#0F766E` Primary Teal)
- **Icons**: Lucide React
- **State Management**: Zustand with selective `localStorage` persistence
- **Charts & Dashboards**: Recharts
- **Routing**: React Router DOM (v7)

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
Preview the production build:
```bash
npm run preview
```
