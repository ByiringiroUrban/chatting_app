import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { useChannelStore } from '../../stores/channelStore';
import { useUiStore } from '../../stores/uiStore';
import { Lock, ShieldCheck, Check } from 'lucide-react';

export default function ChannelSubscriptionModal() {
  const { isSubscriptionModalOpen, setSubscriptionModalOpen, selectedChannelForSub, unlockPremiumChannel } = useChannelStore();
  const { showToast } = useUiStore();
  const [selectedMethod, setSelectedMethod] = useState('momo');

  if (!isSubscriptionModalOpen || !selectedChannelForSub) return null;

  const handleConfirmSubscription = () => {
    unlockPremiumChannel(selectedChannelForSub.id);
    showToast(`Subscribed to ${selectedChannelForSub.name}! Content unlocked.`, "success");
  };

  const paymentMethods = [
    { id: 'momo', label: 'MTN Mobile Money (*182#)', icon: '📱' },
    { id: 'airtel', label: 'Airtel Money (*500#)', icon: '📶' },
    { id: 'card', label: 'Bank Card (Visa / Mastercard)', icon: '💳' },
  ];

  return (
    <Modal
      isOpen={isSubscriptionModalOpen}
      onClose={() => setSubscriptionModalOpen(false)}
      title="Unlock Premium Channel"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="relative mb-2">
          <Avatar src={selectedChannelForSub.avatar} alt={selectedChannelForSub.name} size="xl" />
          <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-white rounded-full">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedChannelForSub.name}</h3>
        <Badge variant="warning" className="mt-1">Premium Exclusive Channel</Badge>
        <p className="text-xs text-slate-500 mt-2 max-w-xs">{selectedChannelForSub.description}</p>

        {/* Pricing tag */}
        <div className="mt-4 p-3 bg-teal-50 dark:bg-brand-950/40 rounded-2xl w-full border border-teal-200 dark:border-brand-800/40">
          <span className="text-xs text-teal-800 dark:text-teal-300 font-medium">Subscription Fee</span>
          <p className="text-2xl font-black text-brand-700 dark:text-teal-400 mt-0.5">
            {selectedChannelForSub.priceMonthly?.toLocaleString() || "5,000"} RWF
            <span className="text-xs font-normal text-slate-500"> / month</span>
          </p>
        </div>
      </div>

      {/* Payment methods */}
      <div className="py-4">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
          Select Payment Method (Simulation)
        </label>
        <div className="space-y-2">
          {paymentMethods.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedMethod(m.id)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                selectedMethod === m.id
                  ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{m.icon}</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{m.label}</span>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selectedMethod === m.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'
              }`}>
                {selectedMethod === m.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setSubscriptionModalOpen(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirmSubscription}>
          Pay & Unlock Access
        </Button>
      </div>
    </Modal>
  );
}
