import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const HeroBanner: React.FC<{ onShop?: () => void }> = ({ onShop }) => {
  return (
    <div
      onClick={onShop}
      className="relative overflow-hidden rounded-2xl cursor-pointer group
                 border border-primary/30
                 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.45),transparent_55%),radial-gradient(circle_at_85%_80%,hsl(var(--accent)/0.35),transparent_50%),linear-gradient(135deg,hsl(262_60%_18%),hsl(262_45%_10%))]
                 p-3.5 md:p-7 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.5)]
                 hover:shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.6)] transition-all duration-500"
    >
      {/* Floating glow orbs */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-primary/30 blur-3xl animate-float" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-2">
            <Sparkles className="w-2.5 h-2.5 text-sellora-gold" />
            <span className="text-[9px] font-semibold text-white tracking-wider uppercase">Limited Time</span>
          </div>
          <h2 className="text-lg md:text-4xl font-extrabold text-white leading-tight">
            Summer Sale
          </h2>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl md:text-5xl font-black text-gradient-gold">50%</span>
            <span className="text-sm md:text-xl font-bold text-white/90">Off</span>
          </div>
          <p className="text-[10px] md:text-sm text-white/70 mt-1 max-w-xs">
            On top brands. Hurry, deals end soon!
          </p>

          <button className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-background text-xs font-semibold
                             hover:bg-white/90 transition-all duration-300 group-hover:gap-3 shadow-lg">
            Shop Now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Decorative price tag */}
        <div className="flex relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 shrink-0 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sellora-gold/40 to-primary/40 blur-2xl" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-primary/60 border-4 border-white/20
                          flex flex-col items-center justify-center shadow-2xl rotate-[-8deg] group-hover:rotate-0 transition-transform duration-500">
            <span className="text-[8px] sm:text-[10px] font-bold text-white/80 uppercase tracking-wider">Up to</span>
            <span className="text-xl sm:text-3xl md:text-4xl font-black text-white">50%</span>
            <span className="text-[8px] sm:text-[10px] font-bold text-white/80 uppercase tracking-wider">Off</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;