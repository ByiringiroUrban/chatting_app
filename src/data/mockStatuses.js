export const initialStatuses = [
  {
    id: "status_me",
    userId: "user_me",
    userName: "My Status",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    isMe: true,
    hasUnseen: false,
    timestamp: "32m ago",
    items: [
      {
        id: "item_me_1",
        type: "image",
        mediaUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
        caption: "Demo day rehearsal at Norrsken Kigali! Excited to reveal our roadmap. 🚀🇷🇼",
        timestamp: "32 minutes ago",
        views: 48,
        viewers: ["Aline Uwase", "David Nkurunziza", "Diane Mutoni", "Patrick Habimana", "Eric Manzi"]
      }
    ]
  },
  {
    id: "status_1",
    userId: "user_1",
    userName: "Aline Uwase",
    userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    isMe: false,
    hasUnseen: true,
    timestamp: "12m ago",
    items: [
      {
        id: "item_1_1",
        type: "text",
        backgroundColor: "from-teal-600 to-emerald-800",
        text: "“Design is not just what it looks like and feels like. Design is how it works.” — Steve Jobs ✨",
        timestamp: "12 minutes ago",
        views: 29
      },
      {
        id: "item_1_2",
        type: "image",
        mediaUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        caption: "Testing color contrast ratios on high-res displays 🖥️",
        timestamp: "8 minutes ago",
        views: 18
      }
    ]
  },
  {
    id: "status_2",
    userId: "user_2",
    userName: "David Nkurunziza",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    isMe: false,
    hasUnseen: true,
    timestamp: "1 hour ago",
    items: [
      {
        id: "item_2_1",
        type: "text",
        backgroundColor: "from-blue-600 to-indigo-900",
        text: "Fintech sandbox approval granted by the Central Bank! Big step forward for contactless payments in Rwanda. 💳🎉",
        timestamp: "1 hour ago",
        views: 64
      }
    ]
  },
  {
    id: "status_3",
    userId: "user_3",
    userName: "Diane Mutoni",
    userAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80",
    isMe: false,
    hasUnseen: false, // already viewed
    timestamp: "4 hours ago",
    items: [
      {
        id: "item_3_1",
        type: "image",
        mediaUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80",
        caption: "Fresh harvest from our coffee cooperative in Huye! Smells heavenly ☕🌿",
        timestamp: "4 hours ago",
        views: 92
      }
    ]
  },
  {
    id: "status_5",
    userId: "user_5",
    userName: "Sonia Keza",
    userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    isMe: false,
    hasUnseen: false, // already viewed
    timestamp: "6 hours ago",
    items: [
      {
        id: "item_5_1",
        type: "text",
        backgroundColor: "from-rose-600 to-purple-800",
        text: "Kigali Tech Summit tickets are now on 50% early-bird discount! Don't miss out 🔥",
        timestamp: "6 hours ago",
        views: 110
      }
    ]
  }
];
