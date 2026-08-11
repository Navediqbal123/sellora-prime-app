import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ShieldCheck, ChevronDown, Loader2 } from 'lucide-react';
import { Card, EditShell, INK, MUTED, NumericKeypad, PURPLE, PurpleButton, VerifiedPill } from './_ui';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useProfileRow } from './useProfileRow';

const COUNTRIES = [
  { code: '+91', flag: '🇮🇳' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+971', flag: '🇦🇪' },
];

const ChangePhonePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, update } = useProfileRow();
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const existing = profile?.phone_number || '';
    const match = COUNTRIES.find((c) => existing.startsWith(c.code));
    if (match) {
      setCountry(match);
      setPhone(existing.slice(match.code.length).replace(/\D/g, '').slice(0, 10));
    } else if (existing) {
      setPhone(existing.replace(/\D/g, '').slice(-10));
    }
  }, [profile?.phone_number]);

  const send = async () => {
    if (phone.replace(/\D/g, '').length < 10) {
      toast({ title: 'Invalid number', description: 'Enter a valid 10-digit phone number.', variant: 'destructive' });
      return;
    }
    if (!user?.email) {
      toast({ title: 'Not signed in', description: 'Please sign in again.', variant: 'destructive' });
      return;
    }
    const full = `${country.code}${phone}`;
    setBusy(true);
    try {
      const ok = await update({ phone_number: full, phone_verified: false });
      if (!ok) return;
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;
      toast({ title: 'OTP sent', description: `We emailed a 6-digit code to ${user.email}.` });
      navigate('/profile/edit/phone/otp', { state: { phone: full, email: user.email } });
    } catch (e: any) {
      toast({ title: 'Could not send OTP', description: e?.message || 'Try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <EditShell title="Change Phone Number" centerTitle>
      <div className="flex flex-col items-center pt-2 pb-1">
        <div
          className="w-[92px] h-[92px] rounded-[28px] flex items-center justify-center relative"
          style={{ backgroundColor: '#F8F5FF', border: '1px solid #E5D8FF' }}
        >
          <Smartphone size={40} strokeWidth={1.6} style={{ color: PURPLE }} />
          <span
            className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${PURPLE}, #9F5BFF)`, border: '2px solid #FFFFFF' }}
          >
            <ShieldCheck size={17} strokeWidth={2.2} className="text-white" />
          </span>
        </div>
        <h2 className="text-[18px] font-bold mt-5" style={{ color: INK }}>
          Enter New Phone Number
        </h2>
        <p className="text-[13px] text-center mt-1 max-w-[280px]" style={{ color: MUTED }}>
          We will email you a verification code to confirm this change.
        </p>
      </div>

      <Card className="px-4 py-3.5">
        <div className="flex items-center justify-between">
          <label className="text-[11.5px] font-medium" style={{ color: MUTED }}>
            New Phone Number
          </label>
          {profile?.phone_verified && <VerifiedPill />}
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="relative">
            <button
              onClick={() => setPickerOpen((o) => !o)}
              className="flex items-center gap-1.5 px-3 h-10 rounded-[14px] text-[14px] font-semibold"
              style={{ backgroundColor: '#F5F5F7', border: '1px solid #EFEFF3', color: INK }}
            >
              <span className="text-[16px]">{country.flag}</span>
              {country.code}
              <ChevronDown size={14} style={{ color: MUTED }} />
            </button>
            {pickerOpen && (
              <div
                className="absolute z-20 mt-2 w-[130px] rounded-[16px] overflow-hidden"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFF3', boxShadow: '0 12px 32px -12px rgba(15,15,25,0.2)' }}
              >
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCountry(c);
                      setPickerOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[14px] font-medium text-left active:bg-black/[0.03]"
                    style={{ color: INK }}
                  >
                    <span>{c.flag}</span>
                    {c.code}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="98765 43210"
            className="flex-1 bg-transparent outline-none text-[16px] font-semibold"
            style={{ color: INK }}
          />
        </div>
      </Card>

      <PurpleButton onClick={send} disabled={busy}>
        {busy && <Loader2 size={17} className="animate-spin" />}
        Send OTP
      </PurpleButton>

      <div className="pt-2">
        <NumericKeypad
          onKey={(k) => k !== '.' && setPhone((p) => (p + k).slice(0, 10))}
          onBackspace={() => setPhone((p) => p.slice(0, -1))}
        />
      </div>
    </EditShell>
  );
};

export default ChangePhonePage;
