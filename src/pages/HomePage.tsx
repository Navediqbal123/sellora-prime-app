import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Product } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  MapPin, 
  Filter, 
  Sparkles, 
  Eye,
  ChevronRight,
  ShoppingBag,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { role } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'home', label: 'Home & Living' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'services', label: 'Services' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:sellers(shop_name, city, state)
        `)
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
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing <span className="text-gradient">Products</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find the best deals from trusted sellers in your area
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 animate-fade-in-up stagger-1">
          <div 
            className={`relative transition-all duration-300 ${
              isSearchFocused ? 'transform scale-105' : ''
            }`}
          >
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
              isSearchFocused ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-input border border-border rounded-xl pl-12 pr-4 py-4 text-foreground 
                         focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
                         transition-all duration-300"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in-up stagger-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-button'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Start Selling Button - Only for normal users */}
        {role === 'user' && (
          <div className="flex justify-center mb-12 animate-fade-in-up stagger-3">
            <Link to="/become-seller">
              <Button className="btn-glow px-8 py-6 text-lg font-semibold group">
                <Sparkles className="w-5 h-5 mr-2 animate-bounce-subtle" />
                Start Selling on Sellora
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Skeleton Loaders
            [...Array(8)].map((_, i) => (
              <div key={i} className="card-premium p-4 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="skeleton h-48 rounded-lg mb-4" />
                <div className="skeleton h-4 rounded w-3/4 mb-2" />
                <div className="skeleton h-4 rounded w-1/2 mb-4" />
                <div className="skeleton h-6 rounded w-1/4" />
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product, index) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="card-premium overflow-hidden cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Product Image */}
                <div className="relative h-48 bg-secondary overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Eye className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{product.views || 0}</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{product.city}, {product.state}</span>
                  </div>
                  <p className="text-xl font-bold text-gradient-gold mt-3">
                    ₹{product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="col-span-full text-center py-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-4">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search or filters' 
                  : 'Be the first to list a product!'
                }
              </p>
              {role === 'user' && (
                <Link to="/become-seller" className="inline-block mt-4">
                  <Button className="btn-glow">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Selling
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
