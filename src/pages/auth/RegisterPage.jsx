import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { User, AtSign, Mail, Phone, Lock, Eye, EyeOff, Upload } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+250 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');

  const { register, isLoading, error } = useAuthStore();
  const { showToast } = useUiStore();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    const success = await register({ fullName, username, email, phone, password });
    if (success) {
      showToast("Account created! Check your phone for OTP verification.", "success");
      navigate('/verify');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-bg-light dark:bg-bg-dark">
      <div className="w-full max-w-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl my-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Create your Account</h1>
          <p className="text-xs text-slate-500 mt-1">Join the Muraho network for modern chatting and commerce</p>
        </div>

        {/* Profile photo preview */}
        <div className="flex flex-col items-center mb-6">
          <Avatar src={avatarPreview} alt={fullName || "User"} size="xl" className="ring-4 ring-brand-500/20 mb-2" />
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
            <Upload className="w-3 h-3" /> Profile Picture Preview
          </span>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              placeholder="e.g. Patrick Habimana"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={User}
              required
            />
            <Input
              label="Username"
              placeholder="patrick_h"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={AtSign}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.rw"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+250 788 123 456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={Phone}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
            />
            <Input
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              required
            />
          </div>

          {error && <p className="text-xs text-rose-500 text-center">{error}</p>}

          <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full mt-3">
            Create Account
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-brand-700 dark:text-teal-400 hover:underline">
            Log in
          </Link>
        </div>

      </div>
    </div>
  );
}
