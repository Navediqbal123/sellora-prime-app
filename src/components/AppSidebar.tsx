import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import {
  Home,
  Store,
  ShoppingBag,
  Settings,
  User,
  LogOut,
  Sparkles,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AppSidebar = () => {
  const { role, signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  // Navigation items based on role
  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
      roles: ['user', 'shopkeeper', 'admin'],
    },
    {
      path: '/become-seller',
      label: 'Start Selling on Sellora',
      icon: Sparkles,
      roles: ['user'],
      highlight: true,
    },
    {
      path: '/seller',
      label: 'Seller Dashboard',
      icon: Store,
      roles: ['shopkeeper'],
    },
    {
      path: '/admin',
      label: 'Admin Panel',
      icon: LayoutDashboard,
      roles: ['admin'],
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: User,
      roles: ['user', 'shopkeeper', 'admin'],
    },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <Sidebar
      className={`border-r border-border/50 bg-gradient-to-b from-sidebar-background to-background transition-all duration-300 ${
        collapsed ? 'w-[70px]' : 'w-64'
      }`}
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold text-gradient">Sellora</h1>
              <p className="text-xs text-muted-foreground">Marketplace</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {visibleItems.map((item, index) => (
                <SidebarMenuItem key={item.path} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={collapsed ? item.label : undefined}
                  >
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                        ${isActive(item.path) 
                          ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(139,92,246,0.2)]' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        }
                        ${item.highlight && !isActive(item.path) 
                          ? 'bg-gradient-to-r from-primary/10 to-accent/10 text-primary hover:from-primary/20 hover:to-accent/20' 
                          : ''
                        }`}
                      activeClassName="bg-primary/10 text-primary"
                    >
                      {/* Glow effect for active item */}
                      {isActive(item.path) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent animate-pulse-glow" />
                      )}
                      
                      {/* Highlight glow for special button */}
                      {item.highlight && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 animate-shimmer" />
                      )}

                      <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 relative z-10
                        ${item.highlight ? 'text-primary' : ''}`} 
                      />
                      
                      {!collapsed && (
                        <span className={`font-medium relative z-10 ${item.highlight ? 'text-gradient font-semibold' : ''}`}>
                          {item.label}
                        </span>
                      )}

                      {/* Active indicator */}
                      {isActive(item.path) && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t border-border/50 mt-auto">
        {/* User info */}
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2 rounded-lg bg-secondary/30 animate-fade-in">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <p className="text-xs text-primary capitalize font-medium">{role}</p>
          </div>
        )}

        {/* Logout button */}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={`w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300
            ${collapsed ? 'px-3' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full mt-2 justify-center text-muted-foreground hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;