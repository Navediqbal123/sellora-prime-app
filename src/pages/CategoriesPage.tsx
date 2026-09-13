import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Smartphone, Shirt, Home as HomeIcon, Leaf, Dumbbell, Gamepad2, Car,
  BookOpen, ShoppingBasket, ShoppingBag, Search, Bell, ArrowRight,
  Heart, ShoppingCart, Star, Crown, Truck, ShieldCheck, PackageCheck,
} from 'lucide-react';
import { supabase, Product } from '@/lib/supabase';
import BottomNav from '@/components/home/BottomNav';
import NotificationBell from '@/components/NotificationBell';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/categories-tech-hero.jpg';

const categories = [
  { id: 'Electronics', label: 'Electronics', icon: Smartphone },
  { id: 'Fashion', label: 'Fashion', icon: Shirt },
  { id: 'Home & Living', label: 'Home & Living', icon: HomeIcon },
  { id: 'Beauty & Health', label: 'Beauty & Health', icon: Leaf },
  { id: 'Sports & Outdoors', label: 'Sports & Outdoors', icon: Dumbbell },
  { id: 'Toys & Games', label: 'Toys & Games', icon: Gamepad2 },
  { id: 'Groceries', label: 'Groceries', icon: ShoppingBasket },
  { id: 'Automotive', label: 'Automotive', icon: Car },
  { id: 'Books', label: 'Books & Stationery', icon: BookOpen },
];

const CategoriesPage: React.FC = () => {
  return <CategoriesPageInner />;
};

const EmptyBlock: React.FC<{ icon: React.ComponentType<{ className?: string }> }> = ({ icon: Icon }) => (
  <div className="flex flex-col items-center justify-center rounded-[22px] border border-border bg-card py-12 gap-3">
    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
      <Icon className="w-7 h-7 text-primary" />
    </div>
    <p className="text-sm font-medium text-muted-foreground">No products available yet</p>
  </div>
);

const ProductCard: React.FC<{
  product: Product;
  badge?: string;
  onOpen: () => void;
}> = ({ product, badge, onOpen }) => (
  <article className="group relative min-w-0 overflow-hidden rounded-[18px] border border-border bg-card shadow-category-card transition-all duration-300 hover:-translate-y-1 hover:shadow-category-card-hover">
    <div className="relative aspect-[1.05/1] overflow-hidden bg-secondary">
      <button type="button" className="h-full w-full" onClick={onOpen} aria-label={`View ${product.title}`}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} loading="lazy" className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center"><ShoppingBag className="h-9 w-9 text-muted-foreground/50" /></div>
        )}
      </button>
      {badge && <span className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-1 text-[10px] font-bold text-destructive-foreground">{badge}</span>}
      <Button type="button" variant="outline" size="icon" aria-label={`Save ${product.title}`} className="absolute right-2 top-2 h-8 w-8 rounded-full border-border bg-card shadow-sm">
        <Heart className="h-4 w-4 text-foreground" />
      </Button>
    </div>
    <div className="p-3">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <h4 className="truncate text-[13px] font-bold text-foreground sm:text-sm">{product.title}</h4>
        <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-xs">{product.category}</p>
        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-foreground">
          <Star className="h-3.5 w-3.5 fill-sellora-warning text-sellora-warning" />
          4.6 <span className="font-normal text-muted-foreground">({Math.max(product.views || 0, 1)})</span>
        </div>
      </button>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-extrabold text-foreground sm:text-base">₹{Number(product.price).toLocaleString('en-IN')}</span>
        <Button type="button" size="icon" onClick={onOpen} aria-label={`Open ${product.title}`} className="h-8 w-8 shrink-0 rounded-xl shadow-category-button">
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </article>
);

const CategoriesPageInner: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initial = params.get('cat') || categories[0].id;
  const [selected, setSelected] = useState(initial);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setParams({ cat: selected }, { replace: true });
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', selected)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProducts(data || []);
      } catch (e) {
        console.error(e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => `${product.title} ${product.description || ''}`.toLowerCase().includes(query));
  }, [products, search]);
  const featured = useMemo(() => visibleProducts.slice(0, 3), [visibleProducts]);
  const bestSellers = useMemo(() => {
    return [...visibleProducts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  }, [visibleProducts]);

  const activeCat = categories.find((c) => c.id === selected) || categories[0];

  return (
    <div className="categories-light min-h-screen bg-background pb-28 text-foreground md:pb-10">
      <div className="mx-auto w-full max-w-[1180px] px-3 pt-3 sm:px-5 lg:px-8">
        <header className="mb-5 flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-5">
          <div className="flex min-w-fit items-center gap-2">
            <SidebarTrigger className="h-10 w-10 rounded-full text-foreground" />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-category-button">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden xs:block">
              <p className="text-[24px] font-extrabold leading-none text-foreground">Sell<span className="text-primary">ora</span></p>
              <p className="mt-1 text-[10px] font-medium text-muted-foreground">Shop More, Live Better</p>
            </div>
          </div>
          <label className="order-3 flex h-12 w-full items-center gap-3 rounded-full bg-secondary px-4 transition-shadow focus-within:ring-2 focus-within:ring-primary/20 sm:order-none sm:flex-1">
            <Search className="h-5 w-5 shrink-0 text-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder="Search products, brands..." />
          </label>
          <div className="ml-auto flex items-center gap-1 sm:ml-0">
            <Button variant="ghost" size="icon" onClick={() => navigate('/orders')} aria-label="Orders" className="h-11 w-11 rounded-full"><ShoppingCart className="h-6 w-6" /></Button>
            <NotificationBell />
          </div>
        </header>

        <div className="flex items-start gap-3 sm:gap-5">
          <aside className="w-[72px] shrink-0 sm:w-[86px]">
            <div className="sticky top-3 max-h-[calc(100vh-112px)] space-y-1 overflow-y-auto scroll-smooth pb-20 scrollbar-hide">
              {categories.map((c) => {
                const Icon = c.icon;
                const active = c.id === selected;
                return (
                  <Button
                    type="button"
                    variant="ghost"
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={`relative h-auto w-full flex-col gap-1.5 whitespace-normal rounded-[18px] px-1 py-3 transition-all duration-300 ${active ? 'bg-accent text-primary' : 'text-foreground hover:bg-secondary'}`}
                  >
                    {active && <span className="absolute -left-3 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary" />}
                    <Icon className="h-6 w-6" strokeWidth={2} />
                    <span className="text-center text-[10px] font-semibold leading-[1.15] sm:text-[11px]">{c.label}</span>
                  </Button>
                );
              })}
            </div>
          </aside>
          <main className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div><h1 className="text-[32px] font-extrabold leading-tight text-foreground">Categories</h1><p className="text-sm text-muted-foreground sm:text-base">Explore by category and find what you love</p></div>
              <Button variant="outline" className="hidden rounded-full border-border bg-card px-5 shadow-sm sm:flex">All Categories <ArrowRight className="h-4 w-4" /></Button>
            </div>

            <section className="relative mb-5 min-h-[205px] overflow-hidden rounded-[24px] bg-accent shadow-category-hero sm:min-h-[270px]">
              <img src={heroImage} alt="Premium electronics on a lavender display" width={1400} height={800} className="absolute inset-0 h-full w-full object-cover object-center" />
              <div className="absolute inset-0 bg-category-hero-overlay" />
              <div className="relative z-10 flex min-h-[205px] max-w-[56%] flex-col items-start justify-center p-5 sm:min-h-[270px] sm:p-8">
                <h2 className="text-[25px] font-extrabold leading-[1.04] text-foreground sm:text-[38px]">Upgrade<br />Your <span className="text-primary">Tech Life</span></h2>
                <p className="mt-3 hidden max-w-[270px] text-sm leading-relaxed text-muted-foreground sm:block">Latest gadgets. Better living.<br />Only on Sellora.</p>
                <Button onClick={() => setSelected('Electronics')} className="mt-4 h-10 rounded-xl px-4 shadow-category-button sm:h-11 sm:px-5">Shop Electronics <ArrowRight className="h-4 w-4" /></Button>
              </div>
              <span className="absolute bottom-4 right-4 text-xs font-semibold text-primary-foreground">1/3</span>
            </section>

            <section className="mb-5">
              <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-extrabold text-foreground sm:text-2xl">Shop by Category</h2><Button variant="ghost" className="h-9 px-2 text-xs text-muted-foreground">See All <ArrowRight className="h-4 w-4" /></Button></div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:gap-5">
                {categories.slice(0, 5).map((category) => { const Icon = category.icon; const active = category.id === selected; return (
                  <Button key={category.id} type="button" variant="ghost" onClick={() => setSelected(category.id)} className="h-auto min-w-[72px] flex-col gap-2 p-0 hover:bg-transparent sm:min-w-[84px]">
                    <span className={`flex h-14 w-14 items-center justify-center rounded-full border transition-all sm:h-16 sm:w-16 ${active ? 'border-primary bg-card text-primary shadow-category-ring' : 'border-border bg-card text-foreground shadow-sm'}`}><Icon className="h-6 w-6" /></span>
                    <span className={`max-w-[78px] whitespace-normal text-center text-[10px] font-semibold leading-tight sm:text-xs ${active ? 'text-primary' : 'text-muted-foreground'}`}>{category.label}</span>
                  </Button>
                ); })}
              </div>
            </section>

            <section className="mb-5 rounded-[24px] bg-accent p-3 sm:p-4">
              <div className="mb-3 flex items-end justify-between gap-2"><div><h2 className="flex items-center gap-2 text-xl font-extrabold text-foreground sm:text-2xl">Today's Deals <span aria-hidden="true">🔥</span></h2><p className="text-xs text-muted-foreground sm:text-sm">Limited time offers. Don't miss out!</p></div><Button variant="outline" className="h-9 rounded-full border-border bg-card px-3 text-xs text-primary shadow-sm">View All <ArrowRight className="h-4 w-4" /></Button></div>
              {loading ? <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="aspect-[.75] animate-pulse rounded-[18px] bg-card" />)}</div> : featured.length ? <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{featured.map((product, index) => <ProductCard key={product.id} product={product} badge={index === 1 ? 'Best Seller' : `${20 + index * 5}% OFF`} onOpen={() => navigate(`/product/${product.id}`)} />)}</div> : <EmptyBlock icon={activeCat.icon} />}
            </section>

            <section className="mb-5">
              <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-extrabold text-foreground sm:text-2xl"><Crown className="h-6 w-6 fill-sellora-warning text-sellora-warning" /> Best Sellers</h2><Button variant="ghost" className="h-9 px-2 text-xs text-muted-foreground">See All <ArrowRight className="h-4 w-4" /></Button></div>
              {loading ? <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="aspect-[.75] animate-pulse rounded-[18px] bg-card" />)}</div> : bestSellers.length ? <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{bestSellers.map((product, index) => <ProductCard key={product.id} product={product} badge={index === 0 ? 'Trending' : index === 1 ? 'Popular' : undefined} onOpen={() => navigate(`/product/${product.id}`)} />)}</div> : <EmptyBlock icon={activeCat.icon} />}
            </section>

            <section className="grid grid-cols-3 divide-x divide-border rounded-[20px] bg-accent px-2 py-4">
              {[{ icon: Truck, title: 'Free Delivery', sub: 'On orders above ₹499' }, { icon: ShieldCheck, title: 'Secure Payments', sub: '100% Safe & Trusted' }, { icon: PackageCheck, title: 'Easy Returns', sub: 'Hassle Free' }].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex min-w-0 items-center justify-center gap-2 px-2"><Icon className="h-6 w-6 shrink-0 text-primary sm:h-8 sm:w-8" /><div className="min-w-0"><p className="truncate text-[10px] font-bold text-foreground sm:text-sm">{title}</p><p className="hidden truncate text-[10px] text-muted-foreground sm:block">{sub}</p></div></div>
              ))}
            </section>
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default CategoriesPage;