import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageBackButton from '@/components/PageBackButton';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ClipboardList,
  CheckCircle2,
  Package,
  Clock,
  Loader2,
  ShoppingBag,
} from 'lucide-react';

interface OrderRow {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  pickup_code: string;
  status: string;
  shop_address: string;
  shop_name: string;
  created_at: string;
  product?: { title: string; image_url?: string; price: number };
  buyer_profile?: { full_name?: string; email?: string };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending',
    color: 'bg-sellora-warning/10 text-sellora-warning border-sellora-warning/20',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  ready: {
    label: 'Ready for Pickup',
    color: 'bg-primary/10 text-primary border-primary/20',
    icon: <Package className="w-3.5 h-3.5" />,
  },
  completed: {
    label: 'Completed',
    color: 'bg-sellora-success/10 text-sellora-success border-sellora-success/20',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: <ClipboardList className="w-3.5 h-3.5" />,
  },
};

const SellerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get seller ID first
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!seller) {
        setLoading(false);
        return;
      }

      // Fetch orders without FK join to avoid schema cache issues
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch product details separately
      const productIds = [...new Set((data || []).map((o: any) => o.product_id).filter(Boolean))];
      let productMap: Record<string, { title: string; image_url?: string; price: number }> = {};
      if (productIds.length > 0) {
        const { data: prods } = await supabase
          .from('products')
          .select('id, title, image_url, price')
          .in('id', productIds);
        (prods || []).forEach((p: any) => {
          productMap[p.id] = { title: p.title, image_url: p.image_url, price: p.price };
        });
      }

      // Fetch buyer profiles
      const buyerIds = [...new Set((data || []).map((o: any) => o.buyer_id))];
      let profiles: Record<string, { full_name?: string; email?: string }> = {};

      if (buyerIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', buyerIds);

        if (profileData) {
          profileData.forEach((p: any) => {
            profiles[p.id] = { full_name: p.full_name, email: p.email };
          });
        }
      }

      const ordersWithProfiles = (data || []).map((order: any) => ({
        ...order,
        product: productMap[order.product_id] || null,
        buyer_profile: profiles[order.buyer_id] || { email: 'Unknown' },
      }));

      setOrders(ordersWithProfiles);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      toast({
        title: 'Updated',
        description: `Order marked as ${statusConfig[newStatus]?.label || newStatus}`,
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-10 w-56" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <PageBackButton fallbackPath="/seller/dashboard" />
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-foreground">
          Pickup <span className="text-gradient">Orders</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {orders.length} order{orders.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6 animate-float">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">No orders yet</h3>
          <p className="text-muted-foreground">Orders will appear here when buyers reserve your products.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className="card-premium p-5 animate-fade-in-up hover:border-primary/20 transition-all duration-300"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Product Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary/30 flex-shrink-0">
                      {order.product?.image_url ? (
                        <img
                          src={order.product.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {order.product?.title || 'Unknown Product'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Buyer: {order.buyer_profile?.full_name || order.buyer_profile?.email || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString()} at{' '}
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Pickup Code */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center px-4 py-2 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Pickup Code
                      </p>
                      <p className="text-xl font-mono font-bold text-gradient tracking-wider">
                        {order.pickup_code}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <Badge variant="outline" className={`${config.color} gap-1.5`}>
                      {config.icon}
                      {config.label}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/30 hover:bg-primary/10"
                        onClick={() => updateStatus(order.id, 'ready')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Package className="w-4 h-4 mr-1.5" /> Mark Ready
                          </>
                        )}
                      </Button>
                    )}
                    {(order.status === 'pending' || order.status === 'ready') && (
                      <Button
                        size="sm"
                        className="bg-sellora-success hover:bg-sellora-success/90 text-white"
                        onClick={() => updateStatus(order.id, 'completed')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Completed
                          </>
                        )}
                      </Button>
                    )}
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

export default SellerOrders;
