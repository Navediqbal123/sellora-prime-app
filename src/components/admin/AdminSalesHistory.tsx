import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Receipt,
  ShoppingBag,
  Store,
  Trash2,
  RotateCcw,
  Loader2,
} from 'lucide-react';

interface SaleRecord {
  id: string;
  created_at: string;
  deleted_at?: string | null;
  product_title: string;
  product_price: number;
  buyer_name: string;
  seller_id: string;
}

interface SellerGroup {
  seller_id: string;
  shop_name: string;
  sales: SaleRecord[];
}

const AdminSalesHistory = () => {
  const [groups, setGroups] = useState<SellerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const fetchSales = async () => {
    try {
      // Fetch all completed orders (including soft-deleted for admin)
      let query = supabase
        .from('orders')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (!showDeleted) {
        query = query.is('deleted_at', null);
      }

      const { data: orders, error } = await query;
      if (error) throw error;
      if (!orders || orders.length === 0) { setGroups([]); setLoading(false); return; }

      // Fetch sellers, products, buyers in parallel
      const sellerIds = [...new Set(orders.map((o: any) => o.seller_id))];
      const productIds = [...new Set(orders.map((o: any) => o.product_id).filter(Boolean))];
      const buyerIds = [...new Set(orders.map((o: any) => o.buyer_id).filter(Boolean))];

      const [{ data: sellers }, { data: products }, { data: profiles }] = await Promise.all([
        supabase.from('sellers').select('id, shop_name').in('id', sellerIds),
        productIds.length > 0
          ? supabase.from('products').select('id, title, price').in('id', productIds)
          : Promise.resolve({ data: [] }),
        buyerIds.length > 0
          ? supabase.from('profiles').select('id, full_name, email').in('id', buyerIds)
          : Promise.resolve({ data: [] }),
      ]);

      const sellerMap: Record<string, string> = {};
      (sellers || []).forEach((s: any) => { sellerMap[s.id] = s.shop_name; });

      const productMap: Record<string, { title: string; price: number }> = {};
      (products || []).forEach((p: any) => { productMap[p.id] = { title: p.title, price: p.price }; });

      const profileMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p.full_name || p.email || 'Unknown'; });

      // Group by seller
      const groupMap: Record<string, SellerGroup> = {};
      orders.forEach((o: any) => {
        if (!groupMap[o.seller_id]) {
          groupMap[o.seller_id] = {
            seller_id: o.seller_id,
            shop_name: sellerMap[o.seller_id] || 'Unknown Seller',
            sales: [],
          };
        }
        groupMap[o.seller_id].sales.push({
          id: o.id,
          created_at: o.created_at,
          deleted_at: o.deleted_at,
          product_title: productMap[o.product_id]?.title || 'Unknown Product',
          product_price: productMap[o.product_id]?.price || 0,
          buyer_name: profileMap[o.buyer_id] || 'Unknown',
          seller_id: o.seller_id,
        });
      });

      setGroups(Object.values(groupMap));
    } catch (err) {
      console.error('Error fetching admin sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [showDeleted]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('admin-sales-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchSales();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [showDeleted]);

  const handleSoftDelete = async (orderId: string) => {
    setActionId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      toast({ title: 'Deleted', description: 'Sale record soft-deleted' });
      fetchSales();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionId(null);
    }
  };

  const handleRestore = async (orderId: string) => {
    setActionId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ deleted_at: null })
        .eq('id', orderId);

      if (error) throw error;
      toast({ title: 'Restored', description: 'Sale record restored' });
      fetchSales();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionId(null);
    }
  };

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const totalSales = groups.reduce((sum, g) => sum + g.sales.length, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Sales <span className="text-gradient">History</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {totalSales} sale{totalSales !== 1 ? 's' : ''} across {groups.length} seller{groups.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleted(!showDeleted)}
          className="border-border/50 text-sm"
        >
          {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 animate-float">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">No sales history</h3>
          <p className="text-muted-foreground text-sm">Completed orders will appear here.</p>
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {groups.map((group) => (
            <AccordionItem
              key={group.seller_id}
              value={group.seller_id}
              className="glass-card rounded-xl border-border/50 overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Store className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-foreground">{group.shop_name}</h3>
                    <p className="text-[11px] text-muted-foreground">
                      {group.sales.length} sale{group.sales.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-2">
                  {group.sales.map((sale) => {
                    const date = new Date(sale.created_at);
                    const isDeleted = !!sale.deleted_at;
                    const isActioning = actionId === sale.id;

                    return (
                      <div
                        key={sale.id}
                        className={`rounded-lg p-3 flex items-center gap-3 transition-all duration-200 ${
                          isDeleted
                            ? 'bg-destructive/5 border border-destructive/20 opacity-60'
                            : 'bg-secondary/30 hover:bg-secondary/50'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-md bg-sellora-success/10 flex items-center justify-center flex-shrink-0">
                          <Receipt className="w-3.5 h-3.5 text-sellora-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-semibold text-foreground truncate">
                              {sale.product_title}
                            </h4>
                            <span className="text-xs font-bold text-sellora-gold whitespace-nowrap">
                              ₹{sale.product_price?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className="text-[10px] text-muted-foreground truncate">
                              Buyer: {sale.buyer_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground/70 whitespace-nowrap">
                              {formatDay(sale.created_at)} • {date.toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Delete / Restore */}
                        <div className="flex-shrink-0">
                          {isDeleted ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-sellora-success hover:bg-sellora-success/10"
                              onClick={() => handleRestore(sale.id)}
                              disabled={isActioning}
                            >
                              {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => handleSoftDelete(sale.id)}
                              disabled={isActioning}
                            >
                              {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default AdminSalesHistory;
