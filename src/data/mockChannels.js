export const mockChannels = [
  {
    id: "channel_1",
    name: "Rwanda Tech Community",
    handle: "@rwanda_tech",
    avatar: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&q=80",
    category: "Technology",
    description: "Official channel for Rwanda's engineering ecosystem. Hackathons, tech job openings, developer events, and local innovations.",
    subscribers: 14250,
    isSubscribed: true,
    isVerified: true,
    isPremium: false,
    posts: [
      {
        id: "post_1_1",
        title: "Kigali Global Tech Hub Expo 2024 Registration Open",
        content: "Join over 2,500 software engineers, researchers, and venture capitalists at the BK Arena for three days of keynotes, hackathons, and product launches.",
        mediaUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        timestamp: "2 hours ago",
        views: "4.8K",
        reactions: [
          { emoji: "🔥", count: 142 },
          { emoji: "🚀", count: 89 },
          { emoji: "❤️", count: 56 }
        ]
      },
      {
        id: "post_1_2",
        title: "Fiber Optic Expansion across Secondary Cities",
        content: "High-speed broadband network upgrades completed in Rubavu, Musanze, and Huye, boosting connectivity for tech entrepreneurs outside Kigali.",
        timestamp: "Yesterday",
        views: "6.2K",
        reactions: [
          { emoji: "👏", count: 210 },
          { emoji: "🇷🇼", count: 320 }
        ]
      }
    ]
  },
  {
    id: "channel_2",
    name: "AI & Future Intelligence News",
    handle: "@ainews_rw",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    category: "AI & Innovation",
    description: "Breaking artificial intelligence research, machine learning tooling, open models, and frontier computing benchmarks.",
    subscribers: 8920,
    isSubscribed: true,
    isVerified: true,
    isPremium: false,
    posts: [
      {
        id: "post_2_1",
        title: "Multilingual LLM trained on 15 African languages open-sourced",
        content: "Researchers have published new checkpoints with state-of-the-art tokenization efficiency for Kinyarwanda, Swahili, and Luganda.",
        timestamp: "5 hours ago",
        views: "3.1K",
        reactions: [
          { emoji: "🧠", count: 98 },
          { emoji: "🎉", count: 114 }
        ]
      }
    ]
  },
  {
    id: "channel_3",
    name: "Business Opportunities & Tenders Rwanda",
    handle: "@biz_opportunities",
    avatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80",
    category: "Business",
    description: "Verified public tenders, private procurement opportunities, supplier partnerships, and SME grants across Rwanda.",
    subscribers: 22100,
    isSubscribed: false,
    isVerified: true,
    isPremium: true,
    priceMonthly: 5000, // 5,000 RWF / month
    posts: [
      {
        id: "post_3_1",
        title: "Ministry of ICT Digital Infrastructure Procurement (Open)",
        content: "Tender doc reference ICT-2024-098 available for registered domestic IT vendors. Full tender requirements inside.",
        isLocked: false,
        timestamp: "Yesterday",
        views: "8.4K",
        reactions: [{ emoji: "💼", count: 85 }]
      },
      {
        id: "post_3_2",
        title: "[PREMIUM] Confidential Q4 Venture Capital Dealflow & Angel Syndicates",
        content: "Detailed sheet of 12 angel syndicates actively investing in East African AgriTech and CleanTech seed rounds.",
        isLocked: true,
        previewText: "Subscribe to unlock full list of verified angel investor contacts and average ticket sizes...",
        timestamp: "3 days ago",
        views: "1.2K",
        reactions: [{ emoji: "🔒", count: 42 }]
      }
    ]
  },
  {
    id: "channel_4",
    name: "Startup Rwanda",
    handle: "@startup_rwanda",
    avatar: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=300&q=80",
    category: "Startups",
    description: "Incubators, pitch competitions, founder spotlights, policy updates, and co-founder matchmaking.",
    subscribers: 11300,
    isSubscribed: false,
    isVerified: false,
    isPremium: false,
    posts: [
      {
        id: "post_4_1",
        title: "Rwanda Innovation Fund announces Cohort 4 Pitch Date",
        content: "Early-stage founders can pitch for up to $100K in matching grants. Applications close end of month.",
        timestamp: "Oct 12",
        views: "5.5K",
        reactions: [{ emoji: "🚀", count: 180 }]
      }
    ]
  },
  {
    id: "channel_5",
    name: "Education Updates & Scholarships",
    handle: "@edu_scholarships",
    avatar: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80",
    category: "Education",
    description: "Global scholarship announcements, master's funding, exchange programs, and online certifications.",
    subscribers: 18900,
    isSubscribed: false,
    isVerified: true,
    isPremium: false,
    posts: [
      {
        id: "post_5_1",
        title: "Master's in Machine Intelligence at CMU-Africa Full Scholarships",
        content: "Admissions open for 2025 cohort with 100% tuition and living stipend coverage for qualified African students.",
        timestamp: "Oct 10",
        views: "12K",
        reactions: [{ emoji: "🎓", count: 412 }]
      }
    ]
  },
  {
    id: "channel_6",
    name: "Sports Rwanda",
    handle: "@sports_rw",
    avatar: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80",
    category: "Sports",
    description: "Basketball Africa League (BAL), Rwanda Premier League, Tour du Rwanda, and national team highlights.",
    subscribers: 31000,
    isSubscribed: false,
    isVerified: true,
    isPremium: false,
    posts: [
      {
        id: "post_6_1",
        title: "Tour du Rwanda 2025 Route Stages Announced",
        content: "8 grueling mountain stages across the thousand hills starting and finishing at the Kigali Convention Centre.",
        mediaUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
        timestamp: "Oct 08",
        views: "19K",
        reactions: [{ emoji: "🚴‍♂️", count: 520 }, { emoji: "🇷🇼", count: 840 }]
      }
    ]
  }
];
