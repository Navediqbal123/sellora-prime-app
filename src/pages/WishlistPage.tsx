import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Product } from '@/lib/supabase';
import { useWishlist } from '@/hooks/useWishlist';
import DiscountProductCard from '@/components/home/DiscountProductCard';
import SkeletonGrid from '@/components/home/SkeletonGrid';
import BottomNav from '@/components/home/BottomNav';
import { Heart, ArrowLeft } from 'lucide-react';

const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const { data: wl } = await supabase
          .from('wishlists')
          .select('product_id')
          .eq('user_id', user.id);
        const ids = (wl || []).map((w: any) => w.product_id);
        if (ids.length === 0) {
          setProducts([]);
          return;
        }
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .in('id', ids);
        setProducts(prods || []);
      } catch (e) {
        console.error('Wishlist fetch error', e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user, navigate]);

  const handleToggle = async (id: string) => {
    await toggleWishlist(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="bg-background min-h-screen pb-24 md:pb-8">
      <div className="container mx-auto px-4 pt-5 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary fill-primary/30" /> Wishlist
            </h1>
            <p className="text-xs text-muted-foreground">{products.length} saved items</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <SkeletonGrid count={6} />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">No items in wishlist</h2>
            <p className="text-sm text-muted-foreground mb-6">Tap the heart on any product to save it here.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
            >
              Browse products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((p, i) => (
              <DiscountProductCard
                key={p.id}
                product={p}
                onClick={() => navigate(`/product/${p.id}`)}
                isWishlisted={isWishlisted?.(p.id)}
                onToggleWishlist={() => handleToggle(p.id)}
                delay={Math.min(i * 0.04, 0.4)}
              />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default WishlistPage;