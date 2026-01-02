import React from 'react';

interface Category {
  id: string;
  label: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onChange: (id: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selected, onChange }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {categories.map((category, index) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={`relative px-5 py-2.5 rounded-full text-sm font-medium
                     transition-all duration-300 ease-out animate-fade-in-up
                     ${selected === category.id
                       ? 'bg-primary text-primary-foreground shadow-button scale-105'
                       : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground hover:scale-105'
                     }`}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {/* Glow for active */}
          {selected === category.id && (
            <div className="absolute inset-0 rounded-full bg-primary blur-md opacity-40 -z-10 animate-pulse" />
          )}
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
