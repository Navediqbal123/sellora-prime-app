import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface ProfileRow {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone_number?: string | null;
  phone_verified?: boolean | null;
  kyc_status?: string | null;
  kyc_document_url?: string | null;
  login_alerts?: boolean | null;
  is_active?: boolean | null;
}

export const useProfileRow = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    setProfile((data as ProfileRow) || null);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(
    async (patch: Partial<ProfileRow>, message?: string) => {
      if (!user?.id) return false;
      setSaving(true);
      try {
        const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
        if (error) throw error;
        setProfile((p) => ({ ...(p || ({ id: user.id } as ProfileRow)), ...patch }));
        if (message) toast({ title: 'Saved', description: message });
        return true;
      } catch (e: any) {
        toast({ title: 'Save failed', description: e?.message || 'Try again.', variant: 'destructive' });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [user?.id],
  );

  return { user, profile, loading, saving, update, refresh };
};
