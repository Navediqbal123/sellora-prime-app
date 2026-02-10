import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import {
  Store,
  Package,
  PlusCircle,
  BarChart3,
  LogOut,
  Home,
  ChevronLeft,
  ClipboardList,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type NavItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const SellerSidebar = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  
  const [shopName, setShopName] = useState<string>('');

  useEffect(() => {
    const fetchShopInfo = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('sellers')
        .select('shop_name')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setShopName(data.shop_name);
      }
    };
    
    fetchShopInfo();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    const current = location.pathname;
    if (path === '/seller' || path === '/seller/dashboard') {
      return current === '/seller' || current === '/seller/dashboard';
    }
    return current === path || current.startsWith(`${path}/`);
  };

  const sellerItems: NavItem[] = [
    { path: '/seller/dashboard', label: 'Dashboard', icon: Store },
    { path: '/seller/add-product', label: 'Add Product', icon: PlusCircle },
    { path: '/seller/products', label: 'My Products', icon: Package },
    { path: '/seller/orders', label: 'Pickup Orders', icon: ClipboardList },
    { path: '/seller/messages', label: 'Messages', icon: MessageCircle },
    { path: '/seller/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const renderItem = (item: NavItem, index: number) => {
    const active = isActive(item.path);
    const ItemIcon = item.icon;

    return (
      <SidebarMenuItem
        key={item.path}
        className="animate-fade-in"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <SidebarMenuButton asChild isActive={active} tooltip={collapsed ? item.label : undefined}>
          <NavLink
            to={item.path}
            className={
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ` +
              (active
                ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5')
            }
            activeClassName="bg-gradient-to-r from-primary/20 to-primary/5 text-primary"
          >
            {active && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              </>
            )}

            <ItemIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 relative z-10 
                                 ${active ? 'text-primary' : 'group-hover:scale-110 group-hover:text-primary'}`} />

            {!collapsed && (
              <span className={`font-medium relative z-10 ${active ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      className="border-r border-border/50 bg-gradient-to-b from-sidebar to-background/95"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <h1 className="text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
                {shopName || 'Sellora Hub'}
              </h1>
              <p className="text-xs text-muted-foreground">Seller Hub</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6 flex-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground/70 uppercase tracking-wider mb-2">
            Seller Hub
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {sellerItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border/50 space-y-2">
        {/* Back to Home — prominent */}
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className={`w-full justify-start gap-3 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300 ${
            collapsed ? 'px-3 justify-center' : ''
          }`}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-semibold">Back to Home</span>}
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={`w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 ${
            collapsed ? 'px-3 justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-white/5"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span className="text-xs ml-2">Collapse</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SellerSidebar;
