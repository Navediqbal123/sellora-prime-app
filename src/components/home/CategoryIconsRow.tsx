import React from 'react';
import { Smartphone, Shirt, Home as HomeIcon, Sparkles, Dumbbell, LayoutGrid } from 'lucide-react';

interface CategoryIconsRowProps {
  selected: string;
  onSelect: (id: string) => void;
}

const items = [
  { id: 'all', label: 'All', icon: LayoutGrid, color: 'from-primary to-primary/60' },
  { id: 'Electronics', label: 'Electronics', icon: Smartphone, color: 'from-blue-500 to-cyan-400' },
  { id: 'Fashion', label: 'Fashion', icon: Shirt, color: 'from-pink-500 to-rose-400' },
  { id: 'Home & Living', label: 'Home', icon: HomeIcon, color: 'from-amber-500 to-orange-400' },
  { id: 'Beauty', label: 'Beauty', icon: Sparkles, color: 'from-fuchsia-500 to-purple-400' },
  { id: 'Sports', label: 'Sports', icon: Dumbbell, color: 'from-emerald-500 to-teal-400' },
];

const CategoryIconsRow: React.FC<CategoryIconsRowProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x">
      {items.map((item) => {
        const Icon = item.icon;
        const active = selected === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="flex flex-col items-center gap-1.5 shrink-0 snap-start group"
          >
            <div
              className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
                ${active
                  ? `bg-gradient-to-br ${item.color} shadow-[0_8px_20px_-6px_hsl(var(--primary)/0.6)] scale-105`
                  : 'bg-card border border-border/60 group-hover:border-primary/40 group-hover:scale-105'}`}
            >
              <Icon className={`w-6 h-6 transition-colors ${active ? 'text-white' : 'text-foreground/80'}`} />
              {active && <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />}
            </div>
            <span className={`text-[11px] font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryIconsRow;