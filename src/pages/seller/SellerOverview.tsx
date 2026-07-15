import React, { useEffect, useState } from 'react';
import {
  Package, ArrowUpRight, ArrowRight, ArrowLeft, ShoppingBag, IndianRupee,
  Users, Bell, ChevronDown, Store, Sparkles, Plus, Target, ShoppingCart,
  Eye, Heart, MousePointer, Star, XCircle, Trophy,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSellerAnalytics } from '@/hooks/useSellerAnalytics';
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
  const { data } = useSellerAnalytics();
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

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const summary = [
    { label: 'Orders', value: earnings.orders, delta: '+8%', icon: ShoppingBag, tint: '#7C3AED' },
    { label: 'Revenue', value: `₹${earnings.total.toLocaleString()}`, delta: '+12%', icon: IndianRupee, tint: '#059669' },
    { label: 'Products', value: data.totalProducts, delta: '+5%', icon: Package, tint: '#2563eb' },
    { label: 'Visitors', value: data.totalViews, delta: '+9%', icon: Users, tint: '#f59e0b' },
  ];

  // Goal Progress — orders vs target of 30 this month
  const target = 30;
  const progress = Math.min(100, Math.round((earnings.orders / target) * 100));

  // Sample activity items (feature same, UI redesign)
  const activities = [
    { name: 'Rahul Sharma', action: 'placed an order', product: 'Smart Watch Pro', time: '2 min ago', icon: ShoppingCart, color: '#7C3AED' },
    { name: 'Priya Patel', action: 'viewed', product: 'Wireless Headphones', time: '5 min ago', icon: Eye, color: '#2563eb' },
    { name: 'Amit Verma', action: 'added to wishlist', product: 'Gaming Mouse', time: '8 min ago', icon: Heart, color: '#db2777' },
    { name: 'Sneha Reddy', action: 'clicked on', product: 'Bluetooth Speaker', time: '10 min ago', icon: MousePointer, color: '#f59e0b' },
    { name: 'Karan Mehta', action: 'rated', product: 'USB-C Cable', time: '15 min ago', icon: Star, color: '#eab308' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#ffffff', color: '#0f172a' }}>
      <div className="px-4 pt-4 pb-6 space-y-5 max-w-3xl mx-auto lg:px-6 lg:pt-6">
        {/* Back */}
        <button
          onClick={() => navigate('/profile')}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* HEADER — logo + shop name + toggle + notif + filter */}
        <header className="flex items-center gap-3 animate-fade-in">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg,#c084fc 0%,#a855f7 45%,#6d28d9 100%)',
              boxShadow: '0 10px 24px -8px rgba(124,58,237,0.55)',
            }}
          >
            <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
              <path
                d="M24 9.5 C22 7.5 19 6.5 16 6.5 C11 6.5 7.5 9 7.5 12.5 C7.5 16 11 17 16 17.8 C21 18.6 24.5 19.6 24.5 23.2 C24.5 26.7 21 29 16 29 C12.5 29 9.5 28 7.5 26"
                stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[15px] font-bold truncate leading-tight text-slate-900">{shopName || 'My Shop'}</h1>
            <p className="text-[11px] text-slate-500 leading-tight">Sellora Seller Hub</p>
          </div>

          {/* Shop Live pill */}
          <button
            onClick={toggleLive}
            className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full border transition-all flex-shrink-0"
            style={{
              background: isLive ? 'rgba(16,185,129,0.08)' : '#f8fafc',
              borderColor: isLive ? 'rgba(16,185,129,0.35)' : '#e2e8f0',
            }}
            aria-label="Toggle shop live"
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: isLive ? '#10b981' : '#94a3b8', boxShadow: isLive ? '0 0 8px 1px rgba(16,185,129,0.6)' : 'none' }}
            />
            <span className="text-[10px] font-bold" style={{ color: isLive ? '#059669' : '#64748b' }}>
              {isLive ? 'Live' : 'Paused'}
            </span>
            <span
              className="relative w-7 h-4 rounded-full transition-all"
              style={{ background: isLive ? '#10b981' : '#cbd5e1' }}
            >
              <span
                className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                style={{ left: isLive ? 'calc(100% - 14px)' : '2px' }}
              />
            </span>
          </button>

          <button
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-700" />
          </button>
        </header>

        {/* Greeting */}
        <section className="flex items-end justify-between gap-3 animate-fade-in">
          <div className="min-w-0">
            <h2 className="text-[22px] font-bold leading-tight text-slate-900">
              {greeting}, {ownerName?.split(' ')[0] || 'Seller'}! <span>👋</span>
            </h2>
            <p className="text-[13px] text-slate-500 mt-1">Let's grow your business today.</p>
          </div>
          <div className="relative shrink-0">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="appearance-none pl-3 pr-7 py-2 text-[11px] font-semibold rounded-xl border bg-white text-slate-700 outline-none cursor-pointer"
              style={{ borderColor: '#e2e8f0' }}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
          </div>
        </section>

        {/* GOAL PROGRESS CARD */}
        <section
          className="relative overflow-hidden rounded-[26px] p-5 animate-fade-in"
          style={{
            background: 'linear-gradient(135deg,#7C3AED 0%,#8b5cf6 45%,#a855f7 100%)',
            boxShadow: '0 20px 40px -18px rgba(124,58,237,0.55)',
          }}
        >
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                <Target className="w-3 h-3 text-white" />
                <span className="text-[10px] font-bold text-white">Monthly Goal</span>
              </div>
              <h3 className="text-white font-bold text-[17px] mt-2 leading-tight">
                Let's achieve your goal <span>🎯</span>
              </h3>
              <p className="text-[11.5px] text-white/85 mt-1">
                {earnings.orders} of {target} orders. You're doing great — keep it up!
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-white font-black text-[34px] leading-none tracking-tight">{progress}%</p>
              <p className="text-[10px] text-white/80 font-semibold mt-1">Goal Progress</p>
            </div>
          </div>
          <div className="relative z-10 mt-4 h-2 rounded-full bg-white/25 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${progress}%`, boxShadow: '0 0 12px rgba(255,255,255,0.6)' }}
            />
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -right-2 -top-6 w-20 h-20 rounded-full bg-white/10" />
        </section>

        {/* TODAY AT A GLANCE — 4 mini cards */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-slate-900">Today at a glance</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {summary.map((s, i) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white border p-4 transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: '#f1f5f9',
                  boxShadow: '0 4px 16px -8px rgba(15,23,42,0.08)',
                  animation: `fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both`,
                  animationDelay: `${i * 50}ms`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: s.tint + '15' }}
                >
                  <s.icon className="w-[18px] h-[18px]" style={{ color: s.tint }} strokeWidth={2.2} />
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-3">{s.label}</p>
                <p className="text-[22px] font-black text-slate-900 leading-tight tracking-tight">
                  {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                </p>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 mt-1">
                  <ArrowUpRight className="w-3 h-3" /> {s.delta}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* NEW ACTIVITY */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-slate-900">New Activity</h3>
            <button
              onClick={() => navigate('/seller/insights')}
              className="text-[11px] font-semibold flex items-center gap-1"
              style={{ color: PURPLE }}
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div
            className="rounded-2xl bg-white border overflow-hidden"
            style={{ borderColor: '#f1f5f9', boxShadow: '0 4px 16px -8px rgba(15,23,42,0.06)' }}
          >
            {activities.slice(0, 4).map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                style={{
                  borderColor: '#f1f5f9',
                  animation: `fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both`,
                  animationDelay: `${i * 40}ms`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: a.color + '18' }}
                >
                  <a.icon className="w-[16px] h-[16px]" style={{ color: a.color }} strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] leading-tight text-slate-900">
                    <span className="font-semibold">{a.name}</span>{' '}
                    <span className="text-slate-500">{a.action}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{a.product}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* RECENT ORDERS PREVIEW */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-slate-900">Recent Orders</h3>
            <button
              onClick={() => navigate('/seller/orders')}
              className="text-[11px] font-semibold flex items-center gap-1"
              style={{ color: PURPLE }}
            >
              See all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {data.products.length === 0 ? (
            <div
              className="rounded-2xl bg-white border p-8 text-center text-sm text-slate-500"
              style={{ borderColor: '#f1f5f9' }}
            >
              <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No orders yet. Share your shop link to get started!
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.products.slice(0, 3).map((p: any, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white border transition-all hover:border-slate-200"
                  style={{
                    borderColor: '#f1f5f9',
                    boxShadow: '0 2px 10px -6px rgba(15,23,42,0.06)',
                    animation: `fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both`,
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100"
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-slate-900 truncate">{p.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {p.views || 0} views · {p.clicks || 0} clicks
                    </p>
                  </div>
                  <p className="text-[14px] font-bold flex-shrink-0" style={{ color: PURPLE }}>
                    ₹{Number(p.price || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* QUICK ADD PRODUCT */}
        <button
          onClick={() => navigate('/seller/add-product')}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-[14px] active:scale-[0.98] transition-transform"
          style={{
            background: 'linear-gradient(135deg,#7C3AED,#6d28d9)',
            boxShadow: '0 14px 30px -10px rgba(124,58,237,0.55)',
          }}
        >
          <Plus className="w-5 h-5" strokeWidth={2.6} />
          Quick Add Product
        </button>
      </div>
    </div>
  );
};

export default SellerOverview;
