import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Product } from '@/lib/supabase';
import ProductCard from '@/components/home/ProductCard';
import SearchBar from '@/components/home/SearchBar';
import SearchFilters from '@/components/home/SearchFilters';
import FlashDeals from '@/components/home/FlashDeals';
import EmptyState from '@/components/home/EmptyState';
import SkeletonGrid from '@/components/home/SkeletonGrid';
import ChatDrawer from '@/components/chat/ChatDrawer';
import { toast } from '@/hooks/use-toast';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useWishlist } from '@/hooks/useWishlist';

const ScrollAnimatedGrid = ({ loading, products, userCity, onProductClick, onChat, searchQuery, isWishlisted, onToggleWishlist }: any) => {
  const { ref, isVisible } = useScrollAnimation(0.05);

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {loading ? (
        <SkeletonGrid count={8} />
      ) : products.length > 0 ? (
        products.map((product: any, index: number) => (
          <div
            key={product.id}
            className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${index * 0.06}s` }}
          >
            <ProductCard
              product={product}
              onClick={() => onProductClick(product.id)}
              delay={0}
              isNearby={!!userCity && product.city?.toLowerCase() === userCity.toLowerCase()}
              onChat={() => onChat(product)}
              isWishlisted={isWishlisted?.(product.id)}
              onToggleWishlist={() => onToggleWishlist?.(product.id)}
            />
          </div>
        ))
      ) : (
        <EmptyState searchQuery={searchQuery} />
      )}
    </div>
  );
};

const HomePage = () => {
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userCity, setUserCity] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProduct, setChatProduct] = useState<{ id: string; title: string; sellerId: string; sellerName: string } | null>(null);

  // Filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [locationFilter, setLocationFilter] = useState('');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'Electronics', label: 'Electronics' },
    { id: 'Fashion', label: 'Fashion' },
    { id: 'Home & Living', label: 'Home & Living' },
    { id: 'Vehicles', label: 'Vehicles' },
    { id: 'Services', label: 'Services' },
  ];

  useEffect(() => {
    const fetchUserCity = async () => {
      if (!user) { setUserCity(null); return; }
      const { data: seller } = await supabase.from('sellers').select('city').eq('user_id', user.id).maybeSingle();
      if (seller?.city) setUserCity(seller.city);
    };
    fetchUserCity();
  }, [user]);

  useEffect(() => {
    const debounce = setTimeout(() => { fetchProducts(); }, 300);
    return () => clearTimeout(debounce);
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (selectedCategory !== 'all') query = query.eq('category', selectedCategory);
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        await supabase.from('search_logs').insert({ query: searchQuery.trim() });
      }

      const { data, error } = await query;
      if (error) throw error;

      const sellerIds = [...new Set((data || []).map((p: any) => p.seller_id).filter(Boolean))];
      let sellerMap: Record<string, { shop_name: string; city: string; state: string }> = {};
      if (sellerIds.length > 0) {
        const { data: sellers } = await supabase.from('sellers').select('id, shop_name, city, state').in('id', sellerIds);
        (sellers || []).forEach((s: any) => { sellerMap[s.id] = { shop_name: s.shop_name, city: s.city, state: s.state }; });
      }

      const productsWithSeller = (data || []).map((p: any) => ({
        ...p,
        seller: sellerMap[p.seller_id] || null,
        city: sellerMap[p.seller_id]?.city || p.city,
      }));
      setProducts(productsWithSeller);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side filters (price + location)
  const filteredProducts = useMemo(() => {
    let result = products;
    // Price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    // Location filter
    if (locationFilter.trim()) {
      const loc = locationFilter.toLowerCase();
      result = result.filter(p => p.city?.toLowerCase().includes(loc) || p.state?.toLowerCase().includes(loc));
    }
    return result;
  }, [products, priceRange, locationFilter]);

  // Sort: user's city first
  const sortedProducts = useMemo(() => {
    if (!userCity || filteredProducts.length === 0) return filteredProducts;
    const cityLower = userCity.toLowerCase();
    const nearby = filteredProducts.filter(p => p.city?.toLowerCase() === cityLower);
    const others = filteredProducts.filter(p => p.city?.toLowerCase() !== cityLower);
    return [...nearby, ...others];
  }, [filteredProducts, userCity]);

  const handleProductClick = async (productId: string) => {
    await supabase.from('click_logs').insert({ product_id: productId });
    await supabase.rpc('increment_product_views', { product_id: productId });
    navigate(`/product/${productId}`);
  };

  const handleChat = (product: any) => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please log in to chat with sellers', variant: 'destructive' });
      navigate('/login');
      return;
    }
    if (!product.seller_id) return;
    setChatProduct({
      id: product.id,
      title: product.title,
      sellerId: product.seller?.user_id || product.seller_id,
      sellerName: product.seller?.shop_name || 'Seller',
    });
    setChatOpen(true);
  };

  const clearAllFilters = () => {
    setPriceRange([0, 100000]);
    setLocationFilter('');
    setSelectedCategory('all');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="text-3xl md:text-6xl font-bold mb-4 leading-tight">
          Explore Premium{' '}
          <span className="text-gradient relative animate-float">
            Deals
            <div className="absolute -inset-1 bg-primary/20 blur-2xl -z-10 rounded-full" />
          </span>{' '}
          Near You
        </h1>
        <p className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
          Discover the best products from trusted sellers in your city
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-6 animate-fade-in-up stagger-1">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Filters */}
      <div className="max-w-2xl mx-auto mb-8 flex justify-center animate-fade-in-up stagger-2">
        <SearchFilters
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          location={locationFilter}
          onLocationChange={setLocationFilter}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          onClearAll={clearAllFilters}
        />
      </div>

      {/* Flash Deals */}
      {!loading && products.length > 0 && (
        <FlashDeals products={products} onProductClick={handleProductClick} />
      )}

      {/* Products Grid */}
      <ScrollAnimatedGrid
        loading={loading}
        products={sortedProducts}
        userCity={userCity}
        onProductClick={handleProductClick}
        onChat={handleChat}
        searchQuery={searchQuery}
        isWishlisted={isWishlisted}
        onToggleWishlist={(id: string) => {
          if (!user) {
            toast({ title: 'Login Required', description: 'Please log in to save wishlist items', variant: 'destructive' });
            navigate('/login');
            return;
          }
          toggleWishlist(id);
        }}
      />

      {/* Chat Drawer */}
      {chatProduct && (
        <ChatDrawer
          isOpen={chatOpen}
          onClose={() => { setChatOpen(false); setChatProduct(null); }}
          productId={chatProduct.id}
          productTitle={chatProduct.title}
          sellerId={chatProduct.sellerId}
          sellerName={chatProduct.sellerName}
        />
      )}
    </div>
  );
};

export default HomePage;
