import React from 'react';
import { BarChart3, TrendingUp, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyAnalyticsStateProps {
  type?: 'products' | 'views' | 'general';
}

const EmptyAnalyticsState: React.FC<EmptyAnalyticsStateProps> = ({ type = 'general' }) => {
  const navigate = useNavigate();

  const content = {
    products: {
      icon: Package,
      title: "No products yet",
      description: "Add your first product to start tracking analytics",
      action: "Add Product",
      path: "/seller/add-product",
    },
    views: {
      icon: TrendingUp,
      title: "No data available",
      description: "Your products haven't received any views yet",
      action: "View Products",
      path: "/seller/products",
    },
    general: {
      icon: BarChart3,
      title: "No analytics data",
      description: "Start selling to see your performance metrics",
      action: "Get Started",
      path: "/seller/add-product",
    },
  };

  const { icon: Icon, title, description, action, path } = content[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Animated icon container */}
      <div className="relative mb-6">
        {/* Outer glow rings */}
        <div className="absolute inset-0 w-24 h-24 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-2 w-20 h-20 rounded-full bg-primary/20 animate-pulse" />
        
        {/* Icon container */}
        <div className={cn(
          "relative w-24 h-24 rounded-full flex items-center justify-center",
          "bg-gradient-to-br from-primary/30 via-primary/20 to-accent/20",
          "border border-primary/30 animate-float"
        )}>
          <Icon className="w-10 h-10 text-primary" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold text-foreground mb-2 animate-fade-in-up">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {description}
      </p>

      {/* Action button */}
      <Button
        onClick={() => navigate(path)}
        className="btn-glow animate-fade-in-up"
        style={{ animationDelay: '0.2s' }}
      >
        {action}
      </Button>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
};

export default EmptyAnalyticsState;
