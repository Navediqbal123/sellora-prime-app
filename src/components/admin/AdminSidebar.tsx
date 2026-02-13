import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Package, 
  Search, 
  MousePointer, 
  LogOut,
  ChevronLeft,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'sellers', label: 'Sellers', icon: Store },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'seller-requests', label: 'Seller Requests', icon: Sparkles },
  { id: 'searches', label: 'Searches', icon: Search },
  { id: 'clicks', label: 'Views / Clicks', icon: MousePointer },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  collapsed, 
  onCollapsedChange,
  isMobileOpen = false,
  onMobileClose
}) => {
  const { signOut } = useAuth();

  const handleItemClick = (sectionId: string) => {
    onSectionChange(sectionId);
    onMobileClose?.();
  };

  const handleLogout = async () => {
    await signOut();
    onMobileClose?.();
  };

  const sidebarContent = (
    <aside 
      className={`h-full flex flex-col transition-all duration-300 ease-out will-change-[width]
                  ${collapsed ? 'w-20' : 'w-64'} 
                  bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 
                  border-r border-sidebar-border/50 backdrop-blur-xl`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border/50">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-primary 
                            flex items-center justify-center shadow-glow animate-pulse-glow">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold text-gradient">
                Sellora
              </span>
              <p className="text-[10px] text-muted-foreground/70 -mt-0.5">Admin Panel</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-primary via-accent to-primary 
                          flex items-center justify-center shadow-glow">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        
        {/* Desktop Collapse Button */}
        <button 
          onClick={() => onCollapsedChange(!collapsed)}
          className="hidden md:flex p-2 rounded-lg hover:bg-sidebar-accent transition-all duration-180 ml-auto"
        >
          <ChevronLeft className={`w-5 h-5 text-sidebar-foreground/70 transition-transform duration-260 ${collapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button 
            onClick={onMobileClose}
            className="md:hidden p-2 rounded-lg hover:bg-sidebar-accent transition-all duration-180"
          >
            <X className="w-5 h-5 text-sidebar-foreground/70" />
          </button>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ease-out
                          group relative overflow-hidden will-change-transform
                          ${isActive 
                            ? 'bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground shadow-glow' 
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground hover:translate-x-1'
                          }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full 
                                bg-gradient-to-b from-white/80 to-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)]
                                animate-fade-in" />
              )}
              
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-all duration-180 
                                     ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'group-hover:scale-110'}`} />
              
              {!collapsed && (
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              )}
              
              {isActive && !collapsed && (
                <div className="ml-auto w-2 h-2 rounded-full bg-white/80 animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-2">
        <div className="h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />
      </div>

      {/* Logout */}
      <div className="p-3 pb-4">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-180
                     bg-gradient-to-r from-destructive/10 to-destructive/5
                     text-destructive/80 hover:from-destructive/20 hover:to-destructive/10 hover:text-destructive
                     group border border-destructive/20 hover:border-destructive/30
                     ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-180" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full z-40">
        {sidebarContent}
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={onMobileClose}
        >
          <div 
            className="h-full animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
