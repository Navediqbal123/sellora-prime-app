import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export type Meta = Record<string, any>;

export const useMeta = () => {
  const { user } = useAuth();
  const [meta, setMeta] = useState<Meta>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMeta((user?.user_metadata || {}) as Meta);
  }, [user?.id, user?.user_metadata]);

  const save = useCallback(
    async (patch: Meta, message = 'Your changes have been saved.') => {
      setSaving(true);
      try {
        const { error } = await supabase.auth.updateUser({ data: patch });
        if (error) throw error;
        setMeta((m) => ({ ...m, ...patch }));
        toast({ title: 'Saved', description: message });
        return true;
      } catch (e: any) {
        toast({ title: 'Save failed', description: e?.message || 'Try again.', variant: 'destructive' });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return { user, meta, save, saving };
};
