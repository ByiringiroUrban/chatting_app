import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useChannelStore } from '../../stores/channelStore';
import { useUiStore } from '../../stores/uiStore';

export default function CreateChannelModal() {
  const { isCreateModalOpen, setCreateModalOpen, createChannel } = useChannelStore();
  const { showToast } = useUiStore();

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [isPremium, setIsPremium] = useState(false);
  const [priceMonthly, setPriceMonthly] = useState(3000);

  const categories = ["Technology", "Business", "Startups", "Education", "Sports", "General"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Channel name is required", "warning");
      return;
    }

    createChannel({
      name: name.trim(),
      handle: handle.trim() || `@${name.toLowerCase().replace(/\s+/g, '_')}`,
      description: description.trim(),
      category,
      isPremium,
      priceMonthly
    });

    showToast(`Channel "${name}" launched!`, "success");
    setName('');
    setHandle('');
    setDescription('');
    setIsPremium(false);
    setCreateModalOpen(false);
  };

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={() => setCreateModalOpen(false)}
      title="Create an Official Channel"
      description="Reach thousands of subscribers across Rwanda with public or premium broadcasts."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input
          label="Channel Name"
          placeholder="e.g. Kigali Startup Hub"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Channel Handle"
          placeholder="@kigali_startups"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <Input
          label="Description"
          placeholder="What news and updates will you share?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Premium Channel Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Paid Subscription Channel</p>
            <p className="text-[11px] text-slate-500">Require members to pay a monthly fee in RWF</p>
          </div>
          <input
            type="checkbox"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
          />
        </div>

        {isPremium && (
          <Input
            label="Monthly Subscription Fee (RWF)"
            type="number"
            value={priceMonthly}
            onChange={(e) => setPriceMonthly(e.target.value)}
          />
        )}

        <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Launch Channel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
