import React, { useState } from 'react';
import Button from '../../components/common/Button';
import { useUiStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { 
  Palette, 
  Globe, 
  Shield, 
  Bell, 
  Smartphone, 
  Lock, 
  Trash2, 
  Check, 
  Moon, 
  Sun, 
  Laptop,
  LogOut 
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme, language, setLanguage, showToast } = useUiStore();
  const { openLogoutModal } = useAuthStore();

  const [lastSeenPrivacy, setLastSeenPrivacy] = useState('everyone');
  const [readReceipts, setReadReceipts] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [groupNotifications, setGroupNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const languages = [
    { code: 'en', label: 'English', desc: 'Default system language' },
    { code: 'rw', label: 'Ikinyarwanda', desc: 'Ururimi kavukire rwo mu Rwanda' },
    { code: 'fr', label: 'Français', desc: 'Langue officielle' },
  ];

  const handleSaveSettings = () => {
    showToast("Preferences saved successfully!", "success");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-bg-dark overflow-y-auto p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Application Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personalize your theme, language, notifications, and security settings.
          </p>
        </div>

        {/* 1. Appearance / Theme */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-brand-700 dark:text-teal-400" />
            Appearance & Theme
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                theme === 'light'
                  ? 'border-brand-600 bg-teal-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-teal-300 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-semibold">Light Mode</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'border-brand-600 bg-teal-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-teal-300 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="w-5 h-5 text-teal-400" />
              <span className="text-xs font-semibold">Dark Mode</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                theme === 'system'
                  ? 'border-brand-600 bg-teal-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-teal-300 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Laptop className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-semibold">System Default</span>
            </button>
          </div>
        </div>

        {/* 2. Language Selection */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-brand-700 dark:text-teal-400" />
            Language / Ururimi / Langue
          </h2>
          <div className="space-y-2">
            {languages.map((l) => (
              <div
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  language === l.code
                    ? 'border-brand-600 bg-teal-50/40 dark:bg-brand-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{l.label}</h4>
                  <p className="text-[11px] text-slate-400">{l.desc}</p>
                </div>
                {language === l.code && <Check className="w-4 h-4 text-brand-600" />}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Privacy & Security */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-700 dark:text-teal-400" />
            Privacy & Security
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Read Receipts (Blue Ticks)</p>
              <p className="text-[11px] text-slate-400">If turned off, you won't send or see read receipts.</p>
            </div>
            <input
              type="checkbox"
              checked={readReceipts}
              onChange={(e) => setReadReceipts(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Two-Factor Authentication (2FA)</p>
              <p className="text-[11px] text-slate-400">Require an SMS OTP when logging into new devices.</p>
            </div>
            <input
              type="checkbox"
              checked={twoFactorAuth}
              onChange={(e) => setTwoFactorAuth(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* 4. Connected Devices Simulation */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-brand-700 dark:text-teal-400" />
            Connected Devices
          </h2>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Chrome on Windows (Current)</p>
              <p className="text-[11px] text-slate-400">Kigali, Rwanda • Active now</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
        </div>

        {/* 5. Logout & Account Actions */}
        <div className="flex justify-between items-center pt-2">
          <Button variant="danger" size="sm" onClick={openLogoutModal} className="flex items-center gap-1.5">
            <LogOut className="w-4 h-4" />
            <span>Log Out of Muraho</span>
          </Button>

          <Button variant="primary" onClick={handleSaveSettings}>
            Save All Preferences
          </Button>
        </div>

      </div>
    </div>
  );
}
