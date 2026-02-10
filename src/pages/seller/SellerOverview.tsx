import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Eye, MousePointer, TrendingUp, Plus, BarChart3, ClipboardList, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PremiumStatsCard from '@/components/seller/PremiumStatsCard';
import { ViewsLineChart, ClicksBarChart } from '@/components/seller/SellerAnalyticsCharts';
import { useSellerAnalytics } from '@/hooks/useSellerAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

const SellerOverview = () => {
  const navigate = useNavigate();
  const { data, loading } = useSellerAnalytics();

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 space-y-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[380px] rounded-2xl" />
          <Skeleton className="h-[380px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: Plus, label: 'Add Product', path: '/seller/add-product', color: 'primary' as const },
    { icon: ClipboardList, label: 'View Orders', path: '/seller/orders', color: 'accent' as const },
    { icon: BarChart3, label: 'View Analytics', path: '/seller/analytics', color: 'gold' as const },
  ];

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-foreground">
          Sellora <span className="text-gradient">Seller Hub</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your store performance and analytics
        </p>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="group relative overflow-hidden rounded-xl border border-border/50 
                         bg-gradient-to-r from-card to-card/60 p-4
                         hover:border-primary/30 hover:shadow-glow transition-all duration-300
                         flex items-center gap-4"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left relative z-10">
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </span>
                <p className="text-xs text-muted-foreground">Quick action</p>
              </div>
              <Zap className="w-4 h-4 text-muted-foreground/30 ml-auto group-hover:text-primary/50 transition-colors" />
            </button>
          );
        })}
      </div>

      {/* Performance Stats — Glassmorphism Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumStatsCard title="Total Products" value={data.totalProducts} icon={Package} color="primary" delay={0} />
        <PremiumStatsCard title="Total Views" value={data.totalViews} icon={Eye} color="accent" delay={0.1} />
        <PremiumStatsCard title="Total Clicks" value={data.totalClicks} icon={MousePointer} color="gold" delay={0.2} />
        <PremiumStatsCard title="Conversion Rate" value={data.conversionRate} icon={TrendingUp} suffix="%" color="success" delay={0.3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ViewsLineChart data={data.viewsOverTime} loading={loading} />
        <ClicksBarChart data={data.clicksPerProduct} loading={loading} />
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Recent Products
        </h3>
        {data.products.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">No products yet. Add your first product to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-3 px-2 font-medium">Product</th>
                  <th className="text-right py-3 px-2 font-medium">Price</th>
                  <th className="text-right py-3 px-2 font-medium">Views</th>
                  <th className="text-right py-3 px-2 font-medium">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {data.products.slice(0, 5).map((product: any) => (
                  <tr key={product.id} className="border-b border-border/30 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[200px]">{product.title}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 text-foreground font-semibold">₹{product.price?.toLocaleString()}</td>
                    <td className="text-right py-3 px-2 text-muted-foreground">{product.views || 0}</td>
                    <td className="text-right py-3 px-2 text-muted-foreground">{product.clicks || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOverview;
