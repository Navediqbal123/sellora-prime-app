import React, { useEffect, useState } from 'react';
import { Smartphone, Monitor, Globe, Clock, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Card, EditShell, INK, MUTED, PurpleButton } from './profile/edit/_ui';

const LoginHistoryPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [device, setDevice] = useState('Unknown device');
  const [isMobile, setIsMobile] = useState(false);
  const [loginAt, setLoginAt] = useState<string>('');
  const [country, setCountry] = useState('Locating…');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      setHasSession(!!session);

      const ua = navigator.userAgent;
      const mobile = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(ua);
      setIsMobile(mobile);
      const os = /Android/i.test(ua) ? 'Android' :
        /iPhone|iPad|iPod/i.test(ua) ? 'iOS' :
        /Mac OS X/i.test(ua) ? 'macOS' :
        /Windows/i.test(ua) ? 'Windows' :
        /Linux/i.test(ua) ? 'Linux' : 'Unknown OS';
      const browser = /Edg\//i.test(ua) ? 'Edge' :
        /Chrome\//i.test(ua) ? 'Chrome' :
        /Safari\//i.test(ua) ? 'Safari' :
        /Firefox\//i.test(ua) ? 'Firefox' : 'Browser';
      setDevice(`${mobile ? 'Mobile' : 'Desktop'} · ${os} · ${browser}`);

      if (session) {
        const issuedAtSec = session.expires_at && session.expires_in
          ? session.expires_at - session.expires_in
          : null;
        const when = issuedAtSec ? new Date(issuedAtSec * 1000) : new Date();
        setLoginAt(
          when.toLocaleString(undefined, {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          }),
        );
      }
      setLoading(false);

      try {
        const res = await fetch('https://ipapi.co/json/');
        const json = await res.json();
        setCountry(json?.country_name ? `${json.country_name}${json.city ? ` · ${json.city}` : ''}` : 'Unknown');
      } catch {
        setCountry('Unknown');
      }
    };
    load();
  }, []);

  const signOutAll = async () => {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    setSigningOut(false);
    if (error) {
      toast({ title: 'Sign out failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Signed out', description: 'You have been signed out on all devices.' });
    window.location.href = '/auth';
  };

  const DeviceIcon = isMobile ? Smartphone : Monitor;

  return (
    <EditShell title="Active Sessions" subtitle="Devices currently signed in" centerTitle>
      {loading ? (
        <Card className="p-8 flex items-center justify-center">
          <Loader2 size={18} className="animate-spin" style={{ color: MUTED }} />
        </Card>
      ) : !hasSession ? (
        <Card className="p-6">
          <p className="text-[14px]" style={{ color: MUTED }}>No active session found.</p>
        </Card>
      ) : (
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5F5F7' }}>
              <DeviceIcon size={22} strokeWidth={1.9} style={{ color: INK }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[15px] font-bold truncate" style={{ color: INK }}>{device}</p>
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}
                >
                  Current Session
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock size={15} strokeWidth={1.9} style={{ color: MUTED }} />
                  <p className="text-[13px]" style={{ color: MUTED }}>{loginAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={15} strokeWidth={1.9} style={{ color: MUTED }} />
                  <p className="text-[13px]" style={{ color: MUTED }}>{country}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <PurpleButton disabled={signingOut || !hasSession} onClick={signOutAll}>
        {signingOut ? <Loader2 size={17} className="animate-spin" /> : <LogOut size={17} strokeWidth={2.25} />}
        Sign Out All Devices
      </PurpleButton>
    </EditShell>
  );
};

export default LoginHistoryPage;
