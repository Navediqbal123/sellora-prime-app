import React from 'react';
import { Smartphone, Shirt, Sparkles, Dumbbell, LayoutGrid } from 'lucide-react';

interface CategoryIconsRowProps {
  selected: string;
  onSelect: (id: string) => void;
}

const items = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'Electronics', label: 'Electronics', icon: Smartphone },
  { id: 'Fashion', label: 'Fashion', icon: Shirt },
  { id: 'Beauty', label: 'Beauty', icon: Sparkles },
  { id: 'Sports', label: 'Sports', icon: Dumbbell },
];

const CategoryIconsRow: React.FC<CategoryIconsRowProps> = ({ selected, onSelect }) => (
  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
    {items.map((item) => {
      const Icon = item.icon;
      const active = selected === item.id;
      return (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="flex flex-col items-center gap-1.5 flex-1 min-w-[62px] transition-transform duration-200 active:scale-95"
        >
          <div
            className="w-[58px] h-[58px] rounded-[18px] flex items-center justify-center transition-colors duration-300"
            style={
              active
                ? { backgroundColor: '#7C3AED', boxShadow: '0 10px 22px -12px rgba(124,58,237,0.65)' }
                : { backgroundColor: '#F7F7F8', border: '1px solid #EDEDF1' }
            }
          >
            <Icon size={23} strokeWidth={1.9} style={{ color: active ? '#FFFFFF' : '#111111' }} />
          </div>
          <span
            className="text-[11.5px] truncate max-w-full"
            style={{ color: active ? '#7C3AED' : '#4B5563', fontWeight: active ? 600 : 500 }}
          >
            {item.label}
          </span>
        </button>
      );
    })}
  </div>
);

export default CategoryIconsRow;
