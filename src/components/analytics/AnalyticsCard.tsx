import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  suffix?: string;
  prefix?: string;
  color: 'primary' | 'accent' | 'gold' | 'success';
  delay?: number;
}

const colorClasses = {
  primary: {
    gradient: 'from-primary/20 via-primary/10 to-transparent',
    text: 'text-primary',
    glow: 'shadow-[0_0_40px_-10px_hsl(262,83%,58%,0.5)]',
  },
  accent: {
    gradient: 'from-accent/20 via-accent/10 to-transparent',
    text: 'text-accent',
    glow: 'shadow-[0_0_40px_-10px_hsl(168,84%,44%,0.5)]',
  },
  gold: {
    gradient: 'from-sellora-gold/20 via-sellora-gold/10 to-transparent',
    text: 'text-sellora-gold',
    glow: 'shadow-[0_0_40px_-10px_hsl(45,93%,58%,0.5)]',
  },
  success: {
    gradient: 'from-sellora-success/20 via-sellora-success/10 to-transparent',
    text: 'text-sellora-success',
    glow: 'shadow-[0_0_40px_-10px_hsl(142,76%,36%,0.5)]',
  },
};

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  icon: Icon,
  suffix = '',
  prefix = '',
  color,
  delay = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const colors = colorClasses[color];

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 1200;
    const steps = 40;
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

  return (
    <div
      className={`relative overflow-hidden p-6 rounded-2xl 
                  bg-gradient-to-br from-card to-card/50 border border-border/50
                  hover:border-primary/30 transition-all duration-500
                  hover:${colors.glow} animate-fade-in-up group`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-50`} />

      {/* Floating icon */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full 
                       ${colors.gradient} blur-2xl opacity-0 group-hover:opacity-100 
                       transition-opacity duration-500`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground font-medium">{title}</span>
          <Icon className={`w-6 h-6 ${colors.text} transform transition-transform 
                           duration-300 group-hover:scale-110 group-hover:rotate-12`} />
        </div>

        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-2xl text-muted-foreground">{prefix}</span>}
          <span className={`text-4xl font-bold ${colors.text}`}>
            {displayValue.toLocaleString()}
          </span>
          {suffix && <span className="text-lg text-muted-foreground ml-1">{suffix}</span>}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCard;
