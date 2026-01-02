import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  searchQuery: string;
  showSellerButton: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery, showSellerButton }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 animate-fade-in">
      {/* Animated illustration */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 
                       flex items-center justify-center animate-float">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/50" />
        </div>
        
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
          <div className="absolute top-0 left-1/2 w-3 h-3 rounded-full bg-primary/50 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>
          <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-accent/50" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-foreground mb-3">
        No products found
      </h3>
      
      <p className="text-muted-foreground text-center max-w-md mb-8">
        {searchQuery 
          ? `We couldn't find anything matching "${searchQuery}". Try adjusting your search or filters.` 
          : 'Be the first to list a product and start selling!'
        }
      </p>

      {showSellerButton && (
        <Link to="/become-seller">
          <Button className="btn-glow px-8 py-6 text-lg font-semibold group">
            <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
            Start Selling
          </Button>
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
