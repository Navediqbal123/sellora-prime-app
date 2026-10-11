import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/home/BottomNav';
import { ShoppingBag, MapPin, Copy, Check, ArrowLeft, Search, SlidersHorizontal, Package, ChevronRight, Eye, ShoppingCart, Star, Hourglass, Truck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import deliveryArt from '@/assets/orders-delivery-scene.png';
import parcelArt from '@/assets/orders-pickup-parcel.png';
import { toast } from '@/hooks/use-toast';

interface OrderRow {
  id: string;
  product_id: string;
  seller_id: string;
  status: string;
  pickup_code?: string | null;
  shop_name?: string | null;
  shop_address?: string | null;
  created_at: string;
  order_number?: string;
  quantity?: number;
  category?: string;
  product?: { title: string; image_url?: string; price: number };
}

const filters = [
  { value: 'all', label: 'All', icon: ShoppingBag },
  { value: 'pending', label: 'Pending', icon: Hourglass },
  { value: 'delivered', label: 'Delivered', icon: Truck },
  { value: 'completed', label: 'Completed', icon: Check },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle },
];

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [oldestFirst, setOldestFirst] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();

    const channel = supabase
      .channel('buyer-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `buyer_id=eq.${user.id}` },
        () => fetchOrders(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const productIds = [...new Set((data || []).map((o: any) => o.product_id).filter(Boolean))];
      let productMap: Record<string, any> = {};
      if (productIds.length > 0) {
        const { data: prods } = await supabase
          .from('products')
          .select('id, title, image_url, price')
          .in('id', productIds);
        (prods || []).forEach((p: any) => {
          productMap[p.id] = { title: p.title, image_url: p.image_url, price: p.price };
        });
      }
      setOrders((data || []).map((o: any) => ({ ...o, product: productMap[o.product_id] })));
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to load orders');
      console.error('Orders fetch error', e);
      toast({ title: 'Error', description: e.message || 'Failed to load orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast({ title: 'Copied!', description: 'Pickup code copied' });
    setTimeout(() => setCopied(null), 1500);
  };

  const visibleOrders = orders.filter((order) =>
    (filter === 'all' || order.status === filter) &&
    `${order.product?.title || ''} ${order.order_number || order.id} ${order.shop_name || ''}`.toLowerCase().includes(search.toLowerCase())
  );
  if (oldestFirst) visibleOrders.reverse();

  return (
    <div className="orders-clay">
      <div className="orders-clay__content">
        <header className="orders-clay__header">
          <Button variant="ghost" className="orders-clay__tool" aria-label="Back" onClick={() => navigate('/')}><ArrowLeft /></Button>
          <span className="orders-clay__icon orders-clay__icon--purple"><ShoppingBag /></span>
          <div className="orders-clay__heading"><h1>My Orders</h1><p>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p></div>
          <Button variant="ghost" className="orders-clay__tool" aria-label="Search orders" aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}><Search /></Button>
          <Button variant="ghost" className="orders-clay__tool" aria-label={oldestFirst ? 'Sort newest first' : 'Sort oldest first'} title={oldestFirst ? 'Oldest first' : 'Newest first'} aria-pressed={oldestFirst} onClick={() => setOldestFirst(!oldestFirst)}><SlidersHorizontal /></Button>
        </header>
        {searchOpen && <input className="orders-clay__search" aria-label="Search your orders" placeholder="Search your orders" value={search} onChange={(event) => setSearch(event.target.value)} autoFocus />}
        <div className="orders-clay__filters" aria-label="Order status filters">
          {filters.map(({ value, label, icon: Icon }) => <Button key={value} variant="ghost" className={`orders-clay__filter orders-clay__filter--${value} ${filter === value ? 'is-active' : ''}`} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value !== 'all' && <Icon />}<span>{label} ({value === 'all' ? orders.length : orders.filter(o => o.status === value).length})</span></Button>)}
          {orders.some(o => o.status === 'ready') && <Button variant="ghost" className={`orders-clay__filter ${filter === 'ready' ? 'is-active' : ''}`} aria-pressed={filter === 'ready'} onClick={() => setFilter('ready')}><Truck />Ready ({orders.filter(o => o.status === 'ready').length})</Button>}
        </div>
        {loading ? <div className="orders-clay__list" aria-label="Loading orders">{[1, 2, 3].map(i => <div className="orders-clay__card orders-clay__skeleton animate-pulse" key={i} />)}</div>
          : errorMessage ? <section className="orders-clay__state" role="alert"><span className="orders-clay__icon"><XCircle /></span><h2>Unable to load orders</h2><p>{errorMessage}</p><Button className="orders-clay__action orders-clay__action--primary" onClick={fetchOrders}>Try again</Button></section>
          : visibleOrders.length === 0 ? <section className="orders-clay__state"><span className="orders-clay__icon orders-clay__icon--purple"><ShoppingBag /></span><h2>{orders.length === 0 ? 'No orders yet' : 'No matching orders'}</h2><p>{orders.length === 0 ? 'Reserve a product and your pickup code will appear here.' : 'There are no orders matching your selection.'}</p><Button className="orders-clay__action orders-clay__action--primary" onClick={() => orders.length === 0 ? navigate('/') : (setFilter('all'), setSearch(''))}>{orders.length === 0 ? 'Browse products' : 'Show all orders'}</Button></section>
          : <div className="orders-clay__list">{visibleOrders.map(o => {
            const StatusIcon = o.status === 'completed' || o.status === 'delivered' ? Check : o.status === 'cancelled' ? XCircle : o.status === 'ready' ? Truck : Hourglass;
            const openProduct = () => navigate(`/product/${o.product_id}`);
            return <article key={o.id} className="orders-clay__card">
              <div className="orders-clay__order-heading">
                <span className="orders-clay__icon orders-clay__icon--package"><img src={parcelArt} alt="" width={816} height={816} /></span>
                <div className="orders-clay__order-id"><h2 title={o.order_number || o.id}>Order #{o.order_number || o.id}</h2><time dateTime={o.created_at}>{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</time></div>
                <span className={`orders-clay__status orders-clay__status--${o.status}`}><StatusIcon />{o.status}</span>
              </div>
              <div className="orders-clay__product">
                <Button variant="ghost" className="orders-clay__photo" aria-label={`View ${o.product?.title || 'product'}`} onClick={openProduct}>{o.product?.image_url ? <img src={o.product.image_url} alt={o.product.title} /> : <Package />}</Button>
                <div className="orders-clay__product-info"><h3>{o.product?.title || 'Product'}</h3>{o.category && <p>{o.category}</p>}<div className="orders-clay__price-row">{o.product?.price !== undefined && <strong>₹{o.product.price.toLocaleString('en-IN')}</strong>}{o.quantity != null && <span className="orders-clay__quantity">Qty: {o.quantity}</span>}</div>{o.shop_name && <p className="orders-clay__location"><MapPin />{o.shop_name}</p>}{o.shop_address && <p className="orders-clay__address">{o.shop_address}</p>}</div>
                <Button variant="ghost" className="orders-clay__tool orders-clay__details" aria-label="View order details" onClick={openProduct}><ChevronRight /></Button>
              </div>
              {o.pickup_code && o.status !== 'completed' && o.status !== 'cancelled' && <div className="orders-clay__pickup">
                <span className="orders-clay__pickup-art" aria-hidden="true"><img src={parcelArt} alt="" width={816} height={816} /></span>
                <div className="orders-clay__pickup-info"><h3>Pickup code</h3><div className="orders-clay__digits" aria-label={`Pickup code ${o.pickup_code}`}>{Array.from(o.pickup_code).map((digit, index) => <span key={index}>{digit}</span>)}</div><p>Show this code at the store during pickup</p></div>
                <Button variant="ghost" className="orders-clay__tool" aria-label="Copy pickup code" onClick={() => { if (o.pickup_code) copyCode(o.pickup_code); }}>{copied === o.pickup_code ? <Check /> : <Copy />}</Button>
              </div>}
              <div className="orders-clay__actions">{o.status === 'completed' && <Button variant="ghost" className="orders-clay__action" onClick={openProduct}><ShoppingCart />Buy Again</Button>}<Button variant="ghost" className="orders-clay__action" onClick={openProduct}><Eye />View Details</Button>{o.status === 'completed' && <Button variant="ghost" className="orders-clay__action orders-clay__action--primary" onClick={openProduct}><Star />Write Review</Button>}</div>
            </article>;
          })}</div>}
        <div className="orders-clay__decoration" aria-hidden="true"><img src={deliveryArt} alt="" width={1152} height={576} loading="lazy" /></div>
      </div>
      <BottomNav variant="clay" />
    </div>
  );
};

export default OrdersPage;
