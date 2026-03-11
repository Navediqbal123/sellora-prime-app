import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, SellerProfile, Product } from '@/lib/supabase';
import { MapPin, Phone, Mail, Store, Star, Package, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/home/ProductCard';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const SellerProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<{ rating: number; comment: string; reviewer_name: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetchSellerData();
  }, [id]);

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      // Fetch seller info
      const { data: sellerData } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (sellerData) setSeller(sellerData);

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', id)
        .order('created_at', { ascending: false });

      setProducts(productsData || []);

      // Fetch reviews for seller's products
      const productIds = (productsData || []).map((p: any) => p.id);
      if (productIds.length > 0) {
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .in('product_id', productIds)
          .order('created_at', { ascending: false })
          .limit(10);

        const revs = reviewsData || [];
        setReviews(revs);
        if (revs.length > 0) {
          setAvgRating(revs.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / revs.length);
        }
      }
    } catch (err) {
      console.error('Error fetching seller:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Seller not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary text-sm">← Go Back</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Seller Card */}
      <div className="glass-card rounded-2xl p-5 border border-border/50">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <Store className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{seller.shop_name}</h1>
            <p className="text-sm text-muted-foreground">{seller.owner_name}</p>
            
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {avgRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-sellora-warning fill-sellora-warning" />
                  <span className="text-sm font-semibold text-foreground">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({reviews.length})</span>
                </div>
              )}
              <Badge variant="secondary" className="text-[10px]">
                <Package className="w-3 h-3 mr-1" />{products.length} Products
              </Badge>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{seller.city}, {seller.state} - {seller.pincode}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span>{seller.phone_number}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-3.5 h-3.5" />
            <span>{seller.email}</span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Recent Reviews</h2>
          <div className="space-y-2">
            {reviews.slice(0, 5).map((rev, i) => (
              <div key={i} className="glass-card rounded-xl p-3 border border-border/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`w-3 h-3 ${s < rev.rating ? 'text-sellora-warning fill-sellora-warning' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{rev.reviewer_name || 'User'}</span>
                </div>
                <p className="text-xs text-muted-foreground">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Products ({products.length})</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => navigate(`/product/${product.id}`)}
                isWishlisted={isWishlisted(product.id)}
                onToggleWishlist={() => {
                  if (!user) {
                    toast({ title: 'Login Required', description: 'Please log in', variant: 'destructive' });
                    navigate('/login');
                    return;
                  }
                  toggleWishlist(product.id);
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No products yet.</p>
        )}
      </div>
    </div>
  );
};

export default SellerProfilePage;
