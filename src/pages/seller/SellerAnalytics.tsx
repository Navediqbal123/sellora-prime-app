import React from 'react';
import { Package, Eye, MousePointer, TrendingUp } from 'lucide-react';
import PremiumStatsCard from '@/components/seller/PremiumStatsCard';
import { ViewsLineChart, ClicksBarChart, CategoryDonutChart } from '@/components/seller/SellerAnalyticsCharts';
import { useSellerAnalytics } from '@/hooks/useSellerAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

const SellerAnalytics = () => {
  const { data, loading } = useSellerAnalytics();

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border/50">
              <Skeleton className="h-12 w-12 rounded-xl mb-4" />
              <Skeleton className="h-10 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-foreground">
          Performance <span className="text-gradient">Analytics</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Detailed insights into your store performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumStatsCard
          title="Total Products"
          value={data.totalProducts}
          icon={Package}
          color="primary"
          delay={0}
        />
        <PremiumStatsCard
          title="Total Views"
          value={data.totalViews}
          icon={Eye}
          color="accent"
          delay={0.1}
        />
        <PremiumStatsCard
          title="Total Clicks"
          value={data.totalClicks}
          icon={MousePointer}
          color="gold"
          delay={0.2}
        />
        <PremiumStatsCard
          title="Conversion Rate"
          value={data.conversionRate}
          icon={TrendingUp}
          suffix="%"
          color="success"
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ViewsLineChart data={data.viewsOverTime} loading={loading} />
        <ClicksBarChart data={data.clicksPerProduct} loading={loading} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategoryDonutChart data={data.productsByCategory} loading={loading} />
        
        {/* Product Performance List */}
        <div className="lg:col-span-2 relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-card via-card/80 to-card/40 border border-border/50 backdrop-blur-xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
          
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-6 text-foreground">Product Performance</h3>
            
            {data.products.length > 0 ? (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin">
                {data.products.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 
                              hover:bg-white/10 hover:border-primary/20 transition-all duration-300"
                    style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium truncate text-foreground">{product.title}</span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm flex-shrink-0 ml-4">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Eye className="w-4 h-4 text-accent" />
                        <span className="tabular-nums">{product.views || 0}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <MousePointer className="w-4 h-4 text-sellora-gold" />
                        <span className="tabular-nums">{product.clicks || 0}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground">No products to analyze yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
