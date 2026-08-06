import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, PauseCircle, Trash2 } from 'lucide-react';
import { Card, EditShell, INK, MUTED, Radio } from './_ui';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const DeleteAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [choice, setChoice] = useState<'deactivate' | 'delete'>('deactivate');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user?.id) return;
    if (!window.confirm(choice === 'delete' ? 'Permanently delete your account?' : 'Deactivate your account?')) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { account_status: choice === 'delete' ? 'deletion_requested' : 'deactivated' },
      });
      if (error) throw error;
      toast({
        title: choice === 'delete' ? 'Deletion requested' : 'Account deactivated',
        description: 'You will now be signed out.',
      });
      await signOut();
      navigate('/login', { replace: true });
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.message || 'Try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const options = [
    {
      id: 'deactivate' as const,
      icon: PauseCircle,
      title: 'Deactivate Account',
      subtitle: 'Temporarily hide your account and data',
      danger: false,
    },
    {
      id: 'delete' as const,
      icon: Trash2,
      title: 'Delete Account',
      subtitle: 'Permanently delete your account and all data',
      danger: true,
    },
  ];

  return (
    <EditShell title="Delete / Deactivate Account" subtitle="This action cannot be undone" centerTitle>
      <p className="text-[13.5px] font-semibold px-1" style={{ color: INK }}>
        Choose an option
      </p>

      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => setChoice(o.id)}
          className="w-full text-left rounded-[24px] p-4 flex items-center gap-3.5 transition-all active:scale-[0.99]"
          style={{
            backgroundColor: o.danger && choice === o.id ? '#FEF2F2' : '#FFFFFF',
            border: `1.5px solid ${choice === o.id ? (o.danger ? '#EF4444' : '#7C3AED') : '#EFEFF3'}`,
            boxShadow: '0 1px 2px rgba(15,15,25,0.04), 0 8px 24px -12px rgba(15,15,25,0.08)',
          }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: o.danger ? '#FEF2F2' : '#F5F5F7' }}
          >
            <o.icon size={20} strokeWidth={1.9} style={{ color: o.danger ? '#DC2626' : INK }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14.5px] font-semibold" style={{ color: o.danger ? '#DC2626' : INK }}>
              {o.title}
            </p>
            <p className="text-[12.5px] mt-0.5" style={{ color: MUTED }}>
              {o.subtitle}
            </p>
          </div>
          <Radio selected={choice === o.id} />
        </button>
      ))}

      <div
        className="flex items-start gap-2.5 p-4 rounded-[20px]"
        style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
      >
        <AlertTriangle size={17} strokeWidth={2.1} style={{ color: '#DC2626' }} className="mt-0.5 flex-shrink-0" />
        <p className="text-[12.5px] font-medium" style={{ color: '#B91C1C' }}>
          All your data will be permanently deleted and cannot be recovered.
        </p>
      </div>

      <button
        onClick={submit}
        disabled={busy}
        className="w-full h-[54px] rounded-[18px] text-[15.5px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60"
        style={{ backgroundColor: '#DC2626', boxShadow: '0 12px 28px -12px rgba(220,38,38,0.6)' }}
      >
        Continue
      </button>
    </EditShell>
  );
};

export default DeleteAccountPage;
