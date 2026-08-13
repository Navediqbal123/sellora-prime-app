import React, { useMemo, useState } from 'react';
import { Heart, Star, Package } from 'lucide-react';
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

  const { rating, reviews } = useMemo(() => {
    const seed = (product.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return { rating: (3.9 + ((seed % 10) / 10)).toFixed(1), reviews: 40 + (seed % 400) };
  }, [product.id]);

  return (
    <div
      onClick={onClick}
      style={{
        animationDelay: `${delay}s`,
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 2px rgba(15,15,25,0.03)',
      }}
      className="group relative overflow-hidden rounded-[16px] cursor-pointer animate-fade-in-up transition-transform duration-300 active:scale-[0.98]"
    >
      <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: '#FAFAFC' }}>
        {product.image_url ? (
          <>
            {!imgLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={product.image_url}
              alt={product.title}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={28} strokeWidth={1.6} style={{ color: '#C7C9D1' }} />
          </div>
        )}

        {onToggleWishlist && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(); }}
            aria-label="Toggle wishlist"
            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDF1' }}
          >
            <Heart
              size={16}
              strokeWidth={1.9}
              style={{ color: isWishlisted ? '#DC2626' : '#111111', fill: isWishlisted ? '#DC2626' : 'transparent' }}
            />
          </button>
        )}
      </div>

      <div className="p-2.5">
        <h3 className="text-[12.5px] font-semibold leading-snug line-clamp-1" style={{ color: '#111111' }}>
          {product.title}
        </h3>

        <div className="flex items-center gap-1 mt-1">
          <Star size={11} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
          <span className="text-[11px] font-semibold" style={{ color: '#111111' }}>{rating}</span>
          <span className="text-[11px]" style={{ color: '#6B7280' }}>({reviews})</span>
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-[14px] font-bold" style={{ color: '#111111' }}>
            ₹{product.price.toLocaleString()}
          </span>
        </div>

        <p className="text-[10.5px] font-semibold mt-0.5" style={{ color: '#16A34A' }}>Free Delivery</p>
      </div>
    </div>
  );
};

export default DiscountProductCard;
