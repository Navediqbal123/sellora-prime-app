import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ticket, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SubPageShell, EmptyCard } from './_shared';

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  expires_at: string;
  description?: string;
}

const CouponsPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from('coupons')
        .select('*')
        .eq('user_id', user.id)
        .order('expires_at', { ascending: true });
      setItems((data as Coupon[]) || []);
      setLoading(false);
    })();
  }, [user?.id]);

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Code copied', description: code });
  };

  return (
    <SubPageShell title="My Coupons">
      {loading ? (
        <EmptyCard text="Loading..." />
      ) : items.length === 0 ? (
        <EmptyCard text="No coupons available." />
      ) : (
        <div className="space-y-3">
          {items.map((c) => {
            const expired = new Date(c.expires_at) < new Date();
            return (
              <div
                key={c.id}
                className={`relative card-premium p-4 flex items-center gap-4 overflow-hidden ${
                  expired ? 'opacity-60' : ''
                }`}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-[hsl(280,80%,50%)] flex items-center justify-center text-primary-foreground">
                  <Ticket className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground text-lg leading-none">{c.discount_percent}% OFF</p>
                    {expired && <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">Expired</span>}
                  </div>
                  {c.description && <p className="text-xs text-muted-foreground mt-1 truncate">{c.description}</p>}
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Expires {new Date(c.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => copy(c.code)}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg border border-dashed border-primary/40 hover:bg-primary/10 transition-colors"
                >
                  <span className="text-xs font-bold text-primary tracking-wider">{c.code}</span>
                  <Copy className="w-3 h-3 text-primary" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </SubPageShell>
  );
};

export default CouponsPage;