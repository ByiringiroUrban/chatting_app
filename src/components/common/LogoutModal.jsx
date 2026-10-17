import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import Avatar from './Avatar';

export default function LogoutModal() {
  const { isLogoutModalOpen, closeLogoutModal, logout, user, isLoading } = useAuthStore();
  const { showToast } = useUiStore();
  const navigate = useNavigate();

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isLogoutModalOpen) {
        closeLogoutModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLogoutModalOpen, closeLogoutModal]);

  if (!isLogoutModalOpen) return null;

  const handleConfirmLogout = async () => {
    await logout();
    showToast("You have been logged out of Muraho successfully.", "info");
    navigate('/login');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none"
      onClick={closeLogoutModal}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-[#111b21] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-slide-up relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close "X" Button */}
        <button
          onClick={closeLogoutModal}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon with soft glow */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center ring-8 ring-rose-500/10 mb-4">
            <LogOut className="w-7 h-7 stroke-[2.2]" />
          </div>

          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Log out of Muraho?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
            Are you sure you want to log out on this device? You can log back in anytime with your phone number or email.
          </p>
        </div>

        {/* Active Account Preview Card */}
        {user && (
          <div className="my-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <Avatar
              src={user.avatar}
              alt={user.name || "User"}
              size="md"
              status="online"
            />
            <div className="min-w-0 flex-1 text-left">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {user.name}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user.phone || user.email || `@${user.username}`}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            disabled={isLoading}
            onClick={closeLogoutModal}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={handleConfirmLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Logging out...</span>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
