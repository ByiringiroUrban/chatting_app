import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { useUiStore } from '../../stores/uiStore';
import { Check, ShieldCheck, Zap, Sparkles, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PricingPage() {
  const { 
    plans, 
    currentPlanId, 
    billingCycle, 
    setBillingCycle, 
    isCheckoutModalOpen, 
    openCheckoutModal, 
    closeCheckoutModal, 
    selectedPlanForCheckout, 
    upgradeToPlan,
    fetchSubscriptionData,
    isLoading
  } = useSubscriptionStore();

  const { showToast } = useUiStore();
  const [paymentMethod, setPaymentMethod] = useState('MTN Mobile Money (*182#)');

  React.useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const handleCheckoutConfirm = () => {
    if (!selectedPlanForCheckout) return;
    upgradeToPlan(selectedPlanForCheckout.id, paymentMethod);
    showToast(`Upgraded to ${selectedPlanForCheckout.name}!`, "success");
  };

  const paymentOptions = [
    { label: "MTN Mobile Money (*182#)", icon: "📱" },
    { label: "Airtel Money (*500#)", icon: "📶" },
    { label: "Bank of Kigali / I&M Bank Transfer", icon: "🏦" },
    { label: "Credit Card (Visa / Mastercard)", icon: "💳" }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-bg-dark overflow-y-auto p-4 sm:p-6 lg:p-8 select-none">
      
      {/* Mock Checkout Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={closeCheckoutModal}
        title="Confirm Subscription Upgrade"
        maxWidth="max-w-md"
      >
        {selectedPlanForCheckout && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-brand-950/40 border border-teal-200 dark:border-brand-800/40 text-center">
              <span className="text-xs font-semibold text-teal-800 dark:text-teal-300">Selected Plan</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedPlanForCheckout.name}</h3>
              <p className="text-2xl font-black text-brand-700 dark:text-teal-400 mt-1">
                {billingCycle === 'monthly'
                  ? `${selectedPlanForCheckout.priceMonthly?.toLocaleString()} RWF / month`
                  : `${selectedPlanForCheckout.priceYearly?.toLocaleString()} RWF / year`
                }
              </p>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                Select Payment Channel (Simulation)
              </label>
              <div className="space-y-2">
                {paymentOptions.map((opt) => (
                  <div
                    key={opt.label}
                    onClick={() => setPaymentMethod(opt.label)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === opt.label
                        ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{opt.icon}</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{opt.label}</span>
                    </div>
                    {paymentMethod === opt.label && <Check className="w-4 h-4 text-brand-600 stroke-[3]" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button variant="ghost" onClick={closeCheckoutModal}>Cancel</Button>
              <Button variant="primary" onClick={handleCheckoutConfirm}>Confirm & Pay</Button>
            </div>
          </div>
        )}
      </Modal>

      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Header & Billing Cycle Switcher */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-brand-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold mb-3 border border-teal-200 dark:border-brand-800/40">
            <Sparkles className="w-3.5 h-3.5" /> Simple, Transparent Pricing in RWF
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Plans for Individuals & Businesses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Enjoy free messaging forever, or upgrade for advanced Rwandan business tools, AI automation, and customer analytics.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs mt-6">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Yearly Billing
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-xs flex flex-col justify-between border-2 transition-all ${
                  plan.highlight 
                    ? 'border-brand-600 ring-4 ring-brand-500/10' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-700 text-white shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                      {price === 0 ? "Free" : `${price.toLocaleString()} RWF`}
                    </span>
                    {price > 0 && (
                      <span className="text-xs text-slate-400 font-medium">
                        {billingCycle === 'monthly' ? " / month" : " / year"}
                      </span>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 mb-6 text-xs text-slate-700 dark:text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant={isCurrent ? "secondary" : plan.highlight ? "primary" : "outline"}
                    className="w-full"
                    disabled={isCurrent}
                    onClick={() => openCheckoutModal(plan)}
                  >
                    {isCurrent ? "Active Plan" : plan.buttonText}
                  </Button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Links to Subscriptions & Billing history */}
        <div className="text-center pt-4">
          <Link to="/billing" className="text-xs font-bold text-brand-700 dark:text-teal-400 hover:underline">
            View Past Invoices & Billing History →
          </Link>
        </div>

      </div>
    </div>
  );
}
