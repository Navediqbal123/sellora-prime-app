import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react';

const PURPLE = '#7C3AED';

const items = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'categories', label: 'Categories', icon: LayoutGrid, path: '/categories' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/wishlist' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/orders' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-none pb-[calc(env(safe-area-inset-bottom)+12px)] px-4">
      <nav
        className="pointer-events-auto mx-auto max-w-md rounded-[28px] bg-white border border-black/5"
        style={{
          boxShadow:
            '0 20px 40px -12px rgba(15, 15, 25, 0.18), 0 8px 16px -8px rgba(15, 15, 25, 0.08)',
        }}
        aria-label="Primary"
      >
        <div className="flex items-center justify-around h-[68px] px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full outline-none focus-visible:ring-0 transition-transform active:scale-[0.94]"
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className="w-[24px] h-[24px] transition-colors duration-300"
                  strokeWidth={2}
                  style={{ color: active ? PURPLE : '#111214' }}
                />
                <span
                  className="text-[11px] leading-none tracking-tight transition-colors duration-300"
                  style={{
                    color: active ? PURPLE : '#4B5563',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;