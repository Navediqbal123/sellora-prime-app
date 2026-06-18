import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, Plus, ShoppingBag, BarChart3, FileText } from 'lucide-react';

const items = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: Home },
  { to: '/seller/add-product', label: 'Add Product', icon: Plus, center: true },
  { to: '/seller/products', label: 'My Products', icon: Package },
  { to: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/seller/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/seller/sales-history', label: 'Sales History', icon: FileText },
];

const SellerBottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isActive = (p: string) =>
    p === '/seller/dashboard'
      ? pathname === '/seller' || pathname === '/seller/dashboard'
      : pathname === p || pathname.startsWith(p + '/');

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className="relative mx-2 mb-2 rounded-3xl border backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(16,8,35,0.92), rgba(10,6,19,0.96))',
          borderColor: 'rgba(124,58,237,0.25)',
          boxShadow: '0 -10px 40px -10px rgba(124,58,237,0.35)',
        }}
      >
        <div className="grid grid-cols-6 h-[72px] items-end pb-2 pt-2">
          {items.map((it) => {
            const active = isActive(it.to);
            const Icon = it.icon;

            if (it.center) {
              return (
                <button
                  key={it.to}
                  onClick={() => navigate(it.to)}
                  className="relative flex flex-col items-center justify-end h-full"
                  aria-label={it.label}
                >
                  <span
                    className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg,#a855f7,#7C3AED)',
                      boxShadow: '0 12px 30px -8px rgba(124,58,237,0.85), inset 0 1px 0 rgba(255,255,255,0.3)',
                    }}
                  >
                    <Plus className="w-7 h-7" strokeWidth={3} />
                  </span>
                  <span
                    className="text-[11px] font-semibold mt-9"
                    style={{ color: active ? '#c4b5fd' : 'rgba(255,255,255,0.6)' }}
                  >
                    {it.label}
                  </span>
                </button>
              );
            }

            return (
              <NavLink
                key={it.to}
                to={it.to}
                className="relative flex flex-col items-center justify-end gap-1 h-full pb-0.5"
              >
                <Icon
                  className="w-[22px] h-[22px] transition-colors"
                  strokeWidth={active ? 2.2 : 1.8}
                  style={{ color: active ? '#a78bfa' : 'rgba(255,255,255,0.55)' }}
                  fill={active && it.label === 'Dashboard' ? '#a78bfa' : 'none'}
                />
                <span
                  className="text-[10.5px] font-semibold transition-colors leading-none"
                  style={{ color: active ? '#c4b5fd' : 'rgba(255,255,255,0.55)' }}
                >
                  {it.label}
                </span>
                {active && (
                  <span
                    className="absolute -bottom-0.5 w-8 h-[3px] rounded-full"
                    style={{ background: '#a78bfa', boxShadow: '0 0 10px #a78bfa' }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default SellerBottomNav;