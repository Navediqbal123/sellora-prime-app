import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Eye, MousePointer, TrendingUp, Plus, ArrowRight } from 'lucide-react';
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
    );
  }

  return (
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <QuickActionCard
          title="View All Products"
          description="Manage and edit your product listings"
          onClick={() => navigate('/seller/products')}
        />
        <QuickActionCard
          title="Add New Product"
          description="List a new product in your store"
          onClick={() => navigate('/seller/add-product')}
        />
        <QuickActionCard
          title="View Analytics"
          description="Detailed performance insights"
          onClick={() => navigate('/seller/analytics')}
        />
      </div>
    </div>
  );
};

const QuickActionCard: React.FC<{
  title: string;
  description: string;
  onClick: () => void;
}> = ({ title, description, onClick }) => (
  <button
    onClick={onClick}
    className="group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-card via-card/80 to-card/40 border border-border/50 text-left transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_40px_-10px_hsl(262,83%,58%,0.3)]"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="relative z-10">
      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 mt-4" />
    </div>
  </button>
);

export default SellerOverview;
