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
  ClipboardList,
  MessageCircle,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type NavItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const SellerSidebar = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
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
      if (data) setShopName(data.shop_name);
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
        <div className="flex items-center w-full group/item">
          <SidebarMenuButton asChild isActive={active} tooltip={collapsed ? item.label : undefined} className="flex-1">
            <NavLink
              to={item.path}
              className={
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative overflow-hidden ` +
                (active
                  ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5')
              }
              activeClassName="bg-gradient-to-r from-primary/20 to-primary/5 text-primary"
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full" />
              )}
              <ItemIcon className={`w-4 h-4 flex-shrink-0 transition-all duration-200 relative z-10 
                                   ${active ? 'text-primary' : 'group-hover/item:text-primary'}`} />
              {!collapsed && (
                <span className={`text-sm font-medium relative z-10 ${active ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              )}
            </NavLink>
          </SidebarMenuButton>

          {/* 3-dot menu */}
          {!collapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-md opacity-0 group-hover/item:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-white/10 flex-shrink-0 mr-1">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => navigate(item.path)}>
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(item.path, '_blank')}>
                  Open in new tab
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      className="border-r border-border/50 bg-gradient-to-b from-sidebar to-background/95"
      collapsible="icon"
    >
      {/* Branding Header with Sellora name */}
      <SidebarHeader className="p-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20 animate-pulse-glow">
            <Store className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <h1 className="text-sm font-bold text-gradient">
                {shopName || 'Sellora'}
              </h1>
              <p className="text-[10px] text-muted-foreground">Seller Hub</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 flex-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1 px-3">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {sellerItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: Back to Home + Logout anchored at bottom — no Collapse button */}
      <SidebarFooter className="p-2 border-t border-border/50 space-y-1 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className={`w-full justify-start gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary transition-all duration-200 text-xs h-8 ${
            collapsed ? 'px-2 justify-center' : ''
          }`}
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="font-semibold">Back to Home</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className={`w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 text-xs h-8 ${
            collapsed ? 'px-2 justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SellerSidebar;
