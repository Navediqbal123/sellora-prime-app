import React, { useState } from 'react';
import { Filter, X, MapPin, IndianRupee, ChevronDown, ChevronUp } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchFiltersProps {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  location: string;
  onLocationChange: (loc: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: { id: string; label: string }[];
  onClearAll: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  priceRange,
  onPriceRangeChange,
  location,
  onLocationChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onClearAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < 100000 || location.trim() !== '' || selectedCategory !== 'all';

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/80 border border-border/50 
                   text-sm font-medium text-foreground hover:bg-secondary transition-all duration-300 mx-auto"
      >
        <Filter className="w-4 h-4 text-primary" />
        Filters
        {hasActiveFilters && (
          <Badge variant="default" className="ml-1 text-[10px] px-1.5 py-0 h-4">Active</Badge>
        )}
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Filter Panel */}
      <div className={`overflow-hidden transition-all duration-400 ease-out ${isOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="glass-card rounded-2xl p-4 space-y-4 border border-border/50 animate-fade-in">
          
          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="w-3 h-3" /> Price Range
            </label>
            <Slider
              value={priceRange}
              onValueChange={(val) => onPriceRangeChange(val as [number, number])}
              min={0}
              max={100000}
              step={500}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₹{priceRange[0].toLocaleString()}</span>
              <span>₹{priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> Location
            </label>
            <Input
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Enter city name..."
              className="h-9 text-sm bg-secondary/50 border-border/50"
            />
          </div>

          {/* Category Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                    ${selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground shadow-button scale-105'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear All */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs text-destructive hover:text-destructive/80 w-full"
            >
              <X className="w-3 h-3 mr-1" /> Clear All Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
