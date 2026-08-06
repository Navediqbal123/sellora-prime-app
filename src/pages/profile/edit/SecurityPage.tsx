import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, MonitorSmartphone, Bell, Fingerprint, Loader2, Save } from 'lucide-react';
import { Card, EditShell, INK, MUTED, MenuCard, PurpleButton, Toggle } from './_ui';
import { useMeta } from './useMeta';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, meta, save, saving } = useMeta();
  const [twoFA, setTwoFA] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [appLock, setAppLock] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setTwoFA(!!meta.two_factor);
    setAlerts(meta.login_alerts !== false);
    setAppLock(!!meta.app_lock);
  }, [meta]);

  const changePassword = async () => {
    if (!user?.email) return;
    setSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: 'Email sent', description: 'Check your inbox to change your password.' });
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.message || 'Try again.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <EditShell title="Password & Security" subtitle="Keep your account secure" centerTitle>
      <Card className="overflow-hidden">
        <div style={{ borderBottom: '1px solid #F1F1F4' }}>
          <MenuCard
            icon={KeyRound}
            title="Change Password"
            subtitle="Update your password regularly"
            onClick={changePassword}
            right={sending ? <Loader2 size={16} className="animate-spin" style={{ color: MUTED }} /> : undefined}
          />
        </div>
        <div style={{ borderBottom: '1px solid #F1F1F4' }}>
          <MenuCard
            icon={ShieldCheck}
            title="Two-Factor Authentication"
            subtitle="Add an extra layer of security"
            right={<Toggle on={twoFA} onChange={setTwoFA} />}
          />
        </div>
        <div style={{ borderBottom: '1px solid #F1F1F4' }}>
          <MenuCard
            icon={MonitorSmartphone}
            title="Active Sessions"
            subtitle="Manage logged-in devices"
            onClick={() => navigate('/login-history')}
          />
        </div>
        <div style={{ borderBottom: '1px solid #F1F1F4' }}>
          <MenuCard
            icon={Bell}
            title="Login Alerts"
            subtitle="Get notified for suspicious logins"
            right={<Toggle on={alerts} onChange={setAlerts} />}
          />
        </div>
        <MenuCard
          icon={Fingerprint}
          title="App Lock"
          subtitle="Protect the app with PIN or Biometrics"
          right={<Toggle on={appLock} onChange={setAppLock} />}
        />
      </Card>

      <PurpleButton
        disabled={saving}
        onClick={() => save({ two_factor: twoFA, login_alerts: alerts, app_lock: appLock })}
      >
        {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} strokeWidth={2.25} />}
        Save Changes
      </PurpleButton>
    </EditShell>
  );
};

export default SecurityPage;
