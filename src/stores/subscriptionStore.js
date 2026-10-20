import { create } from 'zustand';
import { subscriptionApi } from '../services/api';

const PLAN_STORAGE = 'muraho_current_plan';
const BILLING_STORAGE = 'muraho_billing_history';

export const useSubscriptionStore = create((set, get) => ({
  plans: [],
  currentPlanId: localStorage.getItem(PLAN_STORAGE) || "plan_business",
  billingCycle: "monthly", // 'monthly' | 'yearly'
  billingHistory: JSON.parse(localStorage.getItem(BILLING_STORAGE)) || [],
  isCheckoutModalOpen: false,
  selectedPlanForCheckout: null,
  isLoading: false,

  setBillingCycle: (cycle) => set({ billingCycle: cycle }),
  openCheckoutModal: (plan) => set({ isCheckoutModalOpen: true, selectedPlanForCheckout: plan }),
  closeCheckoutModal: () => set({ isCheckoutModalOpen: false, selectedPlanForCheckout: null }),

  fetchSubscriptionData: async () => {
    set({ isLoading: true });
    try {
      const [plansData, historyData] = await Promise.allSettled([
        subscriptionApi.getPlans(),
        subscriptionApi.getHistory()
      ]);
      const updates = {};
      if (plansData.status === 'fulfilled' && Array.isArray(plansData.value)) {
        updates.plans = plansData.value;
      }
      if (historyData.status === 'fulfilled' && Array.isArray(historyData.value)) {
        updates.billingHistory = historyData.value;
        localStorage.setItem(BILLING_STORAGE, JSON.stringify(historyData.value));
      }
      set({ ...updates, isLoading: false });
    } catch (e) {
      console.warn("Failed to fetch subscription data:", e);
      set({ isLoading: false });
    }
  },

  upgradeToPlan: (planId, paymentMethod = "MTN MoMo (*182#)") => {
    const plan = get().plans.find(p => p.id === planId);
    if (!plan) return;

    const newInvoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      description: `${plan.name} — ${get().billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Plan`,
      amount: `${get().billingCycle === 'monthly' ? plan.priceMonthly.toLocaleString() : plan.priceYearly.toLocaleString()} RWF`,
      status: "Paid",
      paymentMethod
    };

    const updatedHistory = [newInvoice, ...get().billingHistory];
    localStorage.setItem(PLAN_STORAGE, planId);
    localStorage.setItem(BILLING_STORAGE, JSON.stringify(updatedHistory));

    set({
      currentPlanId: planId,
      billingHistory: updatedHistory,
      isCheckoutModalOpen: false,
      selectedPlanForCheckout: null
    });
  }
}));
