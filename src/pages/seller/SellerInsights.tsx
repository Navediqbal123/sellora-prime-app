import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronDown, Eye, MousePointer, ShoppingBag, TrendingUp,
  ArrowUpRight, Search, Filter, MapPin, Star, Heart, ShoppingCart,
  XCircle, Radio, ChevronRight, Package, LayoutGrid, Globe2, Activity as ActivityIcon,
} from 'lucide-react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useSellerAnalytics } from '@/hooks/useSellerAnalytics';
import {
  useSellerInsights,
  countryFlag,
  currencySymbol,
  formatTimeAgo,
  maskPhone,
  initials,
  ClickAction,
} from '@/hooks/useSellerInsights';

const PURPLE = '#7C3AED';

type TabKey = 'overview' | 'products' | 'clicks' | 'activity' | 'countries';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'clicks', label: 'Clicks', icon: MousePointer },
  { key: 'activity', label: 'Activity', icon: ActivityIcon },
  { key: 'countries', label: 'Countries', icon: Globe2 },
];

const WORLD_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const ACTION_META: Record<string, { label: string; icon: any; color: string }> = {
  view: { label: 'viewed', icon: Eye, color: '#2563eb' },
  click: { label: 'clicked on', icon: MousePointer, color: '#f59e0b' },
  wishlist: { label: 'added to wishlist', icon: Heart, color: '#db2777' },
  order: { label: 'placed an order for', icon: ShoppingCart, color: '#7C3AED' },
  cancel: { label: 'cancelled order for', icon: XCircle, color: '#dc2626' },
  review: { label: 'reviewed', icon: Star, color: '#eab308' },
};
function actionMeta(a: string) {
  return ACTION_META[a] || { label: a, icon: ActivityIcon, color: '#6b7280' };
}

