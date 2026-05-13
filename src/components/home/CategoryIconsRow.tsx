import React from 'react';
import { Smartphone, Shirt, Sparkles, Dumbbell, LayoutGrid } from 'lucide-react';

interface CategoryIconsRowProps {
  selected: string;
  onSelect: (id: string) => void;
}

const items = [
  { id: 'all', label: 'All', icon: LayoutGrid, color: 'from-primary to-primary/60' },
  { id: 'Electronics', label: 'Electronics', icon: Smartphone, color: 'from-blue-500 to-cyan-400' },
  { id: 'Fashion', label: 'Fashion', icon: Shirt, color: 'from-pink-500 to-rose-400' },
  { id: 'Beauty', label: 'Beauty', icon: Sparkles, color: 'from-fuchsia-500 to-purple-400' },
  { id: 'Sports', label: 'Sports', icon: Dumbbell, color: 'from-emerald-500 to-teal-400' },
];

const CategoryIconsRow: React.FC<CategoryIconsRowProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex justify-between gap-2 pb-1.5 px-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = selected === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="flex flex-col items-center gap-1.5 flex-1 min-w-0 group active:scale-95 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <div
              className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                ${active
                  ? `bg-gradient-to-br ${item.color} shadow-[0_8px_20px_-6px_hsl(var(--primary)/0.6)] scale-105`
                  : 'bg-card border border-border/60 group-hover:border-primary/40 group-hover:scale-105'}`}
            >
              <Icon className={`w-7 h-7 transition-colors ${active ? 'text-white' : 'text-foreground/80'}`} />
            </div>
            <span className={`text-[13px] font-medium transition-colors truncate max-w-full ${active ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryIconsRow;