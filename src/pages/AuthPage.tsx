import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Eye, EyeOff, Loader2, ShoppingBag, User, Mail, Lock, Phone,
  Check, ArrowRight, ShieldCheck, BadgeCheck, Headphones, UserPlus, ChevronDown,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'signup';

const COUNTRIES = [
  { flag: '🇮🇳', code: '+91', name: 'India' },
  { flag: '🇺🇸', code: '+1', name: 'United States' },
  { flag: '🇬🇧', code: '+44', name: 'United Kingdom' },
  { flag: '🇦🇪', code: '+971', name: 'UAE' },
  { flag: '🇨🇦', code: '+1', name: 'Canada' },
  { flag: '🇦🇺', code: '+61', name: 'Australia' },
  { flag: '🇸🇦', code: '+966', name: 'Saudi Arabia' },
  { flag: '🇸🇬', code: '+65', name: 'Singapore' },
  { flag: '🇩🇪', code: '+49', name: 'Germany' },
  { flag: '🇫🇷', code: '+33', name: 'France' },
];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.8c2.2-2 3.7-5 3.7-8.8Z" />
    <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.8-2.9l-3.8-3a7.2 7.2 0 0 1-10.7-3.8H1.4v3.1A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l3.9-3.1Z" />
    <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l3.9 3.1A7.2 7.2 0 0 1 12 4.8Z" />
  </svg>
);

const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

const Field: React.FC<{
  icon: React.ReactNode;
  label?: string;
  valid?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ icon, label, valid, error, children }) => (
  <div>
    <div
      className={`flex items-start gap-3 rounded-2xl border bg-white px-4 py-3 transition-all duration-200
        ${error ? 'border-red-300 ring-2 ring-red-100' : 'border-black/10 focus-within:border-[#6C3BFF] focus-within:ring-2 focus-within:ring-[#6C3BFF]/15'}
        shadow-[0_1px_2px_rgba(17,17,17,0.04)]`}
    >
      <span className="mt-1.5 text-[#111]/60">{icon}</span>
      <div className="flex-1 min-w-0">
        {label && <p className="text-[13px] font-semibold text-[#111]">{label}</p>}
        {children}
      </div>
      {valid && !error && (
        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 animate-scale-in">
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </span>
      )}
    </div>
    {error && <p className="mt-1.5 pl-1 text-xs font-medium text-red-500">{error}</p>}
  </div>
);

const inputCls =
  'w-full bg-transparent text-[15px] text-[#111] placeholder:text-[#111]/35 outline-none';

