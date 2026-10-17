import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Phone,
  Mail,
  ChevronDown,
  ArrowLeft,
  Check,
  ShieldCheck,
  Camera,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Search,
  Lock,
  Smile,
  Globe,
  Sparkles,
  User,
  AtSign,
  AlertCircle
} from 'lucide-react';
import { countryCodes, defaultCountry } from '../../data/countryCodes';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import LanguageSelector from '../../components/common/LanguageSelector';

const PRESET_AVATARS = [
  { id: 'av1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', label: 'Keza' },
  { id: 'av2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', label: 'Patrick' },
  { id: 'av3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', label: 'Aline' },
  { id: 'av4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', label: 'Eric' },
  { id: 'av5', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', label: 'Diane' },
  { id: 'av6', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80', label: 'Jean' },
];

const WHATSAPP_STATUS_PRESETS = [
  'Hey there! I am using Muraho.',
  'Available',
  'At work',
  'In a meeting',
  'Busy',
  'Urgent calls only',
  'Muraho Rwanda 🇷🇼',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, verifyOtp, isLoading, error } = useAuthStore();
  const { showToast } = useUiStore();

  // Registration Stepper: 'welcome' | 'identifier' | 'verify' | 'profile' | 'initializing'
  const [step, setStep] = useState('welcome');

  // Registration Mode: 'phone' | 'email'
  const [authMethod, setAuthMethod] = useState('phone');

  // Phone state
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [phoneDigits, setPhoneDigits] = useState('788 123 456');
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Email state
  const [email, setEmail] = useState('');

  // Dual linking options
  const [includeEmailBackup, setIncludeEmailBackup] = useState(false);
  const [backupEmail, setBackupEmail] = useState('');
  const [includePhoneBackup, setIncludePhoneBackup] = useState(false);
  const [backupPhone, setBackupPhone] = useState('');

  // Confirmation modal (WhatsApp style "Is this number correct?")
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // OTP Verification state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(45);
  const otpInputRefs = useRef([]);

  // Profile setup state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [customAvatarPreview, setCustomAvatarPreview] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [bio, setBio] = useState('Hey there! I am using Muraho.');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Initializing state
  const [initStage, setInitStage] = useState(0);

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (step === 'verify' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Generate suggested username when full name changes
  const handleNameChange = (val) => {
    setFullName(val);
    if (!username || username === fullName.toLowerCase().replace(/\s+/g, '_')) {
      const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15);
      if (slug) setUsername(slug);
    }
  };

  // Formatted complete phone string
  const getFullPhone = () => {
    const raw = phoneDigits.replace(/\s+/g, '');
    return `${selectedCountry.dialCode} ${raw}`;
  };

  // ---------------------------------------------------------------
  // Step 2: Handle Identifier Validation & Trigger Confirmation Modal
  // ---------------------------------------------------------------
  const handleProceedToConfirmation = (e) => {
    e?.preventDefault();

    if (authMethod === 'phone') {
      const cleanDigits = phoneDigits.replace(/[^0-9]/g, '');
      if (cleanDigits.length < 7) {
        showToast('Please enter a valid phone number.', 'error');
        return;
      }
      if (includeEmailBackup && backupEmail) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(backupEmail)) {
          showToast('Please enter a valid backup email address.', 'error');
          return;
        }
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }
      if (includePhoneBackup && backupPhone) {
        const cleanBackup = backupPhone.replace(/[^0-9]/g, '');
        if (cleanBackup.length < 7) {
          showToast('Please enter a valid backup phone number.', 'error');
          return;
        }
      }
    }

    // Open authentic WhatsApp Confirmation Modal
    setShowConfirmModal(true);
  };

  // When user clicks "OK" in confirmation modal
  const handleConfirmNumber = () => {
    setShowConfirmModal(false);
    setStep('verify');
    setCountdown(45);
    setOtp(['', '', '', '', '', '']);

    const targetDesc = authMethod === 'phone' ? getFullPhone() : email;
    showToast(`Verification code sent to ${targetDesc}`, 'info');

    // Auto-focus first digit on OTP screen
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 200);
  };

  // ---------------------------------------------------------------
  // Step 3: Handle OTP Inputs
  // ---------------------------------------------------------------
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto advance to next box
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits entered, auto verify
    if (value && index === 5 && newOtp.every((d) => d !== '')) {
      handleVerifyOtpCode(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      const newOtp = pasteData.split('');
      while (newOtp.length < 6) newOtp.push('');
      setOtp(newOtp);
      if (pasteData.length === 6) {
        handleVerifyOtpCode(pasteData);
      } else {
        otpInputRefs.current[pasteData.length]?.focus();
      }
    }
  };

  const handleVerifyOtpCode = async (codeToVerify) => {
    const code = codeToVerify || otp.join('');
    if (code.length !== 6) {
      showToast('Please enter the complete 6-digit verification code.', 'error');
      return;
    }

    const verified = await verifyOtp(code);
    if (verified) {
      showToast('Verification successful!', 'success');
      setStep('profile');
    }
  };

  const handleFillDemoOtp = () => {
    const demo = ['1', '2', '3', '4', '5', '6'];
    setOtp(demo);
    handleVerifyOtpCode('123456');
  };

  const handleResendCode = () => {
    setCountdown(60);
    const targetDesc = authMethod === 'phone' ? getFullPhone() : email;
    showToast(`New 6-digit security code sent to ${targetDesc}`, 'info');
  };

  // ---------------------------------------------------------------
  // Step 4: Handle Profile Picture Upload
  // ---------------------------------------------------------------
  const handleCustomAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCustomAvatarPreview(reader.result);
        setSelectedAvatar(reader.result);
        setShowAvatarPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // ---------------------------------------------------------------
  // Step 4: Final Submit & Transition to Initializing Screen
  // ---------------------------------------------------------------
  const handleFinalSubmit = async (e) => {
    e?.preventDefault();

    if (!fullName.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }
    if (password && password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    // Determine final phone and email
    let finalPhone = null;
    let finalEmail = null;

    if (authMethod === 'phone') {
      finalPhone = getFullPhone();
      finalEmail = includeEmailBackup && backupEmail ? backupEmail : null;
    } else {
      finalEmail = email;
      finalPhone = includePhoneBackup && backupPhone ? backupPhone : null;
    }

    setStep('initializing');
    setInitStage(1);

    // Stage 1: Key generation simulation
    setTimeout(() => {
      setInitStage(2);
    }, 600);

    // Stage 2: Profile synchronization
    setTimeout(async () => {
      setInitStage(3);

      const success = await register({
        fullName: fullName.trim(),
        username: username.trim() || fullName.trim().toLowerCase().replace(/\s+/g, '_'),
        email: finalEmail,
        phone: finalPhone,
        password: password || 'password123',
        avatar: selectedAvatar,
        bio: bio.trim() || 'Hey there! I am using Muraho.',
      });

      if (success) {
        setInitStage(4);
        setTimeout(() => {
          showToast(`Welcome to Muraho, ${fullName.trim()}!`, 'success');
          navigate('/app/chats');
        }, 800);
      } else {
        setStep('profile');
        showToast('Registration failed. Please check your details.', 'error');
      }
    }, 1300);
  };

  // Filter countries in search modal
  const filteredCountries = countryCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dialCode.includes(countrySearch)
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-slate-100 dark:bg-[#0c1317] selection:bg-[#00a884] selection:text-white transition-colors">
      
      {/* Outer Card with WhatsApp styling */}
      <div className="w-full max-w-md bg-white dark:bg-[#111b21] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all">
        
        {/* ========================================================================= */}
        {/* SCREEN 1: WELCOME SCREEN (WhatsApp "Welcome to WhatsApp / Muraho")        */}
        {/* ========================================================================= */}
        {step === 'welcome' && (
          <div className="p-8 sm:p-10 flex flex-col items-center text-center animate-fade-in">
            {/* Top Language Selector */}
            <div className="w-full flex justify-end mb-4">
              <LanguageSelector className="bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm" />
            </div>

            {/* Glowing Brand Hero Graphic */}
            <div className="relative my-6">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#008069] to-[#00a884] flex items-center justify-center shadow-xl shadow-[#00a884]/25 ring-8 ring-[#00a884]/15">
                <MessageSquare className="w-14 h-14 sm:w-16 sm:h-16 text-white stroke-[2.2]" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                🇷🇼 RWANDA
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome to Muraho
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs leading-relaxed">
              Simple, reliable, private messaging and business commerce. Connect effortlessly across Rwanda and worldwide.
            </p>

            {/* Privacy & Terms agreement */}
            <div className="my-8 text-[11px] text-slate-400 dark:text-slate-500 leading-normal max-w-xs">
              Read our{' '}
              <span className="text-[#00a884] hover:underline cursor-pointer font-medium">Privacy Policy</span>. Tap
              "Agree and continue" to accept the{' '}
              <span className="text-[#00a884] hover:underline cursor-pointer font-medium">Terms of Service</span>.
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => setStep('identifier')}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#00a884] hover:bg-[#029070] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#00a884]/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Agree and continue</span>
            </button>

            {/* Existing User Login Shortcut */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 w-full text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#00a884] hover:underline">
                Log in
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: IDENTIFIER SELECTION (Phone Number OR Email Address)            */}
        {/* ========================================================================= */}
        {step === 'identifier' && (
          <div className="flex flex-col animate-fade-in">
            {/* Header bar */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {authMethod === 'phone' ? 'Enter your phone number' : 'Enter your email address'}
              </h2>
              <div className="w-6" />
            </div>

            <div className="p-6 sm:p-8 flex flex-col">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed">
                {authMethod === 'phone'
                  ? 'Muraho will verify your phone number. Carrier SMS charges may apply.'
                  : 'Muraho will send a 6-digit verification code to your email.'}
              </p>

              {/* Segmented Mode Selector: Phone vs Email */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    authMethod === 'phone'
                      ? 'bg-white dark:bg-[#00a884] text-[#008069] dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone Number</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    authMethod === 'email'
                      ? 'bg-white dark:bg-[#00a884] text-[#008069] dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Address</span>
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleProceedToConfirmation} className="flex flex-col gap-5">
                {/* -------------------- PHONE REGISTRATION -------------------- */}
                {authMethod === 'phone' && (
                  <div className="flex flex-col gap-4">
                    {/* Country Selector Button */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
                        Country / Region
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCountryModalOpen(true)}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-[#00a884] dark:hover:border-[#00a884] transition-all"
                      >
                        <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          <span className="text-xl">{selectedCountry.flag}</span>
                          <span>{selectedCountry.name}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>

                    {/* Phone Number Inputs */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-2.5">
                        <div className="w-24 flex items-center justify-center py-3.5 px-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200">
                          {selectedCountry.dialCode}
                        </div>
                        <input
                          type="tel"
                          value={phoneDigits}
                          onChange={(e) => setPhoneDigits(e.target.value)}
                          placeholder={selectedCountry.format}
                          autoFocus
                          className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00a884]/30 focus:border-[#00a884] transition-all"
                        />
                      </div>
                    </div>

                    {/* Dual Linking Option: Also link email */}
                    <div className="mt-1 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={includeEmailBackup}
                          onChange={(e) => setIncludeEmailBackup(e.target.checked)}
                          className="w-4 h-4 text-[#00a884] rounded focus:ring-[#00a884] cursor-pointer"
                        />
                        <span>Also link an email address (Optional)</span>
                      </label>

                      {includeEmailBackup && (
                        <div className="mt-2.5 animate-slide-up">
                          <input
                            type="email"
                            value={backupEmail}
                            onChange={(e) => setBackupEmail(e.target.value)}
                            placeholder="e.g. patrick@muraho.rw"
                            className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#00a884]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* -------------------- EMAIL REGISTRATION -------------------- */}
                {authMethod === 'email' && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
                        Email Address
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. patrick@muraho.rw"
                          autoFocus
                          required
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00a884]/30 focus:border-[#00a884] transition-all"
                        />
                      </div>
                    </div>

                    {/* Dual Linking Option: Also link phone */}
                    <div className="mt-1 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={includePhoneBackup}
                          onChange={(e) => setIncludePhoneBackup(e.target.checked)}
                          className="w-4 h-4 text-[#00a884] rounded focus:ring-[#00a884] cursor-pointer"
                        />
                        <span>Also link a phone number (Optional)</span>
                      </label>

                      {includePhoneBackup && (
                        <div className="mt-2.5 animate-slide-up">
                          <input
                            type="tel"
                            value={backupPhone}
                            onChange={(e) => setBackupPhone(e.target.value)}
                            placeholder="+250 788 123 456"
                            className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#00a884]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {error && <p className="text-xs text-rose-500 text-center">{error}</p>}

                {/* Next Button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 rounded-2xl bg-[#00a884] hover:bg-[#029070] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#00a884]/25 active:scale-[0.99] transition-all"
                >
                  Next
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: VERIFICATION CODE (WhatsApp 6-Digit OTP)                         */}
        {/* ========================================================================= */}
        {step === 'verify' && (
          <div className="flex flex-col animate-fade-in">
            {/* Header bar */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('identifier')}
                className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Verifying your account
              </h2>
              <div className="w-6" />
            </div>

            <div className="p-6 sm:p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#00a884]/10 text-[#00a884] flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 stroke-[2.3]" />
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                Waiting to automatically detect a 6-digit code sent to{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {authMethod === 'phone' ? getFullPhone() : email}
                </strong>
                .{' '}
                <button
                  type="button"
                  onClick={() => setStep('identifier')}
                  className="text-[#00a884] font-bold hover:underline inline-block"
                >
                  Wrong {authMethod === 'phone' ? 'number' : 'email'}?
                </button>
              </p>

              {/* 6 Digit Segmented Inputs */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-7" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 sm:w-12 h-14 text-center text-xl font-black bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/20 transition-all font-mono"
                  />
                ))}
              </div>

              {/* Fast-track Demo Fill helper */}
              <button
                type="button"
                onClick={handleFillDemoOtp}
                className="mb-6 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-[11px] font-bold text-[#008069] dark:text-[#00a884] hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-fill Demo Code (123456)</span>
              </button>

              {error && <p className="text-xs text-rose-500 mb-4">{error}</p>}

              {/* Verify & Continue Button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleVerifyOtpCode()}
                className="w-full py-3.5 rounded-2xl bg-[#00a884] hover:bg-[#029070] disabled:opacity-50 text-white font-bold text-sm tracking-wide shadow-lg shadow-[#00a884]/25 active:scale-[0.99] transition-all"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>

              {/* Resend & Countdown */}
              <div className="mt-6 text-xs text-slate-500 flex flex-col items-center gap-2">
                {countdown > 0 ? (
                  <span>
                    Resend code in <strong className="text-slate-800 dark:text-slate-200">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="inline-flex items-center gap-1.5 font-bold text-[#00a884] hover:underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Resend Verification Code
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => showToast('Simulating automated voice call with code...', 'info')}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline"
                >
                  Call me instead
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 4: PROFILE INFO (WhatsApp "Profile info")                           */}
        {/* ========================================================================= */}
        {step === 'profile' && (
          <div className="flex flex-col animate-fade-in">
            {/* Header bar */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('verify')}
                className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Profile info</h2>
              <div className="w-6" />
            </div>

            <div className="p-6 sm:p-8 flex flex-col">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6">
                Please provide your name and an optional profile photo
              </p>

              {/* Avatar Selector Circle */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
                  <img
                    src={selectedAvatar}
                    alt={fullName || 'Avatar'}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-[#00a884]/20 group-hover:opacity-90 transition-all shadow-md"
                  />
                  <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-md ring-2 ring-white dark:ring-[#111b21] group-hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(true)}
                  className="mt-2 text-xs font-bold text-[#00a884] hover:underline"
                >
                  Change Profile Photo
                </button>
              </div>

              {/* Avatar Picker Drawer / Modal */}
              {showAvatarPicker && (
                <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-slide-up">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Choose an Avatar or Upload
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Close
                    </button>
                  </div>

                  {/* Preset Grid */}
                  <div className="grid grid-cols-6 gap-2 mb-3">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(av.url);
                          setShowAvatarPicker(false);
                        }}
                        className={`relative rounded-full overflow-hidden p-0.5 border-2 transition-all ${
                          selectedAvatar === av.url
                            ? 'border-[#00a884] scale-105 shadow-md'
                            : 'border-transparent hover:border-slate-300'
                        }`}
                      >
                        <img src={av.url} alt={av.label} className="w-full h-full rounded-full object-cover" />
                      </button>
                    ))}
                  </div>

                  {/* Upload custom button */}
                  <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#00a884] text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#00a884]" />
                    <span>Upload photo from your device</span>
                    <input type="file" accept="image/*" onChange={handleCustomAvatarUpload} className="hidden" />
                  </label>
                </div>
              )}

              {/* Form Inputs */}
              <form onSubmit={handleFinalSubmit} className="flex flex-col gap-4">
                {/* Full Name */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Type your name here *
                    </label>
                    <span className="text-[10px] text-slate-400">{fullName.length}/25</span>
                  </div>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={25}
                      value={fullName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Patrick Habimana"
                      required
                      autoFocus
                      className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#00a884] transition-all"
                    />
                    <Smile className="w-4 h-4 text-slate-400 absolute right-4 cursor-pointer hover:text-slate-600" />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                    Username handle
                  </label>
                  <div className="relative flex items-center">
                    <AtSign className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="patrick_h"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#00a884] transition-all"
                    />
                  </div>
                </div>

                {/* WhatsApp Status / About */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
                    About / Status
                  </label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Hey there! I am using Muraho."
                    className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#00a884] mb-2"
                  />
                  {/* Status Preset Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {WHATSAPP_STATUS_PRESETS.slice(0, 4).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBio(preset)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                          bio === preset
                            ? 'bg-[#00a884]/15 border-[#00a884] text-[#008069] dark:text-[#00a884] font-bold'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password / Security Credentials */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                        Account Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#00a884]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                        Confirm Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#00a884]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Next Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 py-3.5 rounded-2xl bg-[#00a884] hover:bg-[#029070] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#00a884]/25 active:scale-[0.99] transition-all"
                >
                  {isLoading ? 'Setting up...' : 'Next'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 5: INITIALIZING (WhatsApp Iconic "Initializing..." Screen)         */}
        {/* ========================================================================= */}
        {step === 'initializing' && (
          <div className="p-10 sm:p-12 flex flex-col items-center text-center animate-fade-in">
            {/* Spinning WhatsApp Gear / Circle */}
            <div className="relative my-8">
              <div className="w-24 h-24 rounded-full border-4 border-[#00a884]/20 border-t-[#00a884] animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-[#00a884]" />
              </div>
            </div>

            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Initializing...</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-8">
              Please wait a moment while we set up your Muraho account.
            </p>

            {/* Checklist Progression */}
            <div className="w-full max-w-xs flex flex-col gap-3 text-left">
              <div
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  initStage >= 1
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-[#008069] dark:text-[#00a884]'
                    : 'text-slate-400 opacity-60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    initStage >= 1 ? 'bg-[#00a884] text-white' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs font-semibold">Generating end-to-end encryption keys</span>
              </div>

              <div
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  initStage >= 2
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-[#008069] dark:text-[#00a884]'
                    : 'text-slate-400 opacity-60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    initStage >= 2 ? 'bg-[#00a884] text-white' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs font-semibold">Connecting to Rwandan network</span>
              </div>

              <div
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  initStage >= 3
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-[#008069] dark:text-[#00a884]'
                    : 'text-slate-400 opacity-60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    initStage >= 3 ? 'bg-[#00a884] text-white' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs font-semibold">Syncing contacts & conversations</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* WHATSAPP CONFIRMATION POPUP MODAL ("Is this the correct number / email?") */}
      {/* ========================================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#1f2c34] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-slide-up text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              You entered {authMethod === 'phone' ? 'the phone number' : 'the email'}:
            </h3>
            <p className="text-lg font-black text-[#008069] dark:text-[#00a884] my-2 font-mono">
              {authMethod === 'phone' ? getFullPhone() : email}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Is this OK, or would you like to edit the {authMethod === 'phone' ? 'number' : 'email'}?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                EDIT
              </button>
              <button
                type="button"
                onClick={handleConfirmNumber}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00a884] hover:bg-[#029070] text-white shadow-md shadow-[#00a884]/25 transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEARCHABLE COUNTRY SELECTOR MODAL                                         */}
      {/* ========================================================================= */}
      {isCountryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm max-h-[80vh] bg-white dark:bg-[#111b21] rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Select Country</h3>
              <button
                type="button"
                onClick={() => setIsCountryModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            {/* Search Input */}
            <div className="relative my-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search country or code..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00a884]"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 pr-1">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    setSelectedCountry(country);
                    setIsCountryModalOpen(false);
                    setCountrySearch('');
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors ${
                    selectedCountry.code === country.code ? 'bg-[#00a884]/10 text-[#008069] dark:text-[#00a884]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{country.flag}</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{country.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    {country.dialCode}
                  </span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">No countries found</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
