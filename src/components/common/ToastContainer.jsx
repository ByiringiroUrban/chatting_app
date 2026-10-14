import React from 'react';
import { useUiStore } from '../../stores/uiStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useUiStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
          warning: <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-teal-500 flex-shrink-0" />
        };

        const bgBorders = {
          success: "border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900",
          error: "border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900",
          warning: "border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900",
          info: "border-teal-200 dark:border-teal-900/60 bg-white dark:bg-slate-900"
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-lg ${bgBorders[toast.type] || bgBorders.info} animate-slide-up transition-all`}
          >
            <div className="flex items-center gap-3">
              {icons[toast.type] || icons.info}
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
