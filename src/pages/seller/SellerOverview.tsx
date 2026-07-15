import React, { useEffect, useState } from 'react';
import {
  Package, Eye, MousePointer, TrendingUp, ArrowUpRight, ArrowRight,
  ShoppingBag, IndianRupee, Clock, CheckCircle2, MoreVertical, ChevronDown, Store,
  ChevronRight, Percent, Calendar, ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ViewsLineChart, ClicksBarChart } from '@/components/seller/SellerAnalyticsCharts';
import { useSellerAnalytics } from '@/hooks/useSellerAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const PURPLE = '#7C3AED';

const Sparkline: React.FC<{ color: string; seed?: number }> = ({ color, seed = 5 }) => {
  const points = Array.from({ length: 8 }, (_, i) => {
    const y = 18 - ((Math.sin(i * 0.9 + seed) + 1) * 6 + Math.random() * 3);
    return `${i * 10},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 70 22" className="w-full h-6 mt-2 opacity-90">
      <polyline fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
};

const SellerOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading } = useSellerAnalytics();
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [earnings, setEarnings] = useState({ total: 0, orders: 0, pending: 0, completed: 0 });
  const [filter, setFilter] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: s } = await supabase
        .from('sellers')
        .select('id, shop_name, owner_name, status')
        .eq('user_id', user.id)
        .maybeSingle();
      if (s) {
        setShopName(s.shop_name || 'My Shop');
        setOwnerName(s.owner_name || '');
        setSellerId(s.id);
        setIsLive(s.status !== 'paused' && s.status !== 'blocked');
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!sellerId) return;
    (async () => {
      const { data: orders } = await supabase
        .from('orders').select('id,status,product_id').eq('seller_id', sellerId);
      const list = orders || [];
      const completed = list.filter((o) => o.status === 'completed');
      const pending = list.filter((o) => o.status === 'pending' || o.status === 'ready');
      const ids = [...new Set(list.map((o) => o.product_id))];
      let pm: Record<string, number> = {};
      if (ids.length) {
        const { data: prods } = await supabase.from('products').select('id,price').in('id', ids);
        (prods || []).forEach((p: any) => { pm[p.id] = p.price || 0; });
      }
      setEarnings({
        total: completed.reduce((s, o) => s + (pm[o.product_id] || 0), 0),
        orders: list.length,
        pending: pending.reduce((s, o) => s + (pm[o.product_id] || 0), 0),
        completed: completed.length,
      });
    })();
  }, [sellerId]);

  const toggleLive = async () => {
    const next = !isLive;
    setIsLive(next);
    try {
      await supabase.from('sellers')
        .update({ status: next ? 'approved' : 'paused' })
        .eq('user_id', user!.id);
      toast({ title: next ? 'Shop is Live ✨' : 'Shop Paused', description: next ? 'Buyers can now see your shop.' : 'Your shop is temporarily hidden.' });
    } catch (e) {
      setIsLive(!next);
      toast({ title: 'Could not update status', variant: 'destructive' });
    }
  };

  const stats = [
    {
      label: 'Total Products', value: data.totalProducts, icon: Package, pct: '+12.5%',
      numColor: '#c084fc',
      iconGrad: 'linear-gradient(135deg,#a855f7,#7C3AED)',
      cardGrad: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.04) 60%, rgba(255,255,255,0.02) 100%)',
      glow: 'rgba(124,58,237,0.35)',
      borderC: 'rgba(124,58,237,0.35)',
    },
    {
      label: 'Total Views', value: data.totalViews, icon: Eye, pct: '+18.7%',
      numColor: '#60a5fa',
      iconGrad: 'linear-gradient(135deg,#60a5fa,#1d4ed8)',
      cardGrad: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.04) 60%, rgba(255,255,255,0.02) 100%)',
      glow: 'rgba(59,130,246,0.35)',
      borderC: 'rgba(59,130,246,0.35)',
    },
    {
      label: 'Total Clicks', value: data.totalClicks, icon: MousePointer, pct: '+14.3%',
      numColor: '#fb923c',
      iconGrad: 'linear-gradient(135deg,#fb923c,#c2410c)',
      cardGrad: 'linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.04) 60%, rgba(255,255,255,0.02) 100%)',
      glow: 'rgba(249,115,22,0.35)',
      borderC: 'rgba(249,115,22,0.35)',
    },
    {
      label: 'Conversion Rate', value: `${data.conversionRate}%`, icon: Percent, pct: '+5.6%',
      numColor: '#5eead4',
      iconGrad: 'linear-gradient(135deg,#2dd4bf,#0f766e)',
      cardGrad: 'linear-gradient(135deg, rgba(20,184,166,0.18) 0%, rgba(20,184,166,0.04) 60%, rgba(255,255,255,0.02) 100%)',
      glow: 'rgba(20,184,166,0.35)',
      borderC: 'rgba(20,184,166,0.35)',
    },
  ];

  const earnCards = [
    { label: 'Total Earnings', value: `₹${earnings.total.toLocaleString()}`, icon: IndianRupee, pct: '+18%', color: '#a78bfa', bg: 'rgba(124,58,237,0.12)' },
    { label: 'Total Orders', value: earnings.orders, icon: ShoppingBag, pct: '+9%', color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
    { label: 'Pending', value: `₹${earnings.pending.toLocaleString()}`, icon: Clock, pct: '+3%', color: '#fb923c', bg: 'rgba(249,115,22,0.12)' },
    { label: 'Completed', value: earnings.completed, icon: CheckCircle2, pct: '+22%', color: '#34d399', bg: 'rgba(16,185,129,0.12)' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0a0613', color: '#fff' }}>
      <div className="px-4 py-5 space-y-6 max-w-7xl mx-auto lg:px-8 lg:py-8">
        {/* HEADER */}
        <header className="flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Sellora S logo — filled gradient tile with bold S */}
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg,#c084fc 0%,#a855f7 45%,#6d28d9 100%)',
                boxShadow: '0 10px 24px -8px rgba(124,58,237,0.8), inset 0 1px 0 rgba(255,255,255,0.35)',
              }}
              aria-label="Sellora"
            >
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M24 9.5 C22 7.5 19 6.5 16 6.5 C11 6.5 7.5 9 7.5 12.5 C7.5 16 11 17 16 17.8 C21 18.6 24.5 19.6 24.5 23.2 C24.5 26.7 21 29 16 29 C12.5 29 9.5 28 7.5 26"
                  stroke="#ffffff"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-[15px] font-bold truncate leading-tight">{shopName || 'My Shop'}</h1>
              <p className="text-[10.5px] text-white/50 leading-tight">Sellora Seller Hub</p>
            </div>
          </div>

          {/* Shop Live toggle */}
          <button
            onClick={toggleLive}
            className="flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 rounded-full border transition-all flex-shrink-0"
            style={{
              background: isLive ? 'rgba(16,185,129,0.10)' : 'rgba(255,255,255,0.04)',
              borderColor: isLive ? 'rgba(16,185,129,0.45)' : 'rgba(255,255,255,0.1)',
              boxShadow: isLive ? '0 0 24px -4px rgba(16,185,129,0.45)' : 'none',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isLive ? '#10b981' : '#6b7280',
                boxShadow: isLive ? '0 0 10px 2px rgba(16,185,129,0.85)' : 'none',
              }}
            />
            <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: isLive ? '#6ee7b7' : 'rgba(255,255,255,0.5)' }}>
              {isLive ? 'Shop Live' : 'Paused'}
            </span>
            <span
              className="relative w-9 h-5 rounded-full transition-all flex-shrink-0"
              style={{ background: isLive ? '#10b981' : 'rgba(255,255,255,0.15)' }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow"
                style={{ left: isLive ? 'calc(100% - 18px)' : '2px' }}
              />
            </span>
          </button>
        </header>

        {/* WELCOME */}
        <section className="flex items-start justify-between gap-3 animate-fade-in">
          <div className="min-w-0">
            <h2 className="text-xl font-bold leading-tight">
              Welcome back, {ownerName?.split(' ')[0] || 'Seller'}! <span className="inline-block">👋</span>
            </h2>
            <p className="text-xs text-white/50 mt-1">Here's what's happening with your store today.</p>
          </div>
          <div className="relative shrink-0">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/60" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="appearance-none pl-8 pr-8 py-2.5 text-xs rounded-xl border bg-white/[0.04] text-white outline-none cursor-pointer"
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/60" />
          </div>
        </section>

        {/* STATS 2x2 */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 animate-fade-in">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-2xl p-4 border transition-transform hover:-translate-y-0.5"
              style={{
                background: s.cardGrad,
                borderColor: s.borderC,
                boxShadow: `0 14px 40px -18px ${s.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: s.iconGrad,
                    boxShadow: `0 8px 22px -6px ${s.glow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                  }}
                >
                  <s.icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-white/70 truncate">{s.label}</p>
                  <p className="mt-1 text-[34px] leading-none font-black tracking-tight" style={{ color: s.numColor }}>
                    {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="min-w-0">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.14)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.35)' }}
                  >
                    <ArrowUpRight className="w-3 h-3" /> {s.pct}
                  </span>
                  <p className="text-[10px] text-white/50 mt-1">vs last week</p>
                </div>
                <button
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.borderC}`, color: s.numColor }}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* EARNINGS OVERVIEW */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <IndianRupee className="w-4 h-4" style={{ color: '#a78bfa' }} />
              Earnings Overview
            </h3>
            <button className="text-[11px] text-white/50 hover:text-white flex items-center gap-1">
              See all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {earnCards.map((c, i) => (
              <div
                key={c.label}
                className="rounded-2xl p-3 border"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.bg }}>
                    <c.icon className="w-4 h-4" style={{ color: c.color }} />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}>
                    {c.pct}
                  </span>
                </div>
                <p className="mt-2 text-lg font-bold text-white tracking-tight">{c.value}</p>
                <p className="text-[10px] text-white/50">{c.label}</p>
                <Sparkline color={c.color} seed={i + 1} />
              </div>
            ))}
          </div>
        </section>

        {/* CHARTS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            className="rounded-2xl p-4 border"
            style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <h3 className="text-sm font-bold mb-2">Views Over Time</h3>
            <ViewsLineChart data={data.viewsOverTime} loading={false} />
          </div>
          <div
            className="rounded-2xl p-4 border"
            style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <h3 className="text-sm font-bold mb-2">Clicks Per Product</h3>
            <ClicksBarChart data={data.clicksPerProduct} loading={false} />
          </div>
        </section>

        {/* RECENT PRODUCTS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Package className="w-4 h-4" style={{ color: '#a78bfa' }} />
              Recent Products
            </h3>
            <button className="text-[11px] text-white/50 hover:text-white flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {data.products.length === 0 ? (
            <div
              className="rounded-2xl p-8 border text-center text-sm text-white/50"
              style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              No products yet. Add your first product to get started!
            </div>
          ) : (
            <div className="space-y-2">
              {data.products.slice(0, 5).map((p: any) => {
                const stock = p.stock ?? p.quantity ?? 10;
                const lowStock = stock < 5;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-2xl border transition-all hover:border-[rgba(124,58,237,0.4)]"
                    style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="w-5 h-5 text-white/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={
                            lowStock
                              ? { background: 'rgba(249,115,22,0.18)', color: '#fdba74' }
                              : { background: 'rgba(16,185,129,0.18)', color: '#6ee7b7' }
                          }
                        >
                          {lowStock ? 'Low Stock' : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs font-bold mt-0.5" style={{ color: '#a78bfa' }}>
                        ₹{Number(p.price || 0).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-white/50">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.views || 0}</span>
                        <span className="flex items-center gap-1"><MousePointer className="w-3 h-3" />{p.clicks || 0}</span>
                        <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" />{p.orders_count || 0}</span>
                      </div>
                    </div>

                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SellerOverview;
