import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

interface EarningsData {
  totalEarnings: number;
  totalOrders: number;
  pendingEarnings: number;
  completedOrders: number;
}

const EarningsSection = () => {
  const { user } = useAuth();
  const [data, setData] = useState<EarningsData>({
    totalEarnings: 0,
    totalOrders: 0,
    pendingEarnings: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user) return;

      try {
        // Get seller id
        const { data: seller } = await supabase
          .from('sellers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!seller) return;

        // Fetch orders for this seller
        const { data: orders } = await supabase
          .from('orders')
          .select('id, status, product_id')
          .eq('seller_id', seller.id);

        const orderList = orders || [];
        const completedOrders = orderList.filter(o => o.status === 'completed');
        const pendingOrders = orderList.filter(o => o.status === 'pending' || o.status === 'ready');

        // Fetch product prices for completed orders
        const productIds = [...new Set(orderList.map(o => o.product_id))];
        let priceMap: Record<string, number> = {};

        if (productIds.length > 0) {
          const { data: products } = await supabase
            .from('products')
            .select('id, price')
            .in('id', productIds);

          (products || []).forEach((p: any) => {
            priceMap[p.id] = p.price || 0;
          });
        }

        const totalEarnings = completedOrders.reduce((sum, o) => sum + (priceMap[o.product_id] || 0), 0);
        const pendingEarnings = pendingOrders.reduce((sum, o) => sum + (priceMap[o.product_id] || 0), 0);

        setData({
          totalEarnings,
          totalOrders: orderList.length,
          pendingEarnings,
          completedOrders: completedOrders.length,
        });
      } catch (err) {
        console.error('Error fetching earnings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [user]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Earnings',
      value: `₹${data.totalEarnings.toLocaleString()}`,
      icon: IndianRupee,
      color: 'from-[hsl(var(--sellora-gold))]/20 to-[hsl(var(--sellora-gold))]/5',
      iconColor: 'text-[hsl(var(--sellora-gold))]',
    },
    {
      label: 'Total Orders',
      value: data.totalOrders,
      icon: ShoppingBag,
      color: 'from-primary/20 to-primary/5',
      iconColor: 'text-primary',
    },
    {
      label: 'Pending Revenue',
      value: `₹${data.pendingEarnings.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-accent/20 to-accent/5',
      iconColor: 'text-accent',
    },
    {
      label: 'Completed',
      value: data.completedOrders,
      icon: ArrowUpRight,
      color: 'from-[hsl(var(--sellora-success))]/20 to-[hsl(var(--sellora-success))]/5',
      iconColor: 'text-[hsl(var(--sellora-success))]',
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <IndianRupee className="w-5 h-5 text-[hsl(var(--sellora-gold))]" />
        Earnings Overview
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${stat.color} border border-border/30 transition-all duration-300 hover:scale-[1.02]`}
          >
            <stat.icon className={`w-5 h-5 ${stat.iconColor} mb-2`} />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarningsSection;