const AuthPage = ({ mode = 'login' }: { mode?: AuthMode }) => {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [agree, setAgree] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(mode === 'login');
    setErrors({});
  }, [mode]);

  const valid = useMemo(
    () => ({
      fullName: fullName.trim().length >= 2,
      email: emailValid(email),
      phone: phone.replace(/\D/g, '').length >= 7,
      password: password.length >= 6,
      confirm: confirm.length >= 6 && confirm === password,
    }),
    [fullName, email, phone, password, confirm]
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!valid.email) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (!valid.password) e.password = 'Password must be at least 6 characters';
    if (!isLogin) {
      if (!fullName.trim()) e.fullName = 'Full name is required';
      if (!phone.trim()) e.phone = 'Phone number is required';
      else if (!valid.phone) e.phone = 'Enter a valid phone number';
      if (!confirm) e.confirm = 'Please confirm your password';
      else if (confirm !== password) e.confirm = 'Passwords do not match';
      if (!agree) e.agree = 'Please accept the Terms & Privacy Policy';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      setGoogleLoading(false);
      toast({ title: 'Google Sign-In failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Welcome back!', description: 'You have successfully signed in' });
          navigate('/', { replace: true });
        }
      } else {
        const { error } = await signUp(email, password, fullName, `${country.code} ${phone}`);
        if (error) {
          toast({
            title: error.message.includes('already registered') ? 'Account exists' : 'Signup failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({ title: 'Account created 🎉', description: 'Please sign in to continue' });
          navigate('/login', { replace: true });
        }
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-svh w-full bg-white px-5 py-8">
      <div key={isLogin ? 'login' : 'signup'} className="mx-auto w-full max-w-md animate-fade-in-up">
        {isLogin ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-[68px] w-[68px] items-center justify-center rounded-[22px] bg-gradient-to-br from-[#7C4DFF] to-[#6C3BFF] shadow-[0_10px_30px_rgba(108,59,255,0.35)]">
              <ShoppingBag className="h-8 w-8 text-white" strokeWidth={2.2} />
            </div>
            <h1 className="text-[34px] font-extrabold tracking-tight text-[#111]">Sellora</h1>
            <p className="mt-1 text-[15px] text-[#111]/55">Your Premium Marketplace</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[#6C3BFF]/10">
              <UserPlus className="h-11 w-11 text-[#6C3BFF]" strokeWidth={2} />
            </div>
            <h1 className="text-[30px] font-extrabold tracking-tight text-[#111]">Create Account</h1>
            <p className="mt-1 text-[15px] text-[#111]/55">Let's get you started with Sellora</p>
          </div>
        )}

        {isLogin && (
          <div className="mt-7 flex items-center justify-between gap-4 rounded-3xl bg-[#6C3BFF]/[0.07] px-5 py-6">
            <div>
              <h2 className="text-[21px] font-bold text-[#111]">Welcome Back</h2>
              <p className="mt-1 text-[13px] text-[#111]/55">Sign in to continue to your account</p>
            </div>
            <ShoppingBag className="h-14 w-14 shrink-0 text-[#6C3BFF]" strokeWidth={1.6} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5" noValidate>
          {!isLogin && (
            <Field icon={<User className="h-5 w-5" />} label="Full Name" valid={valid.fullName} error={errors.fullName}>
              <input
                className={inputCls}
                placeholder="Enter your full name"
                value={fullName}
                autoComplete="name"
                onChange={(e) => setFullName(e.target.value)}
              />
            </Field>
          )}

          <Field
            icon={<Mail className="h-5 w-5" />}
            label={isLogin ? undefined : 'Email Address'}
            valid={valid.email}
            error={errors.email}
          >
            <input
              className={inputCls}
              type="email"
              placeholder="Enter your email address"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          {!isLogin && (
            <Field icon={<Phone className="h-5 w-5" />} label="Phone Number" valid={valid.phone} error={errors.phone}>
              <div className="mt-1 flex items-center gap-2">
                <div className="relative flex items-center gap-1 rounded-xl bg-[#111]/[0.04] px-2.5 py-1.5">
                  <span className="text-base leading-none">{country.flag}</span>
                  <span className="text-[13px] font-semibold text-[#111]">{country.code}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#111]/50" />
                  <select
                    aria-label="Country code"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    value={country.name}
                    onChange={(e) =>
                      setCountry(COUNTRIES.find((c) => c.name === e.target.value) || COUNTRIES[0])
                    }
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.name} value={c.name}>{`${c.flag} ${c.name} (${c.code})`}</option>
                    ))}
                  </select>
                </div>
                <input
                  className={inputCls}
                  type="tel"
                  inputMode="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  autoComplete="tel"
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </Field>
          )}

          <Field
            icon={<Lock className="h-5 w-5" />}
            label={isLogin ? undefined : 'Password'}
            valid={!isLogin && valid.password}
            error={errors.password}
          >
            <div className="flex items-center gap-2">
              <input
                className={inputCls}
                type={showPassword ? 'text' : 'password'}
                placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
                value={password}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-[#6C3BFF]/80">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </Field>

          {!isLogin && (
            <Field icon={<Lock className="h-5 w-5" />} label="Confirm Password" valid={valid.confirm} error={errors.confirm}>
              <div className="flex items-center gap-2">
                <input
                  className={inputCls}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirm}
                  autoComplete="new-password"
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <button type="button" onClick={() => setShowConfirm((s) => !s)} className="text-[#6C3BFF]/80">
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </Field>
          )}

          {isLogin ? (
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-[13px] font-semibold text-[#6C3BFF]">
                Forgot Password?
              </Link>
            </div>
          ) : (
            <div>
              <label className="flex items-start gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setAgree((a) => !a)}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    agree ? 'border-[#111] bg-[#111]' : 'border-black/25 bg-white'
                  }`}
                  aria-pressed={agree}
                >
                  {agree && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                </button>
                <span className="text-[13px] leading-relaxed text-[#111]">
                  I agree to Sellora's <span className="font-semibold text-[#6C3BFF]">Terms of Service</span> and{' '}
                  <span className="font-semibold text-[#6C3BFF]">Privacy Policy</span>
                </span>
              </label>
              {errors.agree && <p className="mt-1.5 pl-8 text-xs font-medium text-red-500">{errors.agree}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-[#111] text-[16px] font-bold text-white
                       shadow-[0_10px_24px_rgba(17,17,17,0.18)] transition-transform duration-150 active:scale-[0.985] disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {isLogin && (
          <>
            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-black/10" />
              <span className="text-[13px] text-[#111]/50">or continue with</span>
              <span className="h-px flex-1 bg-black/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white
                         text-[15px] font-semibold text-[#111] shadow-[0_1px_2px_rgba(17,17,17,0.05)]
                         transition-transform duration-150 active:scale-[0.985] disabled:opacity-70"
            >
              {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </button>
          </>
        )}

        <p className="mt-6 text-center text-[14px] text-[#111]/60">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link to={isLogin ? '/signup' : '/login'} className="font-bold text-[#6C3BFF]">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </Link>
        </p>

        {isLogin && (
          <>
            <div className="mt-7 grid grid-cols-3 gap-3 rounded-3xl bg-[#111]/[0.03] px-4 py-6 text-center">
              {[
                { icon: ShieldCheck, title: 'Secure & Safe', sub: 'Your data is 100% protected' },
                { icon: BadgeCheck, title: 'Premium Quality', sub: 'Top products from trusted sellers' },
                { icon: Headphones, title: '24/7 Support', sub: "We're here to help you anytime" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title}>
                  <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#6C3BFF]/10">
                    <Icon className="h-5 w-5 text-[#6C3BFF]" />
                  </div>
                  <p className="text-[12.5px] font-bold text-[#111]">{title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-[#111]/50">{sub}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-[12.5px] leading-relaxed text-[#111]/50">
              By continuing, you agree to Sellora's
              <br />
              <span className="font-semibold text-[#6C3BFF]">Terms of Service</span> and{' '}
              <span className="font-semibold text-[#6C3BFF]">Privacy Policy</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
