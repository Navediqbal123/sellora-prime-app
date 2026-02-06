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
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import {
  Home,
  Sparkles,
  Store,
  LayoutDashboard,
  User,
  LogOut,
  ShoppingBag,
  Clock,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type NavItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Array<'user' | 'shopkeeper' | 'admin'>;
  highlight?: boolean;
};

const AppSidebar = () => {
  const { role, signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  
  // Track if user has a seller application (any status)
  const [hasSellerApplication, setHasSellerApplication] = useState(false);
  const [sellerStatus, setSellerStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkSellerApplication = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('sellers')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setHasSellerApplication(true);
        setSellerStatus(data.status);
      } else {
        setHasSellerApplication(false);
        setSellerStatus(null);
      }
    };
    
    checkSellerApplication();
  }, [user, role]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    const current = location.pathname;
    if (path === '/') return current === '/';
    return current === path || current.startsWith(`${path}/`);
  };

  const coreItems: NavItem[] = [
    { path: '/', label: 'Home', icon: Home, roles: ['user', 'shopkeeper', 'admin'] },
    { path: '/profile', label: 'Profile', icon: User, roles: ['user', 'shopkeeper', 'admin'] },
    { path: '/login-history', label: 'Login History', icon: History, roles: ['user', 'shopkeeper', 'admin'] },
  ];

  // Show "Start Selling" only for users without any seller application
  // Show "Application Status" for users with pending/rejected applications
  const userItems: NavItem[] = [];
  
  if (role === 'user' || role === 'admin') {
    if (!hasSellerApplication) {
      userItems.push({
        path: '/seller/onboarding',
        label: 'Start Selling on Sellora',
        icon: Sparkles,
        roles: ['user', 'admin'],
        highlight: true,
      });
    } else if (sellerStatus === 'pending' || sellerStatus === 'rejected') {
      userItems.push({
        path: '/seller/review',
        label: 'Application Status',
        icon: Clock,
        roles: ['user', 'admin'],
      });
    }
  }

  // Show seller dashboard link when status is approved
  const sellerItems: NavItem[] = [
    { path: '/seller', label: 'Seller Dashboard', icon: Store, roles: ['shopkeeper', 'admin'] },
  ];

  // Admin only sees "Admin Panel" in sidebar - sub-items are inside admin panel
  const adminItems: NavItem[] = [
    { path: '/admin', label: 'Admin Panel', icon: LayoutDashboard, roles: ['admin'] },
  ];

  const visible = (item: NavItem) => item.roles.includes(role);
  
  // Show seller dashboard link if sellerStatus is 'approved' (direct from sellers table)
  const showSellerDashboard = sellerStatus === 'approved' || role === 'shopkeeper';

  const renderItem = (item: NavItem, index: number) => {
    const active = isActive(item.path);
    const ItemIcon = item.icon;

    return (
      <SidebarMenuItem
        key={item.path}
        className="animate-fade-in"
        style={{ animationDelay: `${index * 0.04}s` }}
      >
        <SidebarMenuButton asChild isActive={active} tooltip={collapsed ? item.label : undefined}>
          <NavLink
            to={item.path}
            end={item.path === '/'}
            className={
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ` +
              (active
                ? 'bg-primary/15 text-primary shadow-button'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50') +
              (item.highlight && !active
                ? ' bg-gradient-to-r from-primary/10 to-accent/10 text-primary hover:from-primary/20 hover:to-accent/20'
                : '')
            }
            activeClassName="bg-primary/15 text-primary"
          >
            {active && <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />}
            {item.highlight && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 animate-shimmer" />
            )}

            <ItemIcon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 relative z-10`} />

            {!collapsed && (
              <span
                className={`font-medium relative z-10 truncate ${
                  item.highlight ? 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold' : ''
                }`}
              >
                {item.label}
              </span>
            )}

            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const coreVisible = coreItems.filter(visible);
  const userVisible = userItems.filter(visible);
  // Use showSellerDashboard flag instead of role-based filtering
  const sellerVisible = showSellerDashboard ? sellerItems : [];
  const adminVisible = adminItems.filter(visible);

  return (
    <Sidebar
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 shadow-button">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sellora</h1>
              <p className="text-xs text-muted-foreground">Marketplace</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 flex-1">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">{coreVisible.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userVisible.length > 0 && (
          <>
            <SidebarSeparator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel>Start</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">{userVisible.map((i, idx) => renderItem(i, coreVisible.length + idx))}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {sellerVisible.length > 0 && (
          <>
            <SidebarSeparator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel>Seller Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {sellerVisible.map((i, idx) => renderItem(i, coreVisible.length + userVisible.length + idx))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {adminVisible.length > 0 && (
          <>
            <SidebarSeparator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {adminVisible.map((i, idx) =>
                    renderItem(i, coreVisible.length + userVisible.length + sellerVisible.length + idx),
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2 rounded-lg bg-secondary/30 animate-fade-in">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <p className="text-xs text-primary capitalize font-medium">{role}</p>
          </div>
        )}

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

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full mt-2 justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/30"
        >
          <span className="sr-only">Toggle sidebar</span>
          <span className="flex items-center gap-2">
            <span className="text-xs">{collapsed ? 'Expand' : 'Collapse'}</span>
          </span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
