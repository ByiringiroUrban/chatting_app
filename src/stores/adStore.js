import { create } from 'zustand';
import { initialCampaigns, adPerformanceTrends } from '../data/mockAds';

const ADS_STORAGE = 'muraho_ad_campaigns';

export const useAdStore = create((set, get) => ({
  campaigns: JSON.parse(localStorage.getItem(ADS_STORAGE)) || initialCampaigns,
  performanceTrends: adPerformanceTrends,
  isCreateModalOpen: false,

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),

  createCampaign: ({ title, description, audience, budgetRwf, startDate, endDate, creativeUrl }) => {
    const newCamp = {
      id: `ad_${Date.now()}`,
      title,
      description,
      audience: audience || "General Audience in Rwanda",
      budgetRwf: Number(budgetRwf) || 100000,
      spentRwf: 0,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: "Active",
      creativeUrl: creativeUrl || "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80",
      impressions: 120,
      clicks: 8,
      ctr: "6.67%",
      conversions: 1,
      cpcRwf: 40
    };

    set((state) => {
      const updated = [newCamp, ...state.campaigns];
      localStorage.setItem(ADS_STORAGE, JSON.stringify(updated));
      return { campaigns: updated, isCreateModalOpen: false };
    });
  },

  toggleCampaignStatus: (campaignId) => {
    set((state) => {
      const updated = state.campaigns.map(c => {
        if (c.id === campaignId) {
          const nextStatus = c.status === 'Active' ? 'Paused' : 'Active';
          return { ...c, status: nextStatus };
        }
        return c;
      });
      localStorage.setItem(ADS_STORAGE, JSON.stringify(updated));
      return { campaigns: updated };
    });
  }
}));
