import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Eye, MousePointer, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PremiumStatsCard from '@/components/seller/PremiumStatsCard';
import { ViewsLineChart, ClicksBarChart } from '@/components/seller/SellerAnalyticsCharts';
import DashboardRightSidebar from '@/components/seller/DashboardRightSidebar';
import { useSellerAnalytics } from '@/hooks/useSellerAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

const SellerOverview = () => {
  const navigate = useNavigate();
  const { data, loading } = useSellerAnalytics();

  // Find top product by views
  const topProduct = data.products.length > 0
    ? data.products.reduce((max, p) => (p.views || 0) > (max.views || 0) ? p : max, data.products[0])
    : null;

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="flex-1 container mx-auto px-6 py-8 space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-12 w-40" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border/50">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                <Skeleton className="h-10 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border/50 h-[380px]">
              <Skeleton className="h-6 w-40 mb-6" />
              <Skeleton className="h-[280px] w-full" />
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border/50 h-[380px]">
              <Skeleton className="h-6 w-40 mb-6" />
              <Skeleton className="h-[280px] w-full" />
            </div>
          </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="w-72 border-l border-border/50 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Dashboard <span className="text-gradient">Overview</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your store performance and analytics
              </p>
            </div>
            <Button 
              onClick={() => navigate('/seller/add-product')}
              className="btn-glow group"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Add Product
            </Button>
          </div>

          {/* Premium Stats Cards */}
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

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ViewsLineChart data={data.viewsOverTime} loading={loading} />
            <ClicksBarChart data={data.clicksPerProduct} loading={loading} />
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <DashboardRightSidebar
        topProduct={topProduct ? {
          title: topProduct.title,
          views: topProduct.views || 0,
          clicks: topProduct.clicks || 0,
        } : null}
        totalViews={data.totalViews}
        totalClicks={data.totalClicks}
        conversionRate={data.conversionRate}
      />
    </div>
  );
};

export default SellerOverview;
