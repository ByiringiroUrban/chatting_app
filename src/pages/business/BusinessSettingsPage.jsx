import React, { useState } from 'react';
import BusinessSidebar from '../../components/business/BusinessSidebar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Avatar from '../../components/common/Avatar';
import { useBusinessStore } from '../../stores/businessStore';
import { useUiStore } from '../../stores/uiStore';
import { Building2, Mail, Phone, MapPin, Clock, Globe, Save } from 'lucide-react';

export default function BusinessSettingsPage() {
  const { profile, updateProfile } = useBusinessStore();
  const { showToast } = useUiStore();

  const [name, setName] = useState(profile.name || '');
  const [category, setCategory] = useState(profile.category || '');
  const [description, setDescription] = useState(profile.description || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [location, setLocation] = useState(profile.location || '');
  const [workingHours, setWorkingHours] = useState(profile.workingHours || '');
  const [greetingMessage, setGreetingMessage] = useState(profile.greetingMessage || '');
  const [awayMessage, setAwayMessage] = useState(profile.awayMessage || '');

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      category,
      description,
      email,
      phone,
      location,
      workingHours,
      greetingMessage,
      awayMessage
    });
    showToast("Business profile updated successfully!", "success");
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <BusinessSidebar />

      <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-bg-dark p-4 sm:p-6 lg:p-8 select-none">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-brand-700 dark:text-teal-400" />
              Official Business Profile
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Visible on your customer chats, official channel directory, and receipts.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Identity Card */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <Avatar src={profile.logo} alt={name} size="xl" className="ring-4 ring-brand-500/20" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{name}</h3>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">Registered Rwandan Entity</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Business Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Category / Industry"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  About Business / Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Contact & Physical Address */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Location & Office Contact</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                />
                <Input
                  label="Support Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={Phone}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Physical Location in Rwanda"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  icon={MapPin}
                />
                <Input
                  label="Operating Working Hours"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  icon={Clock}
                />
              </div>
            </div>

            {/* Automated Greetings & Away Messages */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Automated Messaging Workflows</h3>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Greeting Message (Sent to first-time customers)
                </label>
                <textarea
                  rows={2}
                  value={greetingMessage}
                  onChange={(e) => setGreetingMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Away Message (Sent outside working hours)
                </label>
                <textarea
                  rows={2}
                  value={awayMessage}
                  onChange={(e) => setAwayMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="lg" icon={Save}>
                Save Business Profile
              </Button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
