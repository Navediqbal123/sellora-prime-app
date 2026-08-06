import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import {
  Camera,
  Pencil,
  User,
  Mail,
  Phone,
  ShieldCheck,
  AtSign,
  PenLine,
  Palette,
  Lock,
  MapPin,
  CreditCard,
  BadgeCheck,
  Trash2,
  CalendarDays,
  Loader2,
  CheckCircle2,
  Save,
  ShieldAlert,
} from 'lucide-react';
import { Card, CARD_SHADOW, EditShell, INK, MUTED, MenuCard, PurpleButton, PURPLE } from './edit/_ui';

const items = [
  { icon: User, title: 'Personal Information', subtitle: 'Your basic information', to: '/profile/edit/personal' },
  { icon: Mail, title: 'Contact Information', subtitle: 'Your contact details', to: '/profile/edit/contact' },
  { icon: Phone, title: 'Change Phone Number', subtitle: 'Update your phone number', to: '/profile/edit/phone' },
  { icon: ShieldCheck, title: 'Password & Security', subtitle: 'Password, 2FA and login settings', to: '/profile/edit/security' },
  { icon: AtSign, title: 'Username / Handle', subtitle: 'Public profile username', to: '/profile/edit/username' },
  { icon: PenLine, title: 'Profile Bio', subtitle: 'Write about yourself', to: '/profile/edit/bio' },
  { icon: Palette, title: 'Profile Theme', subtitle: 'Choose profile accent color', to: '/profile/edit/theme' },
  { icon: Lock, title: 'Privacy Settings', subtitle: 'Manage profile privacy', to: '/profile/edit/privacy' },
  { icon: MapPin, title: 'Default Shipping Address', subtitle: 'Manage addresses', to: '/profile/edit/shipping' },
  { icon: CreditCard, title: 'Payment Preferences', subtitle: 'Choose payment method', to: '/profile/edit/payment' },
  { icon: BadgeCheck, title: 'Verification Status', subtitle: 'Email, Phone, Seller and KYC', to: '/profile/edit/verification' },
  { icon: Trash2, title: 'Delete / Deactivate Account', subtitle: 'Manage account', to: '/profile/edit/delete', danger: true },
];

const EditProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [fullName, setFullName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const meta = (user?.user_metadata || {}) as any;

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const p = (data || {}) as any;
      setFullName(p.full_name || meta.full_name || (user.email ? user.email.split('@')[0] : ''));
      setAvatarUrl(p.avatar_url || meta.avatar_url);
    })();
  }, [user?.id]);

  const handleUpload = async (file: File) => {
    if (!user?.id) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      toast({ title: 'Photo updated', description: 'Tap Save Changes to apply.' });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e?.message || 'Try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await supabase.auth.updateUser({ data: { full_name: fullName, avatar_url: avatarUrl } });
      await supabase.from('profiles').update({ full_name: fullName, avatar_url: avatarUrl }).eq('id', user.id);
      toast({ title: 'Profile saved', description: 'Your changes have been saved.' });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.message || 'Try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const initials = (fullName || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—';

  return (
    <EditShell
      title="Edit Profile"
      subtitle="Manage your personal information"
      right={
        <button
          onClick={() => navigate('/profile/edit/personal')}
          className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full text-[12.5px] font-semibold flex-shrink-0 transition-all active:scale-[0.97]"
          style={{ backgroundColor: '#F3EDFF', color: PURPLE, border: '1px solid #E5D8FF' }}
        >
          <Pencil size={13} strokeWidth={2.25} />
          Edit Profile
        </button>
      }
    >
      {/* Profile header card */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div
              className="w-[84px] h-[84px] rounded-full overflow-hidden flex items-center justify-center text-[22px] font-bold"
              style={{ backgroundColor: '#F3F4F6', color: INK, boxShadow: CARD_SHADOW }}
            >
              {avatarUrl ? <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" /> : initials}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="Change photo"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
              style={{ background: `linear-gradient(135deg, ${PURPLE}, #9F5BFF)`, border: '2px solid #FFFFFF' }}
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin text-white" />
              ) : (
                <Camera size={14} strokeWidth={2.25} className="text-white" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[19px] font-bold truncate" style={{ color: INK }}>
                {fullName || 'Your name'}
              </h2>
              <BadgeCheck size={17} strokeWidth={2.25} style={{ color: PURPLE }} />
            </div>
            <p className="text-[13px] truncate mt-0.5" style={{ color: MUTED }}>
              {user?.email}
            </p>
            <span
              className="inline-flex items-center gap-1 mt-2 px-2.5 h-7 rounded-full text-[11.5px] font-semibold"
              style={{ backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}
            >
              <CheckCircle2 size={12} strokeWidth={2.5} />
              Active Account
            </span>
          </div>
          <div
            className="hidden sm:flex flex-col items-center justify-center px-3 py-2.5 rounded-[16px] flex-shrink-0"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFF3', boxShadow: CARD_SHADOW }}
          >
            <span className="text-[10.5px]" style={{ color: MUTED }}>
              Member Since
            </span>
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold mt-1" style={{ color: INK }}>
              <CalendarDays size={13} strokeWidth={2} style={{ color: PURPLE }} />
              {memberSince}
            </span>
          </div>
        </div>
        <div
          className="sm:hidden mt-4 flex items-center justify-between px-3.5 py-3 rounded-[16px]"
          style={{ backgroundColor: '#F8F8FA', border: '1px solid #EFEFF3' }}
        >
          <span className="text-[12px]" style={{ color: MUTED }}>
            Member Since
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: INK }}>
            <CalendarDays size={13} strokeWidth={2} style={{ color: PURPLE }} />
            {memberSince}
          </span>
        </div>
      </Card>

      {/* Menu */}
      <Card className="overflow-hidden">
        {items.map((it, idx) => (
          <div key={it.title} style={{ borderBottom: idx !== items.length - 1 ? '1px solid #F1F1F4' : 'none' }}>
            <MenuCard
              icon={it.icon}
              title={it.title}
              subtitle={it.subtitle}
              danger={it.danger}
              onClick={() => navigate(it.to)}
            />
          </div>
        ))}
      </Card>

      <div className="pt-1">
        <PurpleButton onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} strokeWidth={2.25} />}
          Save Changes
        </PurpleButton>
        <p className="flex items-center justify-center gap-1.5 text-[12px] mt-3" style={{ color: MUTED }}>
          <ShieldAlert size={13} strokeWidth={2} />
          Your information is encrypted and secure.
        </p>
      </div>
    </EditShell>
  );
};

export default EditProfilePage;
