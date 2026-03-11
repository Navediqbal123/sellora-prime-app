import React, { useState, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';
import { Product } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

interface FlashDealsProps {
  products: Product[];
  onProductClick: (id: string) => void;
}

const CountdownTimer: React.FC<{ endTime: Date }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = endTime.getTime() - now;
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1">
      {[
        { val: timeLeft.hours, label: 'H' },
        { val: timeLeft.minutes, label: 'M' },
        { val: timeLeft.seconds, label: 'S' },
      ].map((unit, i) => (
        <React.Fragment key={unit.label}>
          {i > 0 && <span className="text-primary font-bold text-xs">:</span>}
          <div className="bg-primary/20 border border-primary/30 rounded-md px-1.5 py-0.5 min-w-[28px] text-center">
            <span className="text-xs font-bold text-primary tabular-nums">{pad(unit.val)}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

const FlashDeals: React.FC<FlashDealsProps> = ({ products, onProductClick }) => {
  // End time = end of today
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  if (products.length === 0) return null;

  // Take first 6 cheapest products as "flash deals" with a fake discount
  const deals = products
    .slice()
    .sort((a, b) => a.price - b.price)
    .slice(0, 6)
    .map((p) => ({
      ...p,
      originalPrice: Math.round(p.price * (1.3 + Math.random() * 0.4)),
      discount: Math.floor(20 + Math.random() * 30),
    }));

  return (
    <div className="mb-10 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sellora-warning to-destructive flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Flash Deals</h2>
          <Badge variant="destructive" className="text-[10px] animate-pulse">LIVE</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground mr-1">Ends in</span>
          <CountdownTimer endTime={endOfDay} />
        </div>
      </div>

      {/* Horizontal scroll cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {deals.map((deal) => (
          <div
            key={deal.id}
            onClick={() => onProductClick(deal.id)}
            className="flex-shrink-0 w-36 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 
                       overflow-hidden cursor-pointer group hover:border-primary/30 hover:shadow-glow transition-all duration-300"
          >
            {/* Image */}
            <div className="relative h-28 bg-secondary overflow-hidden">
              {deal.image_url ? (
                <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                  <Zap className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}
              {/* Discount badge */}
              <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                -{deal.discount}%
              </div>
            </div>

            {/* Info */}
            <div className="p-2.5">
              <h4 className="text-xs font-semibold text-foreground truncate">{deal.title}</h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-sm font-bold text-gradient-gold">₹{deal.price.toLocaleString()}</span>
                <span className="text-[10px] text-muted-foreground line-through">₹{deal.originalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashDeals;
