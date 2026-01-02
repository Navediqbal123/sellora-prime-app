import React from 'react';

interface SkeletonGridProps {
  count?: number;
}

const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 8 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className="overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 
                    border border-border/50 animate-fade-in"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          {/* Image skeleton */}
          <div className="h-52 skeleton" />
          
          {/* Content skeleton */}
          <div className="p-5 space-y-4">
            <div className="skeleton h-5 rounded-lg w-3/4" />
            <div className="skeleton h-4 rounded-lg w-1/2" />
            <div className="skeleton h-7 rounded-lg w-1/3" />
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonGrid;
