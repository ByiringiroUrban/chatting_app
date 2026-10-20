import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { Mail, CheckCircle2, ArrowLeft, ShieldCheck, KeyRound, Eye, EyeOff, RotateCcw } from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';

export default function ForgotPasswordPage() {
  // Steps: 1 = Enter Email/Phone, 2 = Enter OTP, 3 = Set New Password, 4 = Success
  const [step, setStep] = useState(1);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const { resetPassword, verifyOtp, confirmPasswordReset, isLoading, error } = useAuthStore();
  const { showToast } = useUiStore();
  const navigate = useNavigate();

  // Countdown timer for resend
  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, countdown]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLocalError('');
    const target = emailOrPhone.trim();
    if (!target) {
      setLocalError('Please enter your email or phone number.');
      return;
    }

    const res = await resetPassword(target);
    if (res.success) {
      showToast(res.message || 'Verification code sent to your email/phone!', 'success');
      setStep(2);
      setCountdown(60);
    } else {
      setLocalError(res.error || 'Failed to dispatch verification code.');
    }
  };

  // OTP box input handling
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto advance next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`reset-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`reset-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLocalError('');
    const code = otp.join('').trim();
    if (code.length < 6) {
      setLocalError('Please enter the full 6-digit verification code.');
      return;
    }

    // Step verification
    setStep(3);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setCountdown(60);
    showToast('Sending a new verification code...', 'info');
    const res = await resetPassword(emailOrPhone.trim());
    if (res.success) {
      showToast('A new 6-digit code has been dispatched to your email!', 'success');
    } else {
      showToast(res.error || 'Failed to resend code.', 'error');
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!newPassword || newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    const code = otp.join('').trim();
    const res = await confirmPasswordReset({
      emailOrPhone: emailOrPhone.trim(),
      otpCode: code,
      newPassword: newPassword
    });

    if (res.success) {
      showToast('Password changed successfully!', 'success');
      setStep(4);
    } else {
      setLocalError(res.error || 'Failed to reset password. Please check your verification code.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-bg-light dark:bg-bg-dark relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        
        {/* Navigation & Header */}
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
          
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {step === 1 && "Reset Password"}
            {step === 2 && "Enter Verification Code"}
            {step === 3 && "Create New Password"}
            {step === 4 && "Password Reset Complete"}
          </h1>
          
          <p className="text-xs text-slate-500 mt-1">
            {step === 1 && "Enter your email or phone number to receive a 6-digit OTP code."}
            {step === 2 && `We sent a 6-digit security code to ${emailOrPhone}.`}
            {step === 3 && "Choose a strong password with at least 6 characters."}
            {step === 4 && "Your password has been updated. You can now log into your account."}
          </p>
        </div>

        {/* Global Error Banner */}
        {(localError || error) && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {localError || error}
          </div>
        )}

        {/* STEP 1: Enter email / phone */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
            <Input
              label="Email or Phone Number"
              placeholder="e.g. byiringirourban20@gmail.com"
              value={emailOrPhone}
              onChange={(e) => {
                setEmailOrPhone(e.target.value);
                setLocalError('');
              }}
              icon={Mail}
              required
            />

            <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full mt-2">
              Send Verification Code
            </Button>
          </form>
        )}

        {/* STEP 2: Enter 6-digit OTP code */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
            <div className="flex items-center justify-center gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`reset-otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-14 text-center text-2xl font-black bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-slate-900 dark:text-white transition-all shadow-sm"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={otp.join('').trim().length < 6}
              className="w-full"
            >
              Verify Code
            </Button>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Change Email / Phone
              </button>
              
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0}
                className={`font-semibold flex items-center gap-1 transition-colors ${
                  countdown > 0
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-brand-600 dark:text-brand-400 hover:underline'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Create New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter at least 6 characters"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setLocalError('');
                }}
                icon={KeyRound}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setLocalError('');
                }}
                icon={KeyRound}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full mt-2"
            >
              Update Password
            </Button>
          </form>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Password Changed!</h3>
            <p className="text-xs text-slate-500 mt-2">
              Your password has been successfully updated. You can now securely sign in to your Muraho account.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/login')}
              className="w-full mt-6"
            >
              Sign In Now
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
