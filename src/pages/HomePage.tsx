import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Product } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/home/ProductCard';
import SearchBar from '@/components/home/SearchBar';
import CategoryFilter from '@/components/home/CategoryFilter';
import EmptyState from '@/components/home/EmptyState';
import SkeletonGrid from '@/components/home/SkeletonGrid';


const HomePage = () => {
  const { role } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'Electronics', label: 'Electronics' },
    { id: 'Fashion', label: 'Fashion' },
    { id: 'Home & Living', label: 'Home & Living' },
    { id: 'Vehicles', label: 'Vehicles' },
    { id: 'Services', label: 'Services' },
  ];

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(debounce);
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`*, seller:sellers(shop_name, city, state)`)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        
        // Log search
        await supabase.from('search_logs').insert({
          query: searchQuery.trim()
        });
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (productId: string) => {
    // Log click
    await supabase.from('click_logs').insert({
      product_id: productId
    });

    // Increment views
    await supabase.rpc('increment_product_views', { product_id: productId });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Discover Amazing{' '}
          <span className="text-gradient relative">
            Products
            <div className="absolute -inset-1 bg-primary/20 blur-2xl -z-10 rounded-full" />
          </span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Find the best deals from trusted sellers in your area
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-1">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Categories */}
      <div className="mb-10 animate-fade-in-up stagger-2">
        <CategoryFilter 
          categories={categories} 
          selected={selectedCategory} 
          onChange={setSelectedCategory} 
        />
      </div>

      {/* Start Selling Button - Only for normal users */}
      {role === 'user' && (
        <div className="flex justify-center mb-14 animate-fade-in-up stagger-3">
          <Link to="/become-seller">
            <Button className="btn-glow px-10 py-7 text-lg font-semibold group relative overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary 
                             bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]" />
              <div className="relative flex items-center">
                <Sparkles className="w-6 h-6 mr-3 animate-pulse" />
                Start Selling on Sellora
                <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </Button>
          </Link>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <SkeletonGrid count={8} />
        ) : products.length > 0 ? (
          products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product.id)}
              delay={index * 0.05}
            />
          ))
        ) : (
          <EmptyState searchQuery={searchQuery} showSellerButton={role === 'user'} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
