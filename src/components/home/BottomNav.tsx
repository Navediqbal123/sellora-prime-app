import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react';

const items = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'categories', label: 'Categories', icon: LayoutGrid, path: '/?focus=categories' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/wishlist' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/orders' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    const base = path.split('?')[0];
    if (base === '/') return location.pathname === '/';
    return location.pathname.startsWith(base);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden
                 bg-background/85 backdrop-blur-xl border-t border-border/60
                 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full group"
              aria-label={item.label}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
              )}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                  ${active
                    ? 'bg-primary/15 text-primary scale-105'
                    : 'text-muted-foreground group-active:scale-95'}`}
              >
                <Icon className={`w-5 h-5 ${active ? 'fill-primary/20' : ''}`} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium leading-none ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;