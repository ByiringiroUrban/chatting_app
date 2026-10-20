import React from 'react';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { CreditCard, Download, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';

export default function BillingPage() {
  const { billingHistory, plans, currentPlanId, fetchSubscriptionData, isLoading } = useSubscriptionStore();
  const { showToast } = useUiStore();

  React.useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const currentPlan = plans.find(p => p.id === currentPlanId) || plans[0] || {
    name: "Business Plan",
    tagline: "For Rwandan entrepreneurs & verified shops"
  };

  const handleDownloadInvoice = (invNum) => {
    showToast(`Downloading invoice ${invNum}...`, "info");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-bg-dark overflow-y-auto p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to="/pricing" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-700 dark:hover:text-teal-400 mb-2 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Pricing
            </Link>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-brand-700 dark:text-teal-400" />
              Billing & Invoices
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review your active plan subscription, billing statements, and payment methods in Rwanda.
            </p>
          </div>
        </div>

        {/* Current Active Plan Card */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block mb-1">Current Active Tier</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{currentPlan.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{currentPlan.tagline}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/pricing">
              <Button variant="primary" size="md">Change Plan</Button>
            </Link>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Past Invoices & Receipts</h3>
            <p className="text-xs text-slate-400">All amounts shown in Rwandan Francs (RWF)</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {billingHistory.map((inv) => (
              <div
                key={inv.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{inv.invoiceNumber}</span>
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3" /> {inv.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{inv.description}</p>
                  <span className="text-[11px] text-slate-400">{inv.date} • {inv.paymentMethod}</span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">{inv.amount}</span>
                  <button
                    onClick={() => handleDownloadInvoice(inv.invoiceNumber)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
