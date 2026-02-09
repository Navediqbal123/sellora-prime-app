import React, { useState } from 'react';
import { MapPin, Eye, Package, Navigation } from 'lucide-react';
import { Product } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  delay?: number;
  isNearby?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, delay = 0, isNearby = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-2xl cursor-pointer
                 bg-gradient-to-br from-card to-card/50 border border-border/50
                 transform transition-all duration-500 ease-out
                 hover:scale-[1.02] hover:-translate-y-2 hover:border-primary/30
                 hover:shadow-glow-lg animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Image Container */}
      <div className="relative h-52 bg-secondary overflow-hidden">
        {product.image_url ? (
          <>
            {/* Skeleton while loading */}
            {!imageLoaded && (
              <div className="absolute inset-0 skeleton" />
            )}
            <img
              src={product.image_url}
              alt={product.title}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700
                         ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                         ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <Package className="w-14 h-14 text-muted-foreground/50 transition-transform duration-300 group-hover:scale-110" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent
                         transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Views Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 
                       bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full
                       border border-border/50 transition-transform duration-300
                       group-hover:scale-105">
          <Eye className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">{product.views || 0}</span>
        </div>

        {/* Near You Badge */}
        {isNearby && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 
                         bg-sellora-success/90 backdrop-blur-md px-3 py-1.5 rounded-full
                         text-white text-xs font-semibold shadow-lg animate-scale-in">
            <Navigation className="w-3 h-3" />
            Near You
          </div>
        )}

        {/* Category Badge (on hover, shifted if Near You badge is present) */}
        <div className={`absolute ${isNearby ? 'bottom-3' : 'top-3'} left-3 px-3 py-1.5 rounded-full
                       bg-primary/90 text-primary-foreground text-xs font-medium
                       transform transition-all duration-300
                       ${isNearby ? 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0' : 'opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}>
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-foreground truncate 
                      transition-colors duration-300 group-hover:text-primary">
          {product.title}
        </h3>
        
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>{product.city}, {product.state}</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-2xl font-bold text-gradient-gold">
            ₹{product.price.toLocaleString()}
          </p>
          
          {/* View button that appears on hover */}
          <div className="transform transition-all duration-300 opacity-0 translate-x-4 
                         group-hover:opacity-100 group-hover:translate-x-0">
            <span className="text-sm font-medium text-primary">View →</span>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-sellora-gold 
                      transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

      {/* Ripple effect on click */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 bg-primary/10 transform scale-0 rounded-full
                        transition-transform duration-500 origin-center
                        ${isHovered ? '' : ''}`} />
      </div>
    </div>
  );
};

export default ProductCard;
