export const mockBusinessProfile = {
  id: "biz_kigali_tech",
  name: "Kigali Tech Innovations & Artisans Ltd",
  logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=300&q=80",
  category: "Software & Local Artisan Commerce",
  description: "Bridging Rwandan handcrafted excellence and modern digital products. Serving domestic and international customers.",
  email: "support@kigalitech.rw",
  phone: "+250 788 456 789",
  website: "https://kigalitech.rw",
  location: "Norrsken House Kigali, 1 KN 78 St, Kiyovu",
  workingHours: "Monday – Friday: 08:00 AM – 06:00 PM CAT",
  socialLinks: {
    twitter: "@kigalitech_rw",
    instagram: "@kigalitechartisans",
    linkedin: "company/kigali-tech-innovations"
  },
  greetingMessage: "Muraho! Welcome to Kigali Tech Innovations & Artisans. How can we help you today?",
  greetingEnabled: true,
  awayMessage: "Muraho! We are currently away from the desk. Our team will get back to you promptly at 8:00 AM.",
  awayEnabled: true,
  quickReplies: [
    { id: "qr_1", shortcut: "/pricing", title: "Product Pricing", text: "You can view our complete product catalog and real-time prices right here in the chat menu or at kigalitech.rw/catalog." },
    { id: "qr_2", shortcut: "/delivery", title: "Delivery Info", text: "We offer same-day express delivery in Kigali (2,000 RWF) and 24h delivery across all provinces in Rwanda (4,000 RWF)." },
    { id: "qr_3", shortcut: "/momo", title: "MoMo Pay Code", text: "To pay via MTN Mobile Money, dial *182*8*1*123456# (Kigali Tech Ltd). Thank you!" },
    { id: "qr_4", shortcut: "/hours", title: "Working Hours", text: "Our showroom and support desk are open Monday through Friday from 8:00 AM to 6:00 PM CAT." }
  ],
  aiSupport: {
    enabled: true,
    confidenceThreshold: 0.85,
    autoHandoffToHuman: true,
    faqs: [
      {
        id: "faq_1",
        question: "What payment methods do you accept?",
        answer: "We accept MTN Mobile Money, Airtel Money, Bank Transfer (Bank of Kigali, I&M Bank), and international Visa/Mastercard."
      },
      {
        id: "faq_2",
        question: "How long does shipping take within Rwanda?",
        answer: "Within Kigali, orders placed before 3:00 PM are delivered same-day. Upcountry deliveries arrive within 24 hours."
      },
      {
        id: "faq_3",
        question: "Can I customize the Agaseke baskets or leather goods?",
        answer: "Yes! Custom colors, dimensions, and corporate branded embossing are available for orders over 10 pieces."
      },
      {
        id: "faq_4",
        question: "How do I get a custom software MVP quote?",
        answer: "Our software sprint starts at 650,000 RWF. Send us your requirements document or schedule a 15-minute call with Jean-Luc."
      }
    ]
  }
};

export const mockCustomerInbox = [
  {
    id: "cust_1",
    customerName: "Aline Uwase",
    customerPhone: "+250 788 112 233",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    status: "Open", // Open, Pending, Resolved
    label: "VIP Client",
    assignedTo: "Jean-Luc Mugisha",
    lastMessage: "I need to confirm shipping details for the 50 Agaseke baskets.",
    timestamp: "10:42 AM",
    notes: "High-value corporate gift order. Prefers delivery to Norrsken House."
  },
  {
    id: "cust_2",
    customerName: "David Nkurunziza",
    customerPhone: "+250 783 445 566",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    status: "Pending",
    label: "Payment Review",
    assignedTo: "Jean-Luc Mugisha",
    lastMessage: "MoMo transaction reference submitted #MTN-984210.",
    timestamp: "Yesterday",
    notes: "Waiting for finance team confirmation on bulk Arabica coffee order."
  },
  {
    id: "cust_3",
    customerName: "Diane Mutoni",
    customerPhone: "+250 789 778 899",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80",
    status: "Resolved",
    label: "Partner",
    assignedTo: "Sonia Keza",
    lastMessage: "Coffee export certificate received. Thank you!",
    timestamp: "Oct 12",
    notes: "Regular partner cooperative. Reorder cycle every 4 weeks."
  },
  {
    id: "cust_4",
    customerName: "Emmanuel Bizimana",
    customerPhone: "+250 788 333 444",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    status: "Open",
    label: "New Lead",
    assignedTo: "Unassigned",
    lastMessage: "Hello, do you have discounts for 100+ units of the leather MacBook sleeves?",
    timestamp: "Oct 11",
    notes: "Inquiring on corporate branding for an upcoming tech conference."
  }
];

export const mockBusinessAnalytics = {
  overview: {
    totalMessages: 4892,
    activeConversations: 184,
    newCustomers: 76,
    resolvedConversations: 168,
    responseRate: 98.6, // percentage
    averageResponseTime: "4.2 min",
    customerSatisfaction: 4.9, // out of 5
  },
  dailyActivity: [
    { day: "Mon", messages: 540, customers: 32, resolved: 28 },
    { day: "Tue", messages: 680, customers: 44, resolved: 41 },
    { day: "Wed", messages: 820, customers: 58, resolved: 52 },
    { day: "Thu", messages: 740, customers: 49, resolved: 46 },
    { day: "Fri", messages: 950, customers: 67, resolved: 63 },
    { day: "Sat", messages: 430, customers: 28, resolved: 25 },
    { day: "Sun", messages: 290, customers: 18, resolved: 17 }
  ],
  hourlyDistribution: [
    { hour: "08:00", volume: 45 },
    { hour: "10:00", volume: 110 },
    { hour: "12:00", volume: 95 },
    { hour: "14:00", volume: 140 },
    { hour: "16:00", volume: 165 },
    { hour: "18:00", volume: 80 },
    { hour: "20:00", volume: 30 }
  ],
  channelConversion: [
    { name: "Direct Chat", value: 45 },
    { name: "Catalog Click", value: 30 },
    { name: "Channel Link", value: 15 },
    { name: "AI Auto-Response", value: 10 }
  ]
};
