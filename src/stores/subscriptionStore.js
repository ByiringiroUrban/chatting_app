import { create } from 'zustand';
import { pricingPlans, mockBillingHistory } from '../data/mockPlans';

const PLAN_STORAGE = 'muraho_current_plan';
const BILLING_STORAGE = 'muraho_billing_history';

export const useSubscriptionStore = create((set, get) => ({
  plans: pricingPlans,
  currentPlanId: localStorage.getItem(PLAN_STORAGE) || "plan_business",
  billingCycle: "monthly", // 'monthly' | 'yearly'
  billingHistory: JSON.parse(localStorage.getItem(BILLING_STORAGE)) || mockBillingHistory,
  isCheckoutModalOpen: false,
  selectedPlanForCheckout: null,

  setBillingCycle: (cycle) => set({ billingCycle: cycle }),
  openCheckoutModal: (plan) => set({ isCheckoutModalOpen: true, selectedPlanForCheckout: plan }),
  closeCheckoutModal: () => set({ isCheckoutModalOpen: false, selectedPlanForCheckout: null }),

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
