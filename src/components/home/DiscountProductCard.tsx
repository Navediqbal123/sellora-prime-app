import React, { useMemo, useState } from 'react';
import { Heart, Star, Package, MapPin } from 'lucide-react';
import { Product } from '@/lib/supabase';

interface DiscountProductCardProps {
  product: Product;
  onClick: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  delay?: number;
}

const DiscountProductCard: React.FC<DiscountProductCardProps> = ({
  product,
  onClick,
  isWishlisted = false,
  onToggleWishlist,
  delay = 0,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  // Deterministic pseudo-discount based on product id
  const { discount, originalPrice, rating } = useMemo(() => {
    const seed = (product.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const disc = 15 + (seed % 45); // 15-60%
    const original = Math.round(product.price / (1 - disc / 100));
    const rate = (3.5 + ((seed % 15) / 10)).toFixed(1); // 3.5 - 4.9
    return { discount: disc, originalPrice: original, rating: rate };
  }, [product.id, product.price]);

  return (
    <div
      onClick={onClick}
      style={{ animationDelay: `${delay}s` }}
      className="group relative overflow-hidden rounded-2xl cursor-pointer animate-fade-in-up
                 bg-card border border-border/50
                 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40
                 hover:shadow-[0_12px_30px_-10px_hsl(var(--primary)/0.5)]"
    >
      {/* Image */}
      <div className="relative aspect-square bg-secondary overflow-hidden">
        {product.image_url ? (
          <>
            {!imgLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={product.image_url}
              alt={product.title}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700
                ${imgLoaded ? 'opacity-100' : 'opacity-0'}
                group-hover:scale-110`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <Package className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}

        {/* Discount badge */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-destructive text-destructive-foreground
                        text-[10px] font-extrabold tracking-wide shadow-lg">
          -{discount}%
        </div>

        {/* Wishlist */}
        {onToggleWishlist && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(); }}
            aria-label="Toggle wishlist"
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/70 backdrop-blur-md
                       border border-border/50 flex items-center justify-center
                       transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
          <Star className="w-3 h-3 fill-sellora-gold text-sellora-gold" />
          <span className="font-medium text-foreground">{rating}</span>
          <span className="mx-1 opacity-50">•</span>
          <MapPin className="w-3 h-3" />
          <span className="truncate">{product.city || '—'}</span>
        </div>

        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-base font-extrabold text-foreground">
            ₹{product.price.toLocaleString()}
          </span>
          <span className="text-[11px] text-muted-foreground line-through">
            ₹{originalPrice.toLocaleString()}
          </span>
          <span className="ml-auto text-[11px] font-bold text-sellora-success">
            -{discount}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default DiscountProductCard;