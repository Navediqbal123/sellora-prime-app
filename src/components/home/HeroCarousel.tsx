import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, Zap, Gift } from 'lucide-react';

interface Slide {
  badge: string;
  badgeIcon: React.ElementType;
  title: string;
  highlight: string;
  highlightSuffix: string;
  subtitle: string;
  cta: string;
  gradient: string;
}

const slides: Slide[] = [
  {
    badge: 'Limited Time',
    badgeIcon: Sparkles,
    title: 'Summer Sale',
    highlight: '50%',
    highlightSuffix: 'Off',
    subtitle: 'On top brands. Hurry, deals end soon!',
    cta: 'Shop Now',
    gradient:
      'radial-gradient(circle at 20% 20%,hsl(var(--primary)/0.45),transparent 55%),radial-gradient(circle at 85% 80%,hsl(var(--accent)/0.35),transparent 50%),linear-gradient(135deg,hsl(262 60% 18%),hsl(262 45% 10%))',
  },
  {
    badge: 'Flash Deals',
    badgeIcon: Zap,
    title: 'Mega Discounts',
    highlight: '70%',
    highlightSuffix: 'Off',
    subtitle: 'Electronics, fashion & more. Today only!',
    cta: 'Grab Deals',
    gradient:
      'radial-gradient(circle at 25% 25%,hsl(20 90% 55%/0.5),transparent 55%),radial-gradient(circle at 80% 80%,hsl(340 80% 50%/0.4),transparent 50%),linear-gradient(135deg,hsl(340 60% 18%),hsl(20 50% 12%))',
  },
  {
    badge: 'New Arrivals',
    badgeIcon: Gift,
    title: 'Fresh Drops',
    highlight: '100+',
    highlightSuffix: 'New',
    subtitle: 'Discover the latest from local sellers.',
    cta: 'Explore',
    gradient:
      'radial-gradient(circle at 25% 25%,hsl(180 80% 45%/0.45),transparent 55%),radial-gradient(circle at 80% 80%,hsl(220 80% 50%/0.4),transparent 50%),linear-gradient(135deg,hsl(200 60% 18%),hsl(220 50% 12%))',
  },
];

const HeroCarousel: React.FC<{ onShop?: () => void }> = ({ onShop }) => {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative"
      onTouchStart={() => (pausedRef.current = true)}
      onTouchEnd={() => (pausedRef.current = false)}
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((s, i) => {
            const BadgeIcon = s.badgeIcon;
            return (
              <div
                key={i}
                onClick={onShop}
                className="relative shrink-0 w-full cursor-pointer group border border-primary/30 rounded-2xl
                           p-2.5 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.5)]
                           hover:shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.6)] transition-shadow duration-500"
                style={{ background: s.gradient }}
              >
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/30 blur-3xl animate-float" />
                <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-accent/20 blur-3xl" />

                <div className="relative flex items-center justify-between gap-2.5 min-h-[78px]">
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-0.5">
                      <BadgeIcon className="w-2.5 h-2.5 text-sellora-gold" />
                      <span className="text-[7px] font-semibold text-white tracking-wider uppercase">{s.badge}</span>
                    </div>
                    <h2 className="text-sm font-extrabold text-white leading-tight">{s.title}</h2>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-lg font-black text-gradient-gold">{s.highlight}</span>
                      <span className="text-[11px] font-bold text-white/90">{s.highlightSuffix}</span>
                    </div>
                    <p className="text-[9px] text-white/70 mt-0.5 max-w-[200px] line-clamp-1">{s.subtitle}</p>

                    <button
                      className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-background text-[10px] font-semibold
                                 hover:bg-white/90 transition-all duration-300 group-hover:gap-3 shadow-lg"
                    >
                      {s.cta}
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <div className="flex relative w-[60px] h-[60px] shrink-0 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sellora-gold/40 to-primary/40 blur-2xl" />
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-primary/60 border-4 border-white/20
                                    flex flex-col items-center justify-center shadow-2xl rotate-[-8deg] group-hover:rotate-0 transition-transform duration-500">
                      <span className="text-[7px] font-bold text-white/80 uppercase tracking-wider">Up to</span>
                      <span className="text-sm font-black text-white">{s.highlight}</span>
                      <span className="text-[7px] font-bold text-white/80 uppercase tracking-wider">{s.highlightSuffix}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-6 bg-primary shadow-[0_0_8px_hsl(var(--primary))]' : 'w-1.5 bg-foreground/25 hover:bg-foreground/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;