import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Product } from '@/lib/supabase';
import HomeSearchBar from '@/components/home/HomeSearchBar';
import HeroCarousel from '@/components/home/HeroCarousel';
import CategoryIconsRow from '@/components/home/CategoryIconsRow';
import DiscountProductCard from '@/components/home/DiscountProductCard';
import FlashDeals from '@/components/home/FlashDeals';
import BottomNav from '@/components/home/BottomNav';
import EmptyState from '@/components/home/EmptyState';
import SkeletonGrid from '@/components/home/SkeletonGrid';
import ChatDrawer from '@/components/chat/ChatDrawer';
import { toast } from '@/hooks/use-toast';
import { useWishlist } from '@/hooks/useWishlist';
import { Bell } from 'lucide-react';

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

  // Sort: user's city first
  const sortedProducts = useMemo(() => {
    if (!userCity || products.length === 0) return products;
    const cityLower = userCity.toLowerCase();
    const nearby = products.filter(p => p.city?.toLowerCase() === cityLower);
    const others = products.filter(p => p.city?.toLowerCase() !== cityLower);
    return [...nearby, ...others];
  }, [products, userCity]);

  const handleProductClick = async (productId: string) => {
    await supabase.from('click_logs').insert({ product_id: productId });
    await supabase.rpc('increment_product_views', { product_id: productId });
    navigate(`/product/${productId}`);
  };

  const handleToggleWishlist = (id: string) => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please log in to save wishlist items', variant: 'destructive' });
      navigate('/login');
      return;
    }
    toggleWishlist(id);
  };

  return (
    <div className="bg-background min-h-screen pb-24 md:pb-8">
      <div className="container mx-auto px-3 pt-0 pb-4 max-w-6xl">
        {/* Search + Notifications */}
        <div className="mb-2.5 pt-2 flex items-center gap-2 animate-fade-in-up">
          <div className="flex-1 min-w-0">
            <HomeSearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <button
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-card to-secondary/60 border border-border/60 flex items-center justify-center
                       hover:border-primary/50 hover:shadow-[0_6px_18px_-6px_hsl(var(--primary)/0.6)] hover:scale-105 transition-all duration-300 shrink-0"
          >
            <Bell className="w-[18px] h-[18px] text-foreground" strokeWidth={2.25} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive shadow-[0_0_8px_hsl(var(--destructive))] animate-pulse" />
          </button>
        </div>

        {/* Hero carousel */}
        <div className="mb-3 animate-fade-in-up stagger-2">
          <HeroCarousel onShop={() => setSelectedCategory('all')} />
        </div>

        {/* Categories */}
        <div className="mb-3 animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-sm font-bold text-foreground">Categories</h2>
            <button className="text-[11px] text-primary font-medium hover:underline">See all</button>
          </div>
          <CategoryIconsRow selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Flash deals */}
        {!loading && products.length > 0 && (
          <FlashDeals products={products} onProductClick={handleProductClick} />
        )}

        {/* Product grid */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            {selectedCategory === 'all' ? 'Recommended for you' : selectedCategory}
          </h2>
          <span className="text-[11px] text-muted-foreground">{sortedProducts.length} items</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {loading ? (
            <SkeletonGrid count={8} />
          ) : sortedProducts.length > 0 ? (
            sortedProducts.map((product, i) => (
              <DiscountProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product.id)}
                isWishlisted={isWishlisted?.(product.id)}
                onToggleWishlist={() => handleToggleWishlist(product.id)}
                delay={Math.min(i * 0.04, 0.4)}
              />
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState searchQuery={searchQuery} />
            </div>
          )}
        </div>
      </div>

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

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  );
};

export default HomePage;
