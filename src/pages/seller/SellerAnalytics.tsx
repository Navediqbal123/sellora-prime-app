import React from 'react';
import { Package, Eye, MousePointer, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import PremiumStatsCard from '@/components/seller/PremiumStatsCard';
import { ViewsLineChart, ClicksBarChart, CategoryDonutChart } from '@/components/seller/SellerAnalyticsCharts';
import EmptyAnalyticsState from '@/components/seller/EmptyAnalyticsState';
import { useSellerAnalytics } from '@/hooks/useSellerAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border/50 h-[380px]">
              <Skeleton className="h-6 w-40 mb-6" />
              <Skeleton className="h-[280px] w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Check if there's no data
  if (data.totalProducts === 0) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-fade-in-up mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Performance <span className="text-gradient">Analytics</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Detailed insights into your store performance
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card/80 to-card/40 border border-border/50">
          <EmptyAnalyticsState type="products" />
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

      {/* Stats Cards with Growth Indicators */}
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
          trend={data.totalViews > 0 ? 'up' : undefined}
          trendValue={data.totalViews > 0 ? '+12%' : undefined}
        />
        <PremiumStatsCard
          title="Total Clicks"
          value={data.totalClicks}
          icon={MousePointer}
          color="gold"
          delay={0.2}
          trend={data.totalClicks > 0 ? 'up' : undefined}
          trendValue={data.totalClicks > 0 ? '+8%' : undefined}
        />
        <PremiumStatsCard
          title="Conversion Rate"
          value={data.conversionRate}
          icon={TrendingUp}
          suffix="%"
          color="success"
          delay={0.3}
          trend={data.conversionRate > 5 ? 'up' : data.conversionRate > 0 ? 'down' : undefined}
          trendValue={data.conversionRate > 5 ? '+2.5%' : data.conversionRate > 0 ? '-1.2%' : undefined}
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
                {data.products.map((product, index) => {
                  const convRate = (product.views || 0) > 0 
                    ? Math.round(((product.clicks || 0) / (product.views || 1)) * 100)
                    : 0;
                  const isTopPerformer = index === 0;
                  
                  return (
                    <div 
                      key={product.id} 
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                        "hover:bg-white/10 hover:border-primary/30",
                        isTopPerformer 
                          ? "bg-gradient-to-r from-sellora-gold/10 to-transparent border-sellora-gold/20" 
                          : "bg-white/5 border-white/5"
                      )}
                      style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          isTopPerformer 
                            ? "bg-gradient-to-br from-sellora-gold/30 to-sellora-gold/10" 
                            : "bg-gradient-to-br from-primary/20 to-accent/20"
                        )}>
                          <Package className={cn(
                            "w-5 h-5",
                            isTopPerformer ? "text-sellora-gold" : "text-primary"
                          )} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium truncate text-foreground block">{product.title}</span>
                          {isTopPerformer && (
                            <span className="text-xs text-sellora-gold">Top Performer</span>
                          )}
                        </div>
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
                        <span className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          convRate >= 10 
                            ? "bg-sellora-success/20 text-sellora-success" 
                            : convRate >= 5 
                              ? "bg-sellora-gold/20 text-sellora-gold"
                              : "bg-muted/50 text-muted-foreground"
                        )}>
                          {convRate >= 5 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : convRate > 0 ? (
                            <ArrowDownRight className="w-3 h-3" />
                          ) : null}
                          {convRate}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyAnalyticsState type="products" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
