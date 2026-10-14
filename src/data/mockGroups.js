export const mockGroups = [
  {
    id: "group_1",
    name: "Software Developers Rwanda",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80",
    description: "The official engineering community for Rwandan software developers, tech architects, and innovators.",
    createdAt: "2023-05-10",
    members: [
      { id: "user_me", name: "Jean-Luc Mugisha", role: "admin", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" },
      { id: "user_1", name: "Aline Uwase", role: "admin", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80" },
      { id: "user_2", name: "David Nkurunziza", role: "member", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" },
      { id: "user_4", name: "Patrick Habimana", role: "member", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" },
      { id: "user_6", name: "Eric Manzi", role: "member", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80" }
    ],
    settings: {
      onlyAdminsCanPost: false,
      approveNewMembers: true,
      allowMediaSharing: true
    }
  },
  {
    id: "group_2",
    name: "AI & Machine Learning Rwanda",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    description: "Deep learning, NLP, computer vision and African language AI models research group.",
    createdAt: "2023-08-15",
    members: [
      { id: "user_6", name: "Eric Manzi", role: "admin", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80" },
      { id: "user_me", name: "Jean-Luc Mugisha", role: "member", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" },
      { id: "user_4", name: "Patrick Habimana", role: "member", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" }
    ],
    settings: {
      onlyAdminsCanPost: false,
      approveNewMembers: false,
      allowMediaSharing: true
    }
  },
  {
    id: "group_3",
    name: "Business Community Kigali",
    avatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80",
    description: "SME leaders, business owners, and trade facilitators discussing commerce, investments and tax insights.",
    createdAt: "2023-01-20",
    members: [
      { id: "user_2", name: "David Nkurunziza", role: "admin", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" },
      { id: "user_3", name: "Diane Mutoni", role: "admin", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80" },
      { id: "user_me", name: "Jean-Luc Mugisha", role: "member", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" }
    ],
    settings: {
      onlyAdminsCanPost: false,
      approveNewMembers: true,
      allowMediaSharing: true
    }
  },
  {
    id: "group_4",
    name: "University Students Network",
    avatar: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80",
    description: "Connecting students across University of Rwanda, ALU, CMU-Africa, and Kepler for internships and hackathons.",
    createdAt: "2023-09-01",
    members: [
      { id: "user_5", name: "Sonia Keza", role: "admin", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" },
      { id: "user_me", name: "Jean-Luc Mugisha", role: "member", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" }
    ],
    settings: {
      onlyAdminsCanPost: false,
      approveNewMembers: false,
      allowMediaSharing: true
    }
  },
  {
    id: "group_5",
    name: "Startup Founders Rwanda",
    avatar: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=300&q=80",
    description: "Private network of venture-backed & bootstrapped founders navigating growth, hiring, and fundraising.",
    createdAt: "2023-03-12",
    members: [
      { id: "user_me", name: "Jean-Luc Mugisha", role: "admin", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" },
      { id: "user_2", name: "David Nkurunziza", role: "member", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" },
      { id: "user_3", name: "Diane Mutoni", role: "member", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80" }
    ],
    settings: {
      onlyAdminsCanPost: false,
      approveNewMembers: true,
      allowMediaSharing: true
    }
  }
];
