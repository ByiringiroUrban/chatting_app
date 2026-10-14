import React from 'react';
import { useUiStore } from '../../stores/uiStore';
import { Globe } from 'lucide-react';

export default function LanguageSelector({ className = "" }) {
  const { language, setLanguage } = useUiStore();

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <Globe className="w-4 h-4 text-slate-400 dark:text-slate-500" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 border-none focus:outline-none cursor-pointer py-1 pr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
