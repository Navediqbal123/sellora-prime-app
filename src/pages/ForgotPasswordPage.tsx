import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, ArrowRight, KeyRound, Loader2, Mail, MailCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) {
      toast({ title: 'Could not send email', description: err.message, variant: 'destructive' });
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-svh w-full bg-white px-5 py-8">
      <div className="mx-auto w-full max-w-md animate-fade-in-up">
        <button
          onClick={() => navigate('/login')}
          className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-[0_1px_2px_rgba(17,17,17,0.05)]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-[#111]" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[#6C3BFF]/10">
            {sent ? (
              <MailCheck className="h-11 w-11 text-[#6C3BFF]" strokeWidth={2} />
            ) : (
              <KeyRound className="h-11 w-11 text-[#6C3BFF]" strokeWidth={2} />
            )}
          </div>
          <h1 className="text-[30px] font-extrabold tracking-tight text-[#111]">
            {sent ? 'Check your email' : 'Reset Password'}
          </h1>
          <p className="mx-auto mt-2 max-w-[300px] text-[15px] text-[#111]/55">
            {sent
              ? `We sent a password reset link to ${email}`
              : 'Enter your email and we will send you a reset link'}
          </p>
        </div>

        {!sent && (
          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <div>
              <div
                className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-4 transition-all ${
                  error
                    ? 'border-red-300 ring-2 ring-red-100'
                    : 'border-black/10 focus-within:border-[#6C3BFF] focus-within:ring-2 focus-within:ring-[#6C3BFF]/15'
                }`}
              >
                <Mail className="h-5 w-5 text-[#111]/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-transparent text-[15px] text-[#111] placeholder:text-[#111]/35 outline-none"
                />
              </div>
              {error && <p className="mt-1.5 pl-1 text-xs font-medium text-red-500">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-[#111] text-[16px] font-bold text-white
                         shadow-[0_10px_24px_rgba(17,17,17,0.18)] transition-transform active:scale-[0.985] disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send Reset Link <ArrowRight className="h-5 w-5" /></>}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[14px] text-[#111]/60">
          Remembered it?{' '}
          <Link to="/login" className="font-bold text-[#6C3BFF]">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
