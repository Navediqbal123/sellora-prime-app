import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Package, 
  BarChart3, 
  TrendingUp, 
  Crown,
  ChevronRight,
  ChevronLeft,
  Eye,
  MousePointer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  color: 'primary' | 'accent' | 'gold' | 'success';
}

interface DashboardRightSidebarProps {
  topProduct?: {
    title: string;
    views: number;
    clicks: number;
  } | null;
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
}

const colorClasses = {
  primary: 'from-primary/20 to-primary/5 text-primary border-primary/20',
  accent: 'from-accent/20 to-accent/5 text-accent border-accent/20',
  gold: 'from-sellora-gold/20 to-sellora-gold/5 text-sellora-gold border-sellora-gold/20',
  success: 'from-sellora-success/20 to-sellora-success/5 text-sellora-success border-sellora-success/20',
};

const iconBgClasses = {
  primary: 'from-primary to-primary/60',
  accent: 'from-accent to-accent/60',
  gold: 'from-sellora-gold to-sellora-gold/60',
  success: 'from-sellora-success to-sellora-success/60',
};

const DashboardRightSidebar: React.FC<DashboardRightSidebarProps> = ({
  topProduct,
  totalViews,
  totalClicks,
  conversionRate,
}) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const quickActions: QuickAction[] = [
    { icon: PlusCircle, label: 'Quick Add Product', path: '/seller/add-product', color: 'primary' },
    { icon: Package, label: 'View All Products', path: '/seller/products', color: 'accent' },
    { icon: BarChart3, label: 'View Analytics', path: '/seller/analytics', color: 'gold' },
  ];

  return (
    <div
      className={cn(
        "relative h-full border-l border-border/50 bg-gradient-to-b from-sidebar to-background/95 transition-all duration-500 ease-out",
        isCollapsed ? "w-14" : "w-72"
      )}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -left-3 top-6 z-20 w-6 h-6 rounded-full",
          "bg-card border border-border/50 flex items-center justify-center",
          "text-muted-foreground hover:text-foreground hover:border-primary/50",
          "transition-all duration-300 hover:scale-110"
        )}
      >
        {isCollapsed ? (
          <ChevronLeft className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>

      <div className={cn("relative z-10 p-4 space-y-6", isCollapsed && "px-2")}>
        {/* Header */}
        {!isCollapsed && (
          <div className="animate-fade-in">
            <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Fast access tools</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={cn(
                  "w-full group relative overflow-hidden rounded-xl transition-all duration-300",
                  "border border-transparent hover:border-primary/20",
                  "animate-fade-in-up"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={cn(
                  "flex items-center gap-3 p-3",
                  "bg-gradient-to-r from-white/5 to-transparent",
                  "hover:from-primary/10 hover:to-primary/5"
                )}>
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                    "bg-gradient-to-br transition-all duration-300",
                    "group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]",
                    iconBgClasses[action.color]
                  )}>
                    <Icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  {!isCollapsed && (
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {action.label}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Performance Summary */}
        {!isCollapsed && (
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Performance
            </h3>
            
            <div className="grid grid-cols-1 gap-2">
              <MiniStatCard
                label="Total Views"
                value={totalViews}
                icon={Eye}
                color="accent"
              />
              <MiniStatCard
                label="Total Clicks"
                value={totalClicks}
                icon={MousePointer}
                color="gold"
              />
              <MiniStatCard
                label="Conversion"
                value={`${conversionRate}%`}
                icon={TrendingUp}
                color="success"
              />
            </div>
          </div>
        )}

        {/* Top Product */}
        {!isCollapsed && topProduct && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-sellora-gold" />
              Top Product
            </h3>
            
            <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-sellora-gold/10 via-card/50 to-card/30 border border-sellora-gold/20">
              <div className="absolute inset-0 bg-gradient-to-br from-sellora-gold/5 to-transparent" />
              
              <div className="relative z-10">
                <p className="text-sm font-medium text-foreground truncate mb-2">
                  {topProduct.title}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-accent" />
                    {topProduct.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointer className="w-3 h-3 text-sellora-gold" />
                    {topProduct.clicks}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MiniStatCard: React.FC<{
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'primary' | 'accent' | 'gold' | 'success';
}> = ({ label, value, icon: Icon, color }) => (
  <div className={cn(
    "flex items-center gap-3 p-3 rounded-xl",
    "bg-gradient-to-r from-white/5 to-transparent",
    "border border-border/30 hover:border-primary/20 transition-all duration-300"
  )}>
    <div className={cn(
      "w-8 h-8 rounded-lg flex items-center justify-center",
      "bg-gradient-to-br",
      iconBgClasses[color]
    )}>
      <Icon className="w-4 h-4 text-primary-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value.toLocaleString()}</p>
    </div>
  </div>
);

export default DashboardRightSidebar;
