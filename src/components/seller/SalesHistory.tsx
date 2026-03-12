import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt, ShoppingBag } from 'lucide-react';

interface SaleRecord {
  id: string;
  created_at: string;
  product?: { title: string; price: number };
  buyer_profile?: { full_name?: string; email?: string };
}

const SalesHistory = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    if (!user) return;

    try {
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!seller) { setLoading(false); return; }

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', seller.id)
        .eq('status', 'completed')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (!orders || orders.length === 0) {
        setSales([]);
        setLoading(false);
        return;
      }

      // Fetch product & buyer info
      const productIds = [...new Set(orders.map((o: any) => o.product_id).filter(Boolean))];
      const buyerIds = [...new Set(orders.map((o: any) => o.buyer_id).filter(Boolean))];

      const [{ data: products }, { data: profiles }] = await Promise.all([
        productIds.length > 0
          ? supabase.from('products').select('id, title, price').in('id', productIds)
          : Promise.resolve({ data: [] }),
        buyerIds.length > 0
          ? supabase.from('profiles').select('id, full_name, email').in('id', buyerIds)
          : Promise.resolve({ data: [] }),
      ]);

      const productMap: Record<string, { title: string; price: number }> = {};
      (products || []).forEach((p: any) => { productMap[p.id] = { title: p.title, price: p.price }; });

      const profileMap: Record<string, { full_name?: string; email?: string }> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.id] = { full_name: p.full_name, email: p.email }; });

      setSales(orders.map((o: any) => ({
        id: o.id,
        created_at: o.created_at,
        product: productMap[o.product_id] || { title: 'Unknown', price: 0 },
        buyer_profile: profileMap[o.buyer_id] || { email: 'Unknown' },
      })));
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('seller-sales-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchSales();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-foreground">
          Sales <span className="text-gradient">History</span>
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {sales.length} completed sale{sales.length !== 1 ? 's' : ''}
        </p>
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 animate-float">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">No sales yet</h3>
          <p className="text-muted-foreground text-sm">Completed orders will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sales.map((sale, index) => {
            const date = new Date(sale.created_at);
            return (
              <div
                key={sale.id}
                className="glass-card rounded-xl p-3 animate-fade-in-up hover:border-primary/20 transition-all duration-300"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sellora-success/20 to-accent/10 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-4 h-4 text-sellora-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {sale.product?.title}
                      </h4>
                      <span className="text-sm font-bold text-sellora-gold whitespace-nowrap">
                        ₹{sale.product?.price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-[11px] text-muted-foreground truncate">
                        Buyer: {sale.buyer_profile?.full_name || sale.buyer_profile?.email || 'Unknown'}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 whitespace-nowrap">
                        {formatDay(sale.created_at)} • {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
