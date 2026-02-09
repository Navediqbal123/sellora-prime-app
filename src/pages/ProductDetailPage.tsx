import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Product, SellerProfile } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  MapPin,
  Eye,
  MousePointer,
  Store,
  Phone,
  MessageCircle,
  ShoppingBag,
  CheckCircle2,
  Copy,
  Package,
  Loader2,
} from 'lucide-react';
import ChatDrawer from '@/components/chat/ChatDrawer';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [pickupCode, setPickupCode] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopName, setShopName] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('products')
        .select('*, seller:sellers(*)')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        toast({ title: 'Error', description: 'Product not found', variant: 'destructive' });
        navigate('/');
        return;
      }

      setProduct(data);

      if (data.seller) {
        setSeller(data.seller as SellerProfile);
      }

      // Increment views (fire-and-forget)
      try { await supabase.rpc('increment_product_views', { product_id: id }); } catch {}
      try { await supabase.from('click_logs').insert({ product_id: id }); } catch {}

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleReserve = async () => {
    if (!product || !user || !seller) return;

    setOrdering(true);
    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const address = [seller.address, seller.city, seller.state, seller.pincode]
        .filter(Boolean)
        .join(', ');

      const { error } = await supabase.from('orders').insert({
        product_id: product.id,
        buyer_id: user.id,
        seller_id: product.seller_id,
        pickup_code: code,
        status: 'pending',
        shop_address: address,
        shop_name: seller.shop_name,
      });

      if (error) throw error;

      setPickupCode(code);
      setShopAddress(address);
      setShopName(seller.shop_name);
      setShowConfirm(false);
      setShowSuccess(true);

      toast({ title: 'Order Placed!', description: 'Your reservation has been confirmed' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to place order', variant: 'destructive' });
    } finally {
      setOrdering(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(pickupCode);
    toast({ title: 'Copied!', description: 'Pickup code copied to clipboard' });
  };

  const productImages = product?.images?.length
    ? product.images
    : product?.image_url
      ? [product.image_url]
      : [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="h-[450px] rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 group hover:bg-white/5"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left — Images */}
        <div className="space-y-4">
          <div className="relative h-[450px] rounded-2xl overflow-hidden bg-secondary/30 border border-border/50">
            {productImages.length > 0 ? (
              <img
                src={productImages[imageIndex]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-20 h-20 text-muted-foreground/30" />
              </div>
            )}
            <Badge className="absolute top-4 left-4 bg-primary/90">{product.category}</Badge>
          </div>

          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300
                    ${i === imageIndex ? 'border-primary ring-2 ring-primary/30' : 'border-border/50 hover:border-primary/50'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>
            <p className="text-4xl font-bold text-gradient-gold mt-3">
              ₹{product.price.toLocaleString()}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-accent" /> {product.views || 0} views
            </span>
            <span className="flex items-center gap-1.5">
              <MousePointer className="w-4 h-4 text-sellora-gold" /> {product.clicks || 0} clicks
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="card-premium p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{product.city}, {product.state}</span>
          </div>

          {/* Seller Info */}
          {seller && (
            <div className="card-premium p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{seller.shop_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {seller.city}, {seller.state}
                  </p>
                </div>
              </div>
              {seller.phone_number && (
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{seller.phone_number}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              className="w-full h-14 btn-glow group text-lg"
              onClick={() => setShowConfirm(true)}
            >
              <ShoppingBag className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Reserve / Visit Shop
            </Button>

            {seller && user && seller.user_id !== user.id && (
              <Button
                variant="outline"
                className="w-full h-14 border-primary/30 hover:bg-primary/10 group text-lg"
                onClick={() => setChatOpen(true)}
              >
                <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Chat with Seller
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-card border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Reservation</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You're reserving this product for in-store pickup. No shipping required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {productImages[0] ? (
                  <img src={productImages[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{product.title}</p>
                <p className="text-lg font-bold text-gradient-gold">₹{product.price.toLocaleString()}</p>
              </div>
            </div>
            {seller && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Store className="w-4 h-4 text-primary" />
                <span>Pickup at: <strong className="text-foreground">{seller.shop_name}</strong></span>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowConfirm(false)} disabled={ordering}>
              Cancel
            </Button>
            <Button className="btn-glow" onClick={handleReserve} disabled={ordering}>
              {ordering ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing Order...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Reservation</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-card border-border/50 max-w-md text-center">
          <div className="py-6 space-y-6">
            <div className="w-20 h-20 rounded-full bg-sellora-success/20 flex items-center justify-center mx-auto animate-scale-in">
              <CheckCircle2 className="w-10 h-10 text-sellora-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Order Placed!</h2>
              <p className="text-muted-foreground mt-2">
                Show this code at the shop to pick up your item
              </p>
            </div>

            {/* Pickup Code */}
            <div className="relative">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                  Your Pickup Code
                </p>
                <p className="text-5xl font-mono font-bold text-gradient tracking-[0.3em]">
                  {pickupCode}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                onClick={copyCode}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {/* Shop Info */}
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">{shopName}</span>
              </div>
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {shopAddress}
              </p>
            </div>

            <Button
              className="w-full btn-glow"
              onClick={() => {
                setShowSuccess(false);
                navigate('/');
              }}
            >
              Back to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Drawer */}
      {seller && (
        <ChatDrawer
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          productId={product.id}
          productTitle={product.title}
          sellerId={seller.user_id}
          sellerName={seller.shop_name}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
