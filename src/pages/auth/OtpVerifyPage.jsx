import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { ShieldCheck, RotateCcw } from 'lucide-react';

export default function OtpVerifyPage() {
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [countdown, setCountdown] = useState(45);
  const { verifyOtp, isLoading, error } = useAuthStore();
  const { showToast } = useUiStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // auto advance
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    const success = await verifyOtp(code);
    if (success) {
      showToast("Phone verified successfully!", "success");
      navigate('/app/chats');
    }
  };

  const resendCode = () => {
    setCountdown(60);
    showToast("A new 6-digit code has been sent to your phone via SMS.", "info");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-bg-light dark:bg-bg-dark">
      <div className="w-full max-w-md bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center">
        
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-brand-950/40 text-brand-700 dark:text-teal-400 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Enter Verification Code</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          We sent a 6-digit security code to your registered mobile number or email address.
        </p>

        <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-6">
          {/* 6 Digit Inputs */}
          <div className="flex items-center justify-center gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                className="w-11 h-14 text-center text-xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
              />
            ))}
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
            Verify & Continue
          </Button>

          {/* Resend and countdown */}
          <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
            {countdown > 0 ? (
              <span>Resend code in <strong className="text-slate-700 dark:text-slate-300">{countdown}s</strong></span>
            ) : (
              <button
                type="button"
                onClick={resendCode}
                className="inline-flex items-center gap-1 font-bold text-brand-700 dark:text-teal-400 hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Resend Verification Code
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <Link to="/login" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
