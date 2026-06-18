import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, Plus, ClipboardList, BarChart3, Receipt } from 'lucide-react';

const items = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: Home },
  { to: '/seller/products', label: 'Products', icon: Package },
  { to: '/seller/add-product', label: 'Add', icon: Plus, center: true },
  { to: '/seller/orders', label: 'Orders', icon: ClipboardList },
  { to: '/seller/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/seller/sales-history', label: 'Sales', icon: Receipt },
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
        className="relative mx-2 mb-2 rounded-2xl border backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(16,8,35,0.92), rgba(10,6,19,0.96))',
          borderColor: 'rgba(124,58,237,0.25)',
          boxShadow: '0 -10px 40px -10px rgba(124,58,237,0.35)',
        }}
      >
        <div className="grid grid-cols-6 h-16 items-center">
          {items.map((it) => {
            const active = isActive(it.to);
            const Icon = it.icon;

            if (it.center) {
              return (
                <button
                  key={it.to}
                  onClick={() => navigate(it.to)}
                  className="flex flex-col items-center justify-center -mt-8"
                  aria-label={it.label}
                >
                  <span
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg,#a855f7,#7C3AED)',
                      boxShadow: '0 12px 30px -8px rgba(124,58,237,0.75), inset 0 1px 0 rgba(255,255,255,0.25)',
                    }}
                  >
                    <Plus className="w-7 h-7" strokeWidth={2.5} />
                  </span>
                </button>
              );
            }

            return (
              <NavLink
                key={it.to}
                to={it.to}
                className="flex flex-col items-center justify-center gap-0.5 h-full"
              >
                <Icon
                  className="w-5 h-5 transition-colors"
                  style={{ color: active ? '#a78bfa' : 'rgba(255,255,255,0.5)' }}
                />
                <span
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: active ? '#c4b5fd' : 'rgba(255,255,255,0.45)' }}
                >
                  {it.label}
                </span>
                {active && (
                  <span
                    className="absolute top-1 w-1 h-1 rounded-full"
                    style={{ background: '#a78bfa', boxShadow: '0 0 8px #a78bfa' }}
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