import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Smartphone, Monitor, MapPin, Clock, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const INK = '#111111';
const MUTED = '#6B7280';
const PURPLE = '#7C3AED';

const LoginHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [device, setDevice] = useState('Unknown device');
  const [isMobile, setIsMobile] = useState(false);
  const [loginAt, setLoginAt] = useState<string>('');
  const [location, setLocation] = useState('Locating…');

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
        setLocation(json?.country_name ? `${json.country_name}${json.city ? `, ${json.city}` : ''}` : 'Unknown');
      } catch {
        setLocation('Unknown');
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
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-2xl mx-auto px-5 pt-5 pb-16">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="w-10 h-10 -ml-1.5 rounded-full flex items-center justify-center transition-transform active:scale-90"
          >
            <ArrowLeft size={22} strokeWidth={2} style={{ color: INK }} />
          </button>
          <h1 className="flex-1 text-center text-[20px] font-bold tracking-tight" style={{ color: INK }}>
            Active Sessions
          </h1>
          <div className="w-10" />
        </div>
        <p className="text-center text-[13.5px] mt-1 mb-6" style={{ color: MUTED }}>
          Devices currently signed in
        </p>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 size={18} className="animate-spin" style={{ color: MUTED }} />
          </div>
        ) : !hasSession ? (
          <div
            className="rounded-[18px] p-6 text-center"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
          >
            <p className="text-[14px]" style={{ color: MUTED }}>No active session found.</p>
          </div>
        ) : (
          <div className="animate-fade-in-up space-y-6">
            {/* Current device */}
            <div
              className="rounded-[20px] p-4 flex gap-4"
              style={{
                backgroundColor: '#FAF7FF',
                border: '1px solid #DCCCFB',
                boxShadow: '0 1px 2px rgba(15,15,25,0.03), 0 16px 34px -26px rgba(124,58,237,0.45)',
              }}
            >
              <div
                className="w-[62px] h-[86px] rounded-[16px] flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE4FD' }}
              >
                <DeviceIcon size={34} strokeWidth={1.5} style={{ color: INK }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold tracking-tight" style={{ color: INK }}>{device}</p>
                <span
                  className="inline-block mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: '#ECFDF5', color: '#16A34A' }}
                >
                  Current Session
                </span>
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Clock size={14} strokeWidth={1.8} style={{ color: MUTED }} />
                    <p className="text-[12.5px]" style={{ color: MUTED }}>{loginAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} strokeWidth={1.8} style={{ color: MUTED }} />
                    <p className="text-[12.5px]" style={{ color: MUTED }}>{location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security card */}
            <button
              onClick={signOutAll}
              disabled={signingOut}
              className="w-full rounded-[18px] p-4 flex items-center gap-3.5 text-left transition-transform active:scale-[0.99]"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(15,15,25,0.03)' }}
            >
              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5F0FF' }}>
                <ShieldCheck size={20} strokeWidth={1.8} style={{ color: PURPLE }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold" style={{ color: INK }}>Don't recognize a device?</p>
                <p className="text-[12.5px] mt-0.5 leading-relaxed" style={{ color: MUTED }}>
                  Secure your account by signing out from unknown devices.
                </p>
              </div>
              <ArrowRight size={18} strokeWidth={1.9} style={{ color: '#9CA3AF' }} />
            </button>

            {/* Sign out all */}
            <button
              onClick={signOutAll}
              disabled={signingOut}
              className="w-full h-[56px] rounded-[18px] flex items-center justify-center gap-2 text-[15px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
              style={{ backgroundColor: PURPLE, boxShadow: '0 16px 34px -16px rgba(124,58,237,0.7)' }}
            >
              {signingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} strokeWidth={2} />}
              Sign Out All Devices
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginHistoryPage;
