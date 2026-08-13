import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import heroProducts from '@/assets/hero-products.png';

interface Slide {
  label: string;
  title: string;
  highlight: string;
  highlightSuffix: string;
  subtitle: string;
  cta: string;
  bg: string;
}

const slides: Slide[] = [
  {
    label: 'Limited Time Offer',
    title: 'Summer Sale',
    highlight: '50%',
    highlightSuffix: 'Off',
    subtitle: 'On top brands. Hurry, deals end soon!',
    cta: 'Shop Now',
    bg: 'linear-gradient(120deg,#F5F0FF 0%,#F8F5FF 55%,#FDFBFF 100%)',
  },
  {
    label: 'Flash Deals',
    title: 'Mega Savings',
    highlight: '70%',
    highlightSuffix: 'Off',
    subtitle: 'Electronics, fashion & more. Today only!',
    cta: 'Grab Deals',
    bg: 'linear-gradient(120deg,#FFF3F0 0%,#FFF7F4 55%,#FFFCFB 100%)',
  },
  {
    label: 'New Arrivals',
    title: 'Fresh Drops',
    highlight: '100+',
    highlightSuffix: 'New',
    subtitle: 'Discover the latest from local sellers.',
    cta: 'Explore',
    bg: 'linear-gradient(120deg,#EEF6FF 0%,#F4F9FF 55%,#FBFDFF 100%)',
  },
];

const HeroCarousel: React.FC<{ onShop?: () => void }> = ({ onShop }) => {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % slides.length);
    }, 4500);
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
      <div
        className="overflow-hidden rounded-[20px]"
        style={{ border: '1px solid #EFEAFB', boxShadow: '0 1px 2px rgba(15,15,25,0.03), 0 14px 30px -22px rgba(109,40,217,0.25)' }}
      >
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              onClick={onShop}
              className="relative shrink-0 w-full h-[186px] md:h-[210px] cursor-pointer overflow-hidden"
              style={{ background: s.bg }}
            >
              <img
                src={heroProducts}
                alt="Featured products: suitcase, headphones and sneaker"
                loading={i === 0 ? 'eager' : 'lazy'}
                className="absolute right-[-6px] bottom-0 h-[86%] w-auto object-contain pointer-events-none select-none"
              />
              <div className="relative h-full flex flex-col justify-center gap-1.5 pl-4 pr-[46%] md:pl-6">
                <div className="inline-flex self-start items-center gap-1">
                  <Sparkles size={12} strokeWidth={2.2} style={{ color: '#7C3AED' }} />
                  <span className="text-[10px] font-bold tracking-[0.09em] uppercase" style={{ color: '#7C3AED' }}>
                    {s.label}
                  </span>
                </div>
                <h2 className="text-[21px] md:text-[26px] font-bold leading-[1.12] tracking-tight" style={{ color: '#111111' }}>
                  {s.title}
                  <br />
                  Up to <span style={{ color: '#7C3AED' }}>{s.highlight}</span> {s.highlightSuffix}
                </h2>
                <p className="text-[11.5px] leading-snug" style={{ color: '#6B7280' }}>{s.subtitle}</p>
                <button
                  className="mt-1 self-start inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12.5px] font-semibold text-white transition-transform active:scale-95"
                  style={{ backgroundColor: '#111111' }}
                >
                  {s.cta}
                  <ArrowRight size={14} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === index ? 20 : 6,
              backgroundColor: i === index ? '#7C3AED' : '#E0E1E6',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
