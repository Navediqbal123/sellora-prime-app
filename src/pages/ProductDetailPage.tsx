import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Product, SellerProfile } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
  Heart, Share2, Home, ChevronLeft, ChevronRight, Expand, FileText,
} from 'lucide-react';
import ChatDrawer from '@/components/chat/ChatDrawer';
import ReviewSection from '@/components/product/ReviewSection';
import { useWishlist } from '@/hooks/useWishlist';
import shoppingArt from '@/assets/product-clay-shopping.png';
import '@/components/product/product-clay.css';

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
  const [imageOpen, setImageOpen] = useState(false);
  const { toggleWishlist, isWishlisted } = useWishlist();

  const handleWishlist = () => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please log in to save products', variant: 'destructive' });
      return;
    }
    if (product) void toggleWishlist(product.id);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: product?.title, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link copied' });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') toast({ title: 'Unable to share', variant: 'destructive' });
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        console.error('Product fetch error:', error, 'id:', id);
        toast({ title: 'Error', description: 'Product not found', variant: 'destructive' });
        navigate('/');
        return;
      }

      setProduct(data);

      if (data.seller_id) {
        const { data: sellerData } = await supabase
          .from('sellers')
          .select('*')
          .eq('id', data.seller_id)
          .maybeSingle();
        if (sellerData) setSeller(sellerData as SellerProfile);
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
      const address = [seller.address, seller.city, seller.state, seller.pincode]
        .filter(Boolean)
        .join(', ');

      const { data, error } = await supabase.from('orders').insert({
        product_id: product.id,
        buyer_id: user.id,
        seller_id: product.seller_id,
        status: 'pending',
        shop_address: address,
        shop_name: seller.shop_name,
      }).select('pickup_code').single();

      if (error) throw error;

      setPickupCode(data.pickup_code);
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
      <div className="product-clay">
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
    <div className="product-clay">
      <div className="product-clay__inner">
      <div className="product-clay__header">
        <Button variant="ghost" className="clay-button clay-icon-button" aria-label="Back" onClick={() => navigate(-1)}><ArrowLeft /></Button>
        <Button variant="ghost" className="clay-button product-clay__category" onClick={() => navigate(`/categories?cat=${encodeURIComponent(product.category)}`)}>
          <span className="product-clay__icon"><Home /></span><span>{product.category}</span><ChevronRight />
        </Button>
        <Button variant="ghost" className="clay-button clay-icon-button" aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={isWishlisted(product.id)} onClick={handleWishlist}><Heart className="clay-heart" /></Button>
        <Button variant="ghost" className="clay-button clay-icon-button" aria-label="Share product" onClick={handleShare}><Share2 /></Button>
      </div>
      <div className="product-clay__grid">
        <div className="product-clay__gallery">
          <div className="product-clay__image" aria-label="Product image gallery">
            {productImages.length ? <img src={productImages[imageIndex]} alt={product.title} /> : <div className="h-full flex items-center justify-center"><Package className="w-20 h-20 text-muted-foreground" /></div>}
            <span className="product-clay__tag"><Package />{product.title}</span>
            {productImages.length > 0 && <span className="product-clay__counter">{imageIndex + 1} / {productImages.length}</span>}
            {productImages.length > 1 && <>
              <Button variant="ghost" className="clay-button clay-icon-button clay-prev" aria-label="Previous image" onClick={() => setImageIndex(i => (i - 1 + productImages.length) % productImages.length)}><ChevronLeft /></Button>
              <Button variant="ghost" className="clay-button clay-icon-button clay-next" aria-label="Next image" onClick={() => setImageIndex(i => (i + 1) % productImages.length)}><ChevronRight /></Button>
            </>}
            {productImages.length > 0 && <Button variant="ghost" className="clay-button clay-icon-button clay-expand" aria-label="Expand product image" onClick={() => setImageOpen(true)}><Expand /></Button>}
          </div>
          {productImages.length > 1 && <div className="product-clay__thumbs" aria-label="Product thumbnails">
            {productImages.map((img, i) => <Button key={img + i} variant="ghost" className="clay-button clay-thumb" aria-label={`View product image ${i + 1}`} aria-pressed={i === imageIndex} onClick={() => setImageIndex(i)}><img src={img} alt={`${product.title}, image ${i + 1}`} /></Button>)}
          </div>}
        </div>
        <div className="product-clay__details">
          <div className="product-clay__summary">
            <h1>{product.title}</h1>
            <div className="product-clay__price-row"><p className="product-clay__price">₹{product.price.toLocaleString()}</p><div className="product-clay__quantity" aria-label="Reservation quantity: 1"><ShoppingBag /><span>Qty</span><strong>1</strong></div></div>
            <img className="product-clay__mascot" src={shoppingArt} alt="" width={512} height={512} />
          </div>
          <div className="product-clay__stats"><span><Eye />{product.views || 0} views</span><span><MousePointer />{product.clicks || 0} clicks</span></div>
          {product.description && <div className="product-clay__row"><span className="product-clay__icon"><FileText /></span><div><h3>Description</h3><p>{product.description}</p></div></div>}
          <div className="product-clay__row product-clay__row--location">
            <span className="product-clay__icon"><MapPin /></span><div><h3>Location</h3><p>{seller ? [seller.address, seller.city, seller.state, seller.pincode].filter(Boolean).join(', ') : [product.city, product.state].filter(Boolean).join(', ')}</p></div>
            <Button asChild variant="ghost" className="clay-button"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(seller ? [seller.address, seller.city, seller.state, seller.pincode].filter(Boolean).join(', ') : [product.city, product.state].filter(Boolean).join(', '))}`} target="_blank" rel="noopener noreferrer">View on Map<ChevronRight /></a></Button>
          </div>
          {seller && <div className="product-clay__row">
            <span className="product-clay__icon"><Store /></span><div><h3>{seller.shop_name}</h3><p>{seller.city}, {seller.state}</p>{seller.phone_number && <a className="product-clay__phone" href={`tel:${seller.phone_number}`}><Phone />{seller.phone_number}</a>}</div>
            <Button variant="ghost" className="clay-button" onClick={() => navigate(`/seller/${seller.id}`)}><Store />View Shop<ChevronRight /></Button>
          </div>}
          <div className="product-clay__actions">
            {seller && user && seller.user_id !== user.id && <Button variant="ghost" className="clay-button" onClick={() => setChatOpen(true)}><MessageCircle />Chat Now</Button>}
            <Button variant="ghost" className="clay-button" onClick={handleWishlist}><Heart className="clay-heart" />{isWishlisted(product.id) ? 'Wishlisted' : 'Add to Wishlist'}</Button>
            <Button className="clay-button clay-primary" onClick={() => setShowConfirm(true)}><Store />Reserve / Visit Shop</Button>
          </div>
        </div>
      </div>

      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="product-clay product-clay__dialog">
          <DialogHeader><DialogTitle>{product.title}</DialogTitle><DialogDescription>Image {imageIndex + 1} of {productImages.length}</DialogDescription></DialogHeader>
          <img className="product-clay__full-image" src={productImages[imageIndex]} alt={product.title} />
        </DialogContent>
      </Dialog>
      {/* Confirmation Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="product-clay product-clay__dialog">
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
                  <img src={productImages[0]} alt="" className="w-full h-full object-contain" />
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
        <DialogContent className="product-clay product-clay__dialog text-center">
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

      {/* Reviews Section */}
      <div className="product-clay__reviews"><ReviewSection productId={product.id} sellerId={product.seller_id} /></div>

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
    </div>
  );
};

export default ProductDetailPage;
