import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Package, Plus, Sparkles, MoreHorizontal,
  ShoppingBag, BarChart3, FileText, Ticket, Star, LifeBuoy, Settings, LogOut,
  ChevronRight, X,
} from 'lucide-react';

const PURPLE = '#7C3AED';

type Item = { to?: string; onClick?: () => void; label: string; icon: any };

const SellerBottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isActive = (p: string) =>
    p === '/seller/dashboard'
      ? pathname === '/seller' || pathname === '/seller/dashboard'
      : pathname === p || pathname.startsWith(p + '/');

  // Close sheet on route change
  useEffect(() => { setSheetOpen(false); }, [pathname]);

  const NavBtn = ({ item }: { item: Item }) => {
    const active = item.to ? isActive(item.to) : false;
    const Icon = item.icon;
    const content = (
      <>
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
          {item.label}
        </span>
      </>
    );
    const cls = "relative flex flex-col items-center justify-center flex-1 h-full active:scale-95 transition-transform";
    return item.to ? (
      <NavLink to={item.to} className={cls}>{content}</NavLink>
    ) : (
      <button onClick={item.onClick} className={cls}>{content}</button>
    );
  };

  const left: Item[] = [
    { to: '/seller/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/seller/products', label: 'My Products', icon: Package },
  ];
  const right: Item[] = [
    { to: '/seller/insights', label: 'Insights', icon: Sparkles },
    { onClick: () => setSheetOpen(true), label: 'More', icon: MoreHorizontal },
  ];

  const moreItems = [
    { to: '/seller/orders', label: 'Orders', subtitle: 'Track and fulfill orders', icon: ShoppingBag, color: '#7C3AED' },
    { to: '/seller/analytics', label: 'Analytics', subtitle: 'Legacy analytics view', icon: BarChart3, color: '#2563eb' },
    { to: '/seller/sales-history', label: 'Sales History', subtitle: 'Completed sales record', icon: FileText, color: '#059669' },
    { to: '/profile/coupons', label: 'Coupons', subtitle: 'Discounts & offers', icon: Ticket, color: '#db2777' },
    { to: '/seller/insights', label: 'Reviews', subtitle: 'Ratings & feedback', icon: Star, color: '#f59e0b' },
    { to: '/profile/help', label: 'Support', subtitle: 'Help center & contact', icon: LifeBuoy, color: '#0ea5e9' },
    { to: '/profile/edit', label: 'Settings', subtitle: 'Account preferences', icon: Settings, color: '#475569' },
    { to: '/profile', label: 'Logout', subtitle: 'Sign out of your account', icon: LogOut, color: '#dc2626' },
  ];

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div
          className="relative mx-3 mb-3 rounded-[28px] border bg-white"
          style={{
            borderColor: 'rgba(15,23,42,0.06)',
            boxShadow: '0 20px 50px -20px rgba(15,23,42,0.25), 0 8px 20px -12px rgba(124,58,237,0.15)',
          }}
        >
          <div className="flex items-stretch h-[72px] px-1">
            {left.map((it) => <NavBtn key={it.label} item={it} />)}
            <div className="flex-1 min-w-0" />
            {right.map((it) => <NavBtn key={it.label} item={it} />)}
          </div>

          {/* Floating center Add Product */}
          <button
            onClick={() => navigate('/seller/add-product')}
            aria-label="Add Product"
            className="absolute left-1/2 -translate-x-1/2 -top-7 w-16 h-16 rounded-full flex items-center justify-center text-white transition-transform active:scale-95 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg,#a855f7 0%,#7C3AED 55%,#6d28d9 100%)',
              boxShadow: '0 16px 32px -8px rgba(124,58,237,0.55), inset 0 1px 0 rgba(255,255,255,0.4), 0 0 0 5px #ffffff',
            }}
          >
            <Plus className="w-7 h-7" strokeWidth={3.2} />
          </button>
        </div>
      </nav>

      {/* MORE bottom sheet */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full bg-white rounded-t-[32px] p-5 pb-8 max-h-[85vh] overflow-y-auto"
            style={{
              boxShadow: '0 -20px 60px -20px rgba(15,23,42,0.35)',
              animation: 'sheet-up 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <style>{`@keyframes sheet-up{0%{transform:translateY(100%)}100%{transform:translateY(0)}}`}</style>
            {/* Grabber */}
            <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto mb-4" />
            <div className="flex items-center justify-between mb-5 px-1">
              <div>
                <h3 className="text-lg font-bold text-slate-900">More</h3>
                <p className="text-xs text-slate-500">All seller tools in one place</p>
              </div>
              <button
                onClick={() => setSheetOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center active:scale-95"
              >
                <X className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            <div className="space-y-2">
              {moreItems.map((it, i) => (
                <button
                  key={it.label}
                  onClick={() => { setSheetOpen(false); navigate(it.to); }}
                  className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all"
                  style={{
                    animation: `fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both`,
                    animationDelay: `${i * 35}ms`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: it.color + '18' }}
                  >
                    <it.icon className="w-[22px] h-[22px]" style={{ color: it.color }} strokeWidth={2.1} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[14.5px] font-semibold text-slate-900 leading-tight">{it.label}</p>
                    <p className="text-[11.5px] text-slate-500 mt-0.5 truncate">{it.subtitle}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SellerBottomNav;