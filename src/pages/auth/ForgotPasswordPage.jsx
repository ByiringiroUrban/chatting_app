import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuthStore } from '../../stores/authStore';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrPhone) return;
    await resetPassword(emailOrPhone);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-bg-light dark:bg-bg-dark">
      <div className="w-full max-w-md bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Reset Password</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your email or phone number to receive a secure password reset link.
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Reset instructions sent!</h3>
            <p className="text-xs text-slate-500 mt-2">
              If an account matches <strong>{emailOrPhone}</strong>, we have dispatched a password recovery link.
            </p>
            <Link to="/login" className="inline-block mt-6">
              <Button variant="primary" size="md">Return to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email or Phone Number"
              placeholder="+250 788... or you@company.rw"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              icon={Mail}
              required
            />

            <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full mt-2">
              Send Reset Link
            </Button>
          </form>
        )}

      </div>
    </div>
  );
}
