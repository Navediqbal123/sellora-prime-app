import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, Plus, ShoppingBag, BarChart3, FileText } from 'lucide-react';

// Left-side items (before center) and right-side items (after center)
const leftItems = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: Home },
  { to: '/seller/products', label: 'My Products', icon: Package },
];
const rightItems = [
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

  const NavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => {
    const active = isActive(to);
    return (
      <NavLink
        to={to}
        className="relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 h-full"
      >
        <Icon
          className="w-[22px] h-[22px] transition-colors"
          strokeWidth={active ? 2.3 : 1.9}
          style={{ color: active ? '#a78bfa' : 'rgba(255,255,255,0.55)' }}
          fill={active && label === 'Dashboard' ? '#a78bfa' : 'none'}
        />
        <span
          className="text-[10px] font-semibold leading-none truncate max-w-full px-1"
          style={{ color: active ? '#c4b5fd' : 'rgba(255,255,255,0.6)' }}
        >
          {label}
        </span>
        {active && (
          <span
            className="absolute bottom-1 w-6 h-[3px] rounded-full"
            style={{ background: '#a78bfa', boxShadow: '0 0 10px #a78bfa' }}
          />
        )}
      </NavLink>
    );
  };

  const addActive = isActive('/seller/add-product');

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className="relative mx-2 mb-2 rounded-3xl border backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(16,8,35,0.94), rgba(10,6,19,0.97))',
          borderColor: 'rgba(124,58,237,0.28)',
          boxShadow: '0 -10px 40px -10px rgba(124,58,237,0.35)',
        }}
      >
        {/* Row: left items | spacer for floating button | right items */}
        <div className="flex items-stretch h-[68px] px-1">
          {leftItems.map((it) => (
            <NavItem key={it.to} {...it} />
          ))}

          {/* Spacer reserves space for the floating center button */}
          <div className="flex-1 min-w-0 flex flex-col items-center justify-end pb-1.5">
            <span
              className="text-[10px] font-semibold leading-none"
              style={{ color: addActive ? '#c4b5fd' : 'rgba(255,255,255,0.6)' }}
            >
              Add Product
            </span>
          </div>

          {rightItems.map((it) => (
            <NavItem key={it.to} {...it} />
          ))}
        </div>

        {/* Floating, perfectly-centered Add Product button */}
        <button
          onClick={() => navigate('/seller/add-product')}
          aria-label="Add Product"
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg,#a855f7,#6d28d9)',
            boxShadow: '0 12px 30px -8px rgba(124,58,237,0.85), inset 0 1px 0 rgba(255,255,255,0.35), 0 0 0 4px rgba(10,6,19,0.95)',
          }}
        >
          <Plus className="w-7 h-7" strokeWidth={3} />
        </button>
      </div>
    </nav>
  );
};

export default SellerBottomNav;