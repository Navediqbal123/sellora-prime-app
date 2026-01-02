import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div 
      className={`relative transition-all duration-500 ease-out
                  ${isFocused ? 'transform scale-[1.02]' : ''}`}
    >
      {/* Glow effect */}
      <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-accent to-primary
                       blur-xl transition-opacity duration-500
                       ${isFocused ? 'opacity-30' : 'opacity-0'}`} />
      
      {/* Input container */}
      <div className="relative">
        <Search 
          className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300
                     ${isFocused ? 'text-primary scale-110' : 'text-muted-foreground'}`} 
        />
        
        <input
          type="text"
          placeholder="Search for amazing products..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-card border rounded-2xl pl-14 pr-14 py-5 text-foreground text-lg
                     placeholder:text-muted-foreground/60 transition-all duration-300
                     focus:outline-none
                     ${isFocused 
                       ? 'border-primary ring-4 ring-primary/20 shadow-glow' 
                       : 'border-border hover:border-border/80'}`}
        />

        {/* AI sparkle indicator */}
        <div className={`absolute right-5 top-1/2 -translate-y-1/2 transition-all duration-300
                        ${isFocused ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <Sparkles className="w-5 h-5 text-accent animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
