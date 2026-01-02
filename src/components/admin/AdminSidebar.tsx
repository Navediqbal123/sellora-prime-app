import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Package, 
  Search, 
  MousePointer, 
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'sellers', label: 'Sellers', icon: Store },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'searches', label: 'Searches', icon: Search },
  { id: 'clicks', label: 'Views / Clicks', icon: MousePointer },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  collapsed, 
  onCollapsedChange 
}) => {
  const { signOut } = useAuth();

  return (
    <aside 
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-out
                  ${collapsed ? 'w-20' : 'w-64'} 
                  bg-sidebar border-r border-sidebar-border`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-xl font-bold text-gradient animate-fade-in">
            Sellora Admin
          </span>
        )}
        <button 
          onClick={() => onCollapsedChange(!collapsed)}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors ml-auto"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-3 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300
                        animate-slide-in-left group
                        ${activeSection === item.id 
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow' 
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-200 
                                   ${activeSection === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            {!collapsed && (
              <span className="font-medium">{item.label}</span>
            )}
            {activeSection === item.id && !collapsed && (
              <div className="ml-auto w-2 h-2 rounded-full bg-sidebar-primary-foreground animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-3 right-3">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300
                     text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
