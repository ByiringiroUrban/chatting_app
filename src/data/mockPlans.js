export const pricingPlans = [
  {
    id: "plan_free",
    name: "Personal",
    tagline: "Everyday free messaging for individuals and communities.",
    priceMonthly: 0,
    priceYearly: 0,
    badge: "Free Forever",
    highlight: false,
    features: [
      "Individual unlimited messaging",
      "Group chats up to 256 members",
      "HD voice & video calling interface",
      "Voice notes & media attachments up to 25MB",
      "Access to public public channels & statuses",
      "Dark and light sleek themes"
    ],
    buttonText: "Current Plan",
    buttonDisabled: false
  },
  {
    id: "plan_premium",
    name: "Muraho Premium",
    tagline: "For power users, creators, and professionals needing extra polish.",
    priceMonthly: 3000,
    priceYearly: 28800, // 20% discount
    badge: "Popular Personal",
    highlight: false,
    features: [
      "All Personal Plan features",
      "Cloud storage boost up to 100GB (UI)",
      "Exclusive animated profile badges",
      "Access to paid premium channels",
      "Custom themes & custom chat wallpapers",
      "Priority audio note transcription (AI preview)",
      "Pin up to 20 chats simultaneously"
    ],
    buttonText: "Upgrade to Premium",
    buttonDisabled: false
  },
  {
    id: "plan_business",
    name: "Business Starter",
    tagline: "Everything you need to sell, respond, and engage customers seamlessly.",
    priceMonthly: 15000,
    priceYearly: 144000,
    badge: "Most Popular for SMEs",
    highlight: true,
    features: [
      "Official Verified Business profile badge",
      "Dedicated Customer Inbox with status tags",
      "Product Catalog with in-chat ordering",
      "Automated greeting & away responses",
      "Quick reply shortcuts (/pricing, /momo)",
      "Real-time analytics dashboard & reports",
      "Multi-agent conversation assignment"
    ],
    buttonText: "Get Business Starter",
    buttonDisabled: false
  },
  {
    id: "plan_business_ai",
    name: "Business AI Suite",
    tagline: "Supercharge your business with 24/7 AI-driven customer support.",
    priceMonthly: 30000,
    priceYearly: 288000,
    badge: "Full Automation",
    highlight: false,
    features: [
      "All Business Starter features included",
      "24/7 AI Customer Support auto-responder",
      "Custom Business Knowledge Base & FAQs",
      "AI composer: rewrite, translate, fix grammar",
      "Instant conversation summarization",
      "Smart human handoff triggers",
      "Dedicated account manager & priority support"
    ],
    buttonText: "Activate Business AI",
    buttonDisabled: false
  }
];

export const mockBillingHistory = [
  {
    id: "inv_2024_09",
    invoiceNumber: "INV-2024-0091",
    date: "Sep 01, 2024",
    description: "Business Starter — Monthly Subscription",
    amount: "15,000 RWF",
    status: "Paid",
    paymentMethod: "MTN MoMo (*182#)"
  },
  {
    id: "inv_2024_08",
    invoiceNumber: "INV-2024-0082",
    date: "Aug 01, 2024",
    description: "Business Starter — Monthly Subscription",
    amount: "15,000 RWF",
    status: "Paid",
    paymentMethod: "MTN MoMo (*182#)"
  },
  {
    id: "inv_2024_07",
    invoiceNumber: "INV-2024-0071",
    date: "Jul 01, 2024",
    description: "Business Starter — Monthly Subscription",
    amount: "15,000 RWF",
    status: "Paid",
    paymentMethod: "Credit Card (Visa)"
  }
];
