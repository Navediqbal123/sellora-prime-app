import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, MonitorSmartphone, Bell, Fingerprint, Loader2, Save } from 'lucide-react';
import { Card, EditShell, MUTED, MenuCard, PurpleButton, Toggle } from './_ui';
import { useMeta } from './useMeta';
import { useProfileRow } from './useProfileRow';

const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const { meta, save, saving } = useMeta();
  const { profile, update, saving: savingProfile, loading } = useProfileRow();
  const [twoFA, setTwoFA] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [appLock, setAppLock] = useState(false);

  useEffect(() => {
    setTwoFA(!!meta.two_factor);
    setAppLock(!!meta.app_lock);
  }, [meta]);

  useEffect(() => {
    if (profile) setAlerts(profile.login_alerts !== false);
  }, [profile?.login_alerts]);

  const toggleAlerts = async (v: boolean) => {
    setAlerts(v);
    const ok = await update({ login_alerts: v }, v ? 'Login alerts enabled.' : 'Login alerts disabled.');
    if (!ok) setAlerts(!v);
  };

  return (
    <EditShell title="Password & Security" subtitle="Keep your account secure" centerTitle>
      <Card className="overflow-hidden">
        <div style={{ borderBottom: '1px solid #F1F1F4' }}>
          <MenuCard
            icon={KeyRound}
            title="Change Password"
            subtitle="Update your password regularly"
            onClick={() => navigate('/profile/edit/password')}
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
            right={
              loading || savingProfile ? (
                <Loader2 size={16} className="animate-spin" style={{ color: MUTED }} />
              ) : (
                <Toggle on={alerts} onChange={toggleAlerts} />
              )
            }
          />
        </div>
        <MenuCard
          icon={Fingerprint}
          title="App Lock"
          subtitle="Protect the app with PIN or Biometrics"
          right={<Toggle on={appLock} onChange={setAppLock} />}
        />
      </Card>

      <PurpleButton disabled={saving} onClick={() => save({ two_factor: twoFA, app_lock: appLock })}>
        {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} strokeWidth={2.25} />}
        Save Changes
      </PurpleButton>
    </EditShell>
  );
};

export default SecurityPage;
