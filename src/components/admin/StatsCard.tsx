import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: 'primary' | 'accent' | 'gold' | 'success' | 'warning';
  onClick?: () => void;
  delay?: number;
}

const colorClasses = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    glow: 'hover:shadow-[0_0_30px_-5px_hsl(262,83%,58%,0.4)]',
  },
  accent: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    glow: 'hover:shadow-[0_0_30px_-5px_hsl(168,84%,44%,0.4)]',
  },
  gold: {
    bg: 'bg-sellora-gold/10',
    text: 'text-sellora-gold',
    glow: 'hover:shadow-[0_0_30px_-5px_hsl(45,93%,58%,0.4)]',
  },
  success: {
    bg: 'bg-sellora-success/10',
    text: 'text-sellora-success',
    glow: 'hover:shadow-[0_0_30px_-5px_hsl(142,76%,36%,0.4)]',
  },
  warning: {
    bg: 'bg-sellora-warning/10',
    text: 'text-sellora-warning',
    glow: 'hover:shadow-[0_0_30px_-5px_hsl(38,92%,50%,0.4)]',
  },
};

const StatsCard: React.FC<StatsCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  onClick,
  delay = 0 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Count-up animation
  useEffect(() => {
    if (value === 0) return;
    
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const colors = colorClasses[color];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden p-6 rounded-2xl cursor-pointer
                  bg-gradient-to-br from-card to-card/50 border border-border/50
                  transform transition-all duration-500 ease-out
                  hover:scale-[1.02] hover:-translate-y-1 hover:border-primary/30
                  ${colors.glow} animate-fade-in-up group`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Ripple effect on click */}
      <div className={`absolute inset-0 transition-opacity duration-300
                       ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`absolute inset-0 ${colors.bg} animate-pulse`} />
      </div>

      {/* Glow orb */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full 
                       ${colors.bg} blur-3xl opacity-0 group-hover:opacity-50 
                       transition-opacity duration-500`} />

      {/* Content */}
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-4
                        transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className={`w-7 h-7 ${colors.text}`} />
        </div>
        
        <p className="text-muted-foreground text-sm mb-1">{label}</p>
        <p className={`text-4xl font-bold text-foreground transition-all duration-300
                       ${isHovered ? 'scale-105' : ''}`}>
          {displayValue.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