const Spark: React.FC<{ color: string; seed?: number; up?: boolean }> = ({ color, seed = 3, up = true }) => {
  const points = Array.from({ length: 12 }, (_, i) => {
    const y = 24 - ((Math.sin(i * 0.7 + seed) + 1) * 6 + (up ? i * 0.6 : -i * 0.4));
    return `${i * 8},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 96 30" className="w-full h-8 mt-2">
      <defs>
        <linearGradient id={`sg-${seed}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
};

const SellerInsights: React.FC = () => {
  const navigate = useNavigate();
  const { data } = useSellerAnalytics();
  const insights = useSellerInsights();
  const [tab, setTab] = useState<TabKey>('overview');
  const [filter, setFilter] = useState<'week' | 'month' | 'year'>('week');
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Overview cards
  const overview = useMemo(() => ([
    { label: 'Total Views', value: data.totalViews, delta: '+18.7%', color: '#7C3AED', icon: Eye },
    { label: 'Total Clicks', value: data.totalClicks, delta: '+14.3%', color: '#f59e0b', icon: MousePointer },
    { label: 'Total Orders', value: 256, delta: '+9%', color: '#2563eb', icon: ShoppingBag },
    { label: 'Conversion Rate', value: `${data.conversionRate}%`, delta: '+5.6%', color: '#059669', icon: TrendingUp },
  ]), [data]);

  // Real click_logs derived views
  const activities = useMemo(() => {
    return insights.logs.slice(0, 60).map((l) => {
      const meta = actionMeta(String(l.action));
      const prof = l.user_id ? insights.profiles[l.user_id] : undefined;
      const prod = l.product_id ? insights.products[l.product_id] : undefined;
      return {
        id: l.id,
        name: prof?.full_name || 'Someone',
        action: meta.label,
        product: prod?.title || 'a product',
        country: l.country || prof?.country || '',
        time: formatTimeAgo(l.created_at),
        icon: meta.icon,
        color: meta.color,
      };
    });
  }, [insights.logs, insights.profiles, insights.products]);

  const customers = useMemo(() => {
    const byUser = new Map<string, { clicks: number; last: string; profile?: any; country?: string; city?: string }>();
    insights.logs.forEach((l) => {
      if (!l.user_id) return;
      const cur = byUser.get(l.user_id) || { clicks: 0, last: l.created_at };
      cur.clicks += 1;
      if (new Date(l.created_at) > new Date(cur.last)) cur.last = l.created_at;
      cur.country = cur.country || l.country || undefined;
      cur.city = cur.city || l.city || undefined;
      cur.profile = insights.profiles[l.user_id];
      byUser.set(l.user_id, cur);
    });
    return Array.from(byUser.entries())
      .map(([uid, v]) => ({
        id: uid,
        name: v.profile?.full_name || 'Anonymous',
        email: v.profile?.email || '',
        phone: maskPhone(v.profile?.phone),
        city: v.city || v.profile?.city || '',
        country: v.country || v.profile?.country || '',
        clicks: v.clicks,
        time: formatTimeAgo(v.last),
      }))
      .sort((a, b) => b.clicks - a.clicks);
  }, [insights.logs, insights.profiles]);

  const countries = useMemo(() => {
    const map = new Map<string, { views: number; clicks: number; orders: number; revenue: number; currency?: string }>();
    insights.logs.forEach((l) => {
      const key = (l.country || 'Unknown').trim();
      const cur = map.get(key) || { views: 0, clicks: 0, orders: 0, revenue: 0, currency: l.currency_code || undefined };
      const act = String(l.action);
      if (act === 'view') cur.views += 1;
      else if (act === 'click') cur.clicks += 1;
      else if (act === 'order') {
        cur.orders += 1;
        const amt = Number(l.amount ?? l.price ?? insights.products[l.product_id || '']?.price ?? 0);
        cur.revenue += isFinite(amt) ? amt : 0;
      }
      if (!cur.currency && l.currency_code) cur.currency = l.currency_code;
      map.set(key, cur);
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, flag: countryFlag(name), ...v }))
      .sort((a, b) => b.views - a.views);
  }, [insights.logs, insights.products]);

  const selectedCountryData = useMemo(() => {
    if (!selectedCountry) return null;
    const logs = insights.logs.filter((l) => (l.country || 'Unknown') === selectedCountry);
    const byRegion = new Map<string, { views: number; orders: number }>();
    logs.forEach((l) => {
      const key = l.state || l.city || 'Unknown';
      const cur = byRegion.get(key) || { views: 0, orders: 0 };
      if (String(l.action) === 'view') cur.views += 1;
      if (String(l.action) === 'order') cur.orders += 1;
      byRegion.set(key, cur);
    });
    const regions = Array.from(byRegion.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.views - a.views);
    const totals = countries.find((c) => c.name === selectedCountry);
    return { regions, totals };
  }, [selectedCountry, insights.logs, countries]);

  const products = data.products.slice(0, 6);

  return (
    <div className="min-h-screen" style={{ background: '#ffffff', color: '#0f172a' }}>
      <div className="px-4 pt-4 pb-32 max-w-3xl mx-auto space-y-5">
        {/* HEADER */}
        <header className="flex items-center gap-3 animate-fade-in">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[18px] font-bold text-slate-900 leading-tight">Insights</h1>
            <p className="text-[11px] text-slate-500">Explore your store performance</p>
          </div>
          <div className="relative">
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
        </header>

        {/* HERO */}
        <div
          className="relative overflow-hidden rounded-[26px] p-5 animate-fade-in"
          style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#8b5cf6 55%,#a855f7 100%)' }}
        >
          <div className="relative z-10">
            <p className="text-white/85 text-[12px] font-semibold">Live Insights</p>
            <h2 className="text-white text-[18px] font-bold leading-tight mt-1">
              Get powerful insights about your store, products & customers.
            </h2>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute right-4 top-4 w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <TrendingUp className="w-7 h-7 text-white" strokeWidth={2.2} />
          </div>
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            {overview.map((o, i) => (
              <div
                key={o.label}
                className="rounded-2xl p-4 border bg-white transition-transform hover:-translate-y-0.5"
                style={{
                  borderColor: '#f1f5f9',
                  boxShadow: '0 4px 16px -8px rgba(15,23,42,0.08)',
                  animation: `fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both`,
                  animationDelay: `${i * 40}ms`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: o.color + '18' }}>
                    <o.icon className="w-4 h-4" style={{ color: o.color }} strokeWidth={2.3} />
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600">{o.label}</p>
                </div>
                <p className="text-[26px] font-black text-slate-900 tracking-tight leading-none mt-3">
                  {typeof o.value === 'number' ? o.value.toLocaleString() : o.value}
                </p>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 mt-1">
                  <ArrowUpRight className="w-3 h-3" /> {o.delta}
                </span>
                <Spark color={o.color} seed={i + 1} />
              </div>
            ))}
          </div>
        )}

        {/* PRODUCT PERFORMANCE */}
        {tab === 'products' && (
          <div className="space-y-2.5 animate-fade-in">
            {products.length === 0 ? (
              <div className="rounded-2xl bg-white border p-8 text-center text-sm text-slate-500" style={{ borderColor: '#f1f5f9' }}>
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No product data yet.
              </div>
            ) : products.map((p: any, i) => {
              const ctr = p.views ? Math.round(((p.clicks || 0) / p.views) * 100) : 0;
              return (
                <div
                  key={p.id}
                  className="rounded-2xl bg-white border p-3.5 transition-all hover:border-slate-200"
                  style={{
                    borderColor: '#f1f5f9',
                    boxShadow: '0 4px 16px -8px rgba(15,23,42,0.06)',
                    animation: `fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both`,
                    animationDelay: `${i * 35}ms`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
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
                      <p className="text-[11px] text-slate-500">₹{Number(p.price || 0).toLocaleString()}</p>
                    </div>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 flex-shrink-0">
                      <ArrowUpRight className="w-3 h-3" /> +{5 + i * 2}%
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t" style={{ borderColor: '#f1f5f9' }}>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-slate-400 font-semibold">Views</p>
                      <p className="text-[13px] font-bold text-slate-900">{(p.views || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-slate-400 font-semibold">Clicks</p>
                      <p className="text-[13px] font-bold text-slate-900">{(p.clicks || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-slate-400 font-semibold">CTR</p>
                      <p className="text-[13px] font-bold" style={{ color: PURPLE }}>{ctr}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-slate-400 font-semibold">Orders</p>
                      <p className="text-[13px] font-bold text-slate-900">{p.orders_count || 0}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CLICKS */}
        {tab === 'clicks' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: 'Total Clicks', v: data.totalClicks.toLocaleString(), c: '#7C3AED' },
                { l: 'Unique Users', v: '842', c: '#2563eb' },
                { l: 'Clicks / User', v: '1.4', c: '#059669' },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-white border p-3" style={{ borderColor: '#f1f5f9' }}>
                  <p className="text-[10px] text-slate-500 font-semibold">{s.l}</p>
                  <p className="text-[18px] font-black tracking-tight mt-1" style={{ color: s.c }}>{s.v}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customers"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-[13px] outline-none focus:border-purple-400"
                  style={{ borderColor: '#e2e8f0' }}
                />
              </div>
              <button className="w-10 h-10 rounded-xl border bg-white flex items-center justify-center" style={{ borderColor: '#e2e8f0' }}>
                <Filter className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-2.5">
              {customers
                .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()))
                .map((c, i) => (
                  <div
                    key={c.name}
                    className="rounded-2xl bg-white border p-3.5 flex items-center gap-3"
                    style={{
                      borderColor: '#f1f5f9',
                      boxShadow: '0 4px 16px -8px rgba(15,23,42,0.05)',
                      animation: `fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both`,
                      animationDelay: `${i * 30}ms`,
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#a855f7,#7C3AED)' }}
                    >
                      {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-semibold text-slate-900 truncate">{c.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{c.email}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10.5px] text-slate-500">
                        <MapPin className="w-3 h-3" />
                        <span>{c.city}, {c.country}</span>
                        {c.phone && <><span>·</span><span>{c.phone}</span></>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[15px] font-black" style={{ color: PURPLE }}>{c.clicks}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-semibold tracking-wide">Clicks</p>
                      <p className="text-[9.5px] text-slate-500 mt-0.5">{c.time}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ACTIVITY LIVE FEED */}
        {tab === 'activity' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                <Radio className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700">Live</span>
              </div>
              <p className="text-[11px] text-slate-500">Realtime activity from your store</p>
            </div>

            <div
              className="rounded-2xl bg-white border overflow-hidden"
              style={{ borderColor: '#f1f5f9', boxShadow: '0 4px 16px -8px rgba(15,23,42,0.06)' }}
            >
              {activities.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                  style={{
                    borderColor: '#f1f5f9',
                    animation: `fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both`,
                    animationDelay: `${i * 30}ms`,
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
          </div>
        )}

        {/* COUNTRIES */}
        {tab === 'countries' && (
          <div className="space-y-3 animate-fade-in">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-[13px] outline-none focus:border-purple-400"
                style={{ borderColor: '#e2e8f0' }}
              />
            </div>
            <div className="space-y-2.5">
              {countries
                .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()))
                .map((c, i) => {
                  const max = countries[0].views;
                  const pct = Math.round((c.views / max) * 100);
                  return (
                    <button
                      key={c.name}
                      onClick={() => alert(`${c.name} details coming soon`)}
                      className="w-full text-left rounded-2xl bg-white border p-4 active:scale-[0.99] hover:border-slate-200 transition-all"
                      style={{
                        borderColor: '#f1f5f9',
                        boxShadow: '0 4px 16px -8px rgba(15,23,42,0.06)',
                        animation: `fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both`,
                        animationDelay: `${i * 35}ms`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[26px] leading-none">{c.flag}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-slate-900">{c.name}</p>
                          <p className="text-[10.5px] text-slate-500">
                            {c.views.toLocaleString()} views · {c.orders} orders · ₹{c.revenue.toLocaleString()}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: 'linear-gradient(90deg,#a855f7,#7C3AED)',
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* INSIGHTS-ONLY BOTTOM NAVIGATION */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div
          className="mx-3 mb-3 rounded-[28px] border bg-white animate-fade-in"
          style={{
            borderColor: 'rgba(15,23,42,0.06)',
            boxShadow:
              '0 20px 50px -20px rgba(15,23,42,0.25), 0 8px 20px -12px rgba(124,58,237,0.15)',
          }}
        >
          <div className="flex items-stretch h-[72px] px-1">
            {TABS.map((t) => {
              const active = tab === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="relative flex flex-col items-center justify-center flex-1 h-full active:scale-95 transition-transform"
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
                    style={{
                      background: active ? 'rgba(124,58,237,0.10)' : 'transparent',
                    }}
                  >
                    <Icon
                      className="w-[22px] h-[22px]"
                      strokeWidth={active ? 2.4 : 1.9}
                      style={{ color: active ? PURPLE : '#6b7280' }}
                    />
                  </div>
                  <span
                    className="text-[10.5px] font-semibold leading-none mt-0.5"
                    style={{ color: active ? PURPLE : '#6b7280' }}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default SellerInsights;