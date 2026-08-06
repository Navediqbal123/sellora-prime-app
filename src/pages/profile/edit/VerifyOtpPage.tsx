import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { EditShell, INK, MUTED, NumericKeypad, PURPLE, PurpleButton, CARD_SHADOW } from './_ui';
import { toast } from '@/hooks/use-toast';

const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as any)?.phone || 'your new number';
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [seconds, setSeconds] = useState(25);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const setAt = (i: number, v: string) => {
    setDigits((d) => {
      const next = [...d];
      next[i] = v;
      return next;
    });
  };

  const handleChange = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, '');
    if (v.length > 1) {
      const chars = v.slice(0, 6 - i).split('');
      setDigits((d) => {
        const next = [...d];
        chars.forEach((c, k) => (next[i + k] = c));
        return next;
      });
      refs.current[Math.min(i + chars.length, 5)]?.focus();
      return;
    }
    setAt(i, v);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const push = (k: string) => {
    const idx = digits.findIndex((d) => !d);
    if (idx === -1) return;
    setAt(idx, k);
    refs.current[Math.min(idx + 1, 5)]?.focus();
  };

  const back = () => {
    const filled = digits.map((d) => !!d).lastIndexOf(true);
    if (filled >= 0) {
      setAt(filled, '');
      refs.current[filled]?.focus();
    }
  };

  const verify = () => {
    if (digits.some((d) => !d)) {
      toast({ title: 'Incomplete code', description: 'Enter all 6 digits.', variant: 'destructive' });
      return;
    }
    navigate('/profile/edit/phone/success', { state: { phone }, replace: true });
  };

  return (
    <EditShell title="Verify OTP" centerTitle>
      <div className="flex flex-col items-center pt-2">
        <div
          className="w-[86px] h-[86px] rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#F8F5FF', border: '1px solid #E5D8FF' }}
        >
          <ShieldCheck size={38} strokeWidth={1.6} style={{ color: PURPLE }} />
        </div>
        <h2 className="text-[18px] font-bold mt-5" style={{ color: INK }}>
          Verify OTP
        </h2>
        <p className="text-[13px] text-center mt-1" style={{ color: MUTED }}>
          Enter the 6-digit verification code sent to
          <br />
          <span className="font-semibold" style={{ color: INK }}>{phone}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2.5 pt-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={d}
            inputMode="numeric"
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus();
            }}
            className="w-[46px] h-[56px] rounded-[16px] text-center text-[20px] font-bold outline-none transition-all focus:scale-[1.03]"
            style={{
              color: INK,
              backgroundColor: '#FFFFFF',
              border: `1.5px solid ${d ? PURPLE : '#EAEAEE'}`,
              boxShadow: CARD_SHADOW,
            }}
          />
        ))}
      </div>

      <p className="text-center text-[12.5px]" style={{ color: MUTED }}>
        {seconds > 0 ? (
          `Resend OTP in 00:${String(seconds).padStart(2, '0')}`
        ) : (
          <button className="font-semibold" style={{ color: PURPLE }} onClick={() => setSeconds(25)}>
            Resend OTP
          </button>
        )}
      </p>

      <PurpleButton onClick={verify}>Verify</PurpleButton>

      <div className="pt-2">
        <NumericKeypad onKey={(k) => k !== '.' && push(k)} onBackspace={back} />
      </div>
    </EditShell>
  );
};

export default VerifyOtpPage;
