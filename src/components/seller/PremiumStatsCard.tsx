import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface PremiumStatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  suffix?: string;
  prefix?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: 'primary' | 'accent' | 'gold' | 'success';
  delay?: number;
}

const colorConfig = {
  primary: {
    gradient: 'from-primary/30 via-primary/10 to-transparent',
    iconBg: 'from-primary to-primary/70',
    text: 'text-primary',
    border: 'border-primary/30',
    glow: 'hover:shadow-[0_0_50px_-12px_hsl(262,83%,58%)]',
  },
  accent: {
    gradient: 'from-accent/30 via-accent/10 to-transparent',
    iconBg: 'from-accent to-accent/70',
    text: 'text-accent',
    border: 'border-accent/30',
    glow: 'hover:shadow-[0_0_50px_-12px_hsl(168,84%,44%)]',
  },
  gold: {
    gradient: 'from-sellora-gold/30 via-sellora-gold/10 to-transparent',
    iconBg: 'from-sellora-gold to-sellora-gold/70',
    text: 'text-sellora-gold',
    border: 'border-sellora-gold/30',
    glow: 'hover:shadow-[0_0_50px_-12px_hsl(45,93%,58%)]',
  },
  success: {
    gradient: 'from-sellora-success/30 via-sellora-success/10 to-transparent',
    iconBg: 'from-sellora-success to-sellora-success/70',
    text: 'text-sellora-success',
    border: 'border-sellora-success/30',
    glow: 'hover:shadow-[0_0_50px_-12px_hsl(142,76%,36%)]',
  },
};

const PremiumStatsCard: React.FC<PremiumStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  suffix = '',
  prefix = '',
  trend,
  trendValue,
  color,
  delay = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const config = colorConfig[color];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible || value === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 1500;
    const steps = 60;
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
  }, [value, isVisible]);

  return (
    <div
      className={`
        relative overflow-hidden p-6 rounded-2xl
        bg-gradient-to-br from-card via-card/80 to-card/40
        border ${config.border} backdrop-blur-xl
        transition-all duration-500 ease-out
        hover:scale-[1.02] hover:-translate-y-1
        ${config.glow}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        group cursor-default
      `}
      style={{ transitionDelay: `${delay}s` }}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
      
      {/* Background gradient blob */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${config.gradient} blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.iconBg} flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          {trend && trendValue && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up'
                ? 'bg-sellora-success/20 text-sellora-success' 
                : 'bg-destructive/20 text-destructive'
            }`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-xl text-muted-foreground">{prefix}</span>}
            <span className={`text-4xl font-bold ${config.text} tabular-nums tracking-tight`}>
              {displayValue.toLocaleString()}
            </span>
            {suffix && <span className="text-lg text-muted-foreground ml-1">{suffix}</span>}
          </div>
        </div>

        {/* Title */}
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
      </div>
    </div>
  );
};

export default PremiumStatsCard;
