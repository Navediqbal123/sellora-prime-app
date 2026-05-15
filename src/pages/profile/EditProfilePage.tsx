import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Camera, Loader2 } from 'lucide-react';
import { SubPageShell } from './_shared';

const EditProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      const p = data as any;
      setFullName(p?.full_name || (user.user_metadata as any)?.full_name || '');
      setPhone(p?.phone || (user.user_metadata as any)?.phone || '');
      setAvatarUrl(p?.avatar_url || (user.user_metadata as any)?.avatar_url);
      setLoading(false);
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
      toast({ title: 'Photo uploaded', description: 'Click Save to apply.' });
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
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            email: user.email,
            full_name: fullName,
            phone,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
      await supabase.auth.updateUser({ data: { full_name: fullName, phone, avatar_url: avatarUrl } });
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
      navigate('/profile');
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

  return (
    <SubPageShell title="Edit Profile">
      <div className="card-premium p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-[hsl(280,80%,50%)] flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-glow overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md border-2 border-background"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-xs text-muted-foreground">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="mt-1.5 h-11"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
            <Input id="email" value={user?.email || ''} disabled className="mt-1.5 h-11 opacity-70" />
          </div>
          <div>
            <Label htmlFor="phone" className="text-xs text-muted-foreground">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="mt-1.5 h-11"
              disabled={loading}
            />
          </div>
        </div>

        <Button className="btn-glow w-full mt-6 h-11 text-white" onClick={handleSave} disabled={saving || loading}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>
    </SubPageShell>
  );
};

export default EditProfilePage;