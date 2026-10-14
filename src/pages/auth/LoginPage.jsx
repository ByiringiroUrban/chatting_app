import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('jeanluc@muraho.rw');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { login, isLoading, error } = useAuthStore();
  const { showToast } = useUiStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login({ emailOrPhone, password, rememberMe });
    if (success) {
      showToast("Welcome back to Muraho!", "success");
      navigate('/app/chats');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-bg-light dark:bg-bg-dark selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-700/20 text-white font-black text-2xl mb-3">
            M
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Welcome to Muraho
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect, chat, and manage your Rwandan business effortlessly.
          </p>
        </div>

        {/* Demo Notice Banner */}
        <div className="mb-6 p-3 rounded-2xl bg-teal-50 dark:bg-brand-950/40 border border-teal-200 dark:border-brand-800/40 text-[11px] text-teal-800 dark:text-teal-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Demo Authentication mode is active. Click <b>Log In</b> to explore all features instantly.</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            label="Email or Phone Number"
            placeholder="+250 788... or user@example.rw"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            icon={Mail}
            required
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-slate-700 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-semibold text-brand-700 dark:text-teal-400 hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-xs text-rose-500 text-center">{error}</p>}

          <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full mt-2">
            Log In
          </Button>

          {/* Verification Shortcut */}
          <Link to="/verify" className="text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1">
            Have an OTP code? Verify here
          </Link>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          Don't have an account yet?{" "}
          <Link to="/register" className="font-bold text-brand-700 dark:text-teal-400 hover:underline">
            Create account
          </Link>
        </div>

      </div>
    </div>
  );
}
