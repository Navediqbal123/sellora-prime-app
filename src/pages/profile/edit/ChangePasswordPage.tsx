import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Loader2, Save } from 'lucide-react';
import { Card, EditShell, INK, MUTED, PURPLE, PurpleButton, inputClass, inputStyle } from './_ui';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const PasswordField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}> = ({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <Card className="px-4 py-3.5">
      <label className="text-[11.5px] font-medium" style={{ color: MUTED }}>
        {label}
      </label>
      <div className="flex items-center gap-3 mt-1">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
          style={inputStyle}
        />
        <button onClick={() => setShow((s) => !s)} aria-label="Toggle visibility">
          {show ? <EyeOff size={17} style={{ color: MUTED }} /> : <Eye size={17} style={{ color: MUTED }} />}
        </button>
      </div>
    </Card>
  );
};

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user?.email) return;
    if (next.length < 8) {
      toast({ title: 'Weak password', description: 'Use at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (next !== confirm) {
      toast({ title: 'Passwords do not match', description: 'Re-enter your new password.', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: current,
      });
      if (signInError) {
        toast({ title: 'Current password is incorrect', description: 'Please try again.', variant: 'destructive' });
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw error;
      toast({ title: 'Password updated', description: 'Your new password is now active.' });
      setCurrent('');
      setNext('');
      setConfirm('');
      navigate('/profile/edit/security');
    } catch (e: any) {
      toast({ title: 'Update failed', description: e?.message || 'Try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <EditShell title="Change Password" subtitle="Use a strong, unique password" centerTitle>
      <div className="flex flex-col items-center pt-1 pb-1">
        <div
          className="w-[80px] h-[80px] rounded-[26px] flex items-center justify-center"
          style={{ backgroundColor: '#F8F5FF', border: '1px solid #E5D8FF' }}
        >
          <KeyRound size={34} strokeWidth={1.6} style={{ color: PURPLE }} />
        </div>
      </div>

      <PasswordField label="Current Password" value={current} onChange={setCurrent} placeholder="Enter current password" />
      <PasswordField label="New Password" value={next} onChange={setNext} placeholder="At least 8 characters" />
      <PasswordField label="Confirm New Password" value={confirm} onChange={setConfirm} placeholder="Re-enter new password" />

      <p className="text-[12px] px-1" style={{ color: MUTED }}>
        Tip: mix upper and lower case letters, numbers and symbols.
      </p>

      <PurpleButton onClick={submit} disabled={busy || !current || !next || !confirm}>
        {busy ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} strokeWidth={2.25} />}
        Update Password
      </PurpleButton>
    </EditShell>
  );
};

export default ChangePasswordPage;
