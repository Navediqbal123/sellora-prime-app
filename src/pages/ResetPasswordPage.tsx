import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Check, Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (password.length < 6) err.password = 'Password must be at least 6 characters';
    if (confirm !== password) err.confirm = 'Passwords do not match';
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: 'Could not update password', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Password updated', description: 'Please sign in with your new password' });
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const row = (
    key: 'password' | 'confirm',
    value: string,
    setValue: (v: string) => void,
    label: string,
    placeholder: string,
    ok: boolean
  ) => (
    <div>
      <div
        className={`flex items-start gap-3 rounded-2xl border bg-white px-4 py-3 transition-all ${
          errors[key]
            ? 'border-red-300 ring-2 ring-red-100'
            : 'border-black/10 focus-within:border-[#6C3BFF] focus-within:ring-2 focus-within:ring-[#6C3BFF]/15'
        }`}
      >
        <Lock className="mt-1.5 h-5 w-5 text-[#111]/60" />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-[#111]">{label}</p>
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            autoComplete="new-password"
            className="w-full bg-transparent text-[15px] text-[#111] placeholder:text-[#111]/35 outline-none"
          />
        </div>
        {ok && !errors[key] ? (
          <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </span>
        ) : (
          <button type="button" onClick={() => setShow((s) => !s)} className="mt-1 text-[#6C3BFF]/80">
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {errors[key] && <p className="mt-1.5 pl-1 text-xs font-medium text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-svh w-full bg-white px-5 py-8">
      <div className="mx-auto w-full max-w-md animate-fade-in-up">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[#6C3BFF]/10">
            <ShieldCheck className="h-11 w-11 text-[#6C3BFF]" strokeWidth={2} />
          </div>
          <h1 className="text-[30px] font-extrabold tracking-tight text-[#111]">New Password</h1>
          <p className="mt-2 text-[15px] text-[#111]/55">Create a new password for your account</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-3.5" noValidate>
          {row('password', password, setPassword, 'Password', 'Create a strong password', password.length >= 6)}
          {row('confirm', confirm, setConfirm, 'Confirm Password', 'Confirm your password', confirm.length >= 6 && confirm === password)}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-[#111] text-[16px] font-bold text-white
                       shadow-[0_10px_24px_rgba(17,17,17,0.18)] transition-transform active:scale-[0.985] disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Update Password <ArrowRight className="h-5 w-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
