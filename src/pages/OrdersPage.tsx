import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/home/BottomNav';
import { ShoppingBag, ArrowLeft, MapPin, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OrderRow {
  id: string;
  product_id: string;
  seller_id: string;
  status: string;
  pickup_code?: string | null;
  shop_name?: string | null;
  shop_address?: string | null;
  created_at: string;
  product?: { title: string; image_url?: string; price: number };
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  ready: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
};

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();

    const channel = supabase
      .channel('buyer-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `buyer_id=eq.${user.id}` },
        () => fetchOrders(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const productIds = [...new Set((data || []).map((o: any) => o.product_id).filter(Boolean))];
      let productMap: Record<string, any> = {};
      if (productIds.length > 0) {
        const { data: prods } = await supabase
          .from('products')
          .select('id, title, image_url, price')
          .in('id', productIds);
        (prods || []).forEach((p: any) => {
          productMap[p.id] = { title: p.title, image_url: p.image_url, price: p.price };
        });
      }
      setOrders((data || []).map((o: any) => ({ ...o, product: productMap[o.product_id] })));
    } catch (e: any) {
      console.error('Orders fetch error', e);
      toast({ title: 'Error', description: e.message || 'Failed to load orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast({ title: 'Copied!', description: 'Pickup code copied' });
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="bg-background min-h-screen pb-24 md:pb-8">
      <div className="container mx-auto px-4 pt-5 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" /> My Orders
            </h1>
            <p className="text-xs text-muted-foreground">{orders.length} reservations</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-card border border-border/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">No orders yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Reserve a product and your pickup code will appear here.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
            >
              Browse products
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => navigate(`/product/${o.product_id}`)}
                className="w-full text-left bg-card border border-border/60 rounded-2xl p-3 hover:border-primary/40 transition-all duration-300"
              >
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                    {o.product?.image_url ? (
                      <img src={o.product.image_url} alt={o.product?.title || 'Product'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                        {o.product?.title || 'Product'}
                      </h3>
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                          statusStyles[o.status] || 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                    {o.product?.price !== undefined && (
                      <p className="text-sm font-bold text-primary mt-0.5">₹{o.product.price}</p>
                    )}
                    {o.shop_name && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" /> {o.shop_name}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {o.pickup_code && o.status !== 'completed' && o.status !== 'cancelled' && (
                  <div
                    onClick={(e) => { e.stopPropagation(); copyCode(o.pickup_code!); }}
                    className="mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 cursor-pointer"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">Pickup Code</p>
                      <p className="text-lg font-bold text-primary tracking-widest">{o.pickup_code}</p>
                    </div>
                    {copied === o.pickup_code ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-primary" />
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default OrdersPage;