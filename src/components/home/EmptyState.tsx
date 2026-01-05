import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface EmptyStateProps {
  searchQuery: string;
  showSellerButton?: boolean; // kept for backwards compat, but unused
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery }) => {
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
      
      <p className="text-muted-foreground text-center max-w-md">
        {searchQuery 
          ? `We couldn't find anything matching "${searchQuery}". Try adjusting your search or filters.` 
          : 'Products will appear here once sellers start listing.'
        }
      </p>
    </div>
  );
};

export default EmptyState;
