import React, { useState } from 'react';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { User, Mail, Phone, AtSign, Shield, Camera, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, openLogoutModal } = useAuthStore();
  const { showToast } = useUiStore();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ name, username, bio, email, phone });
    showToast("Profile details updated successfully!", "success");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-bg-dark overflow-y-auto p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Personal Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal identity, bio, and contact information.
          </p>
        </div>

        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          {/* Avatar edit preview */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer">
              <Avatar src={user?.avatar} alt={name} size="2xl" className="ring-4 ring-brand-500/20" />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-3">{name}</h2>
            <p className="text-xs text-slate-400">@{username}</p>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={User}
              required
            />

            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={AtSign}
              required
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                About / Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short bio or status quote..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={Phone}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button 
                type="button" 
                variant="danger" 
                size="sm" 
                onClick={openLogoutModal}
                className="flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </Button>

              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
