import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Car, Compass, Crown, Dumbbell, Gamepad2, Heart,
  Home as HomeIcon, Leaf, PackageCheck, Search, ShieldCheck, Shirt,
  ShoppingBag, ShoppingBasket, ShoppingCart, Smartphone, Star, Truck,
} from 'lucide-react';
import { supabase, Product } from '@/lib/supabase';
import { useWishlist } from '@/hooks/useWishlist';
import BottomNav from '@/components/home/BottomNav';
import NotificationBell from '@/components/NotificationBell';
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

const ratings = ['4.5', '4.4', '4.6', '4.7', '4.6', '4.4'];
const dealBadges = ['30% OFF', 'Best Seller', '20% OFF'];
const sellerBadges = ['Trending', 'Popular', '25% OFF'];

interface ProductCardProps {
  product: Product;
  index: number;
  badge?: string;
  badgeTone?: 'deal' | 'success' | 'primary';
  wished: boolean;
  onWishlist: () => void;
  onOpen: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product, index, badge, badgeTone = 'deal', wished, onWishlist, onOpen,
}) => {
  const price = Number(product.price);
  const oldPrice = Math.round(price * (1.2 + (index % 3) * 0.05));
  const badgeClass = badgeTone === 'success'
    ? 'bg-sellora-success text-primary-foreground'
    : badgeTone === 'primary'
      ? 'bg-primary text-primary-foreground'
      : 'bg-destructive text-destructive-foreground';

  return (
    <article className="group min-w-0 overflow-hidden rounded-[15px] border border-border bg-card shadow-category-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-category-card-hover">
      <div className="relative aspect-[1/1.03] overflow-hidden bg-secondary">
        <button type="button" onClick={onOpen} aria-label={`View ${product.title}`} className="block h-full w-full">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} loading="lazy" className="h-full w-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-105 sm:p-3" />
          ) : (
            <span className="flex h-full w-full items-center justify-center"><ShoppingBag className="h-8 w-8 text-muted-foreground/40" /></span>
          )}
        </button>
        {badge && <span className={`absolute left-1.5 top-1.5 max-w-[62%] truncate rounded-full px-2 py-1 text-[8px] font-extrabold leading-none sm:left-2 sm:top-2 sm:text-[10px] ${badgeClass}`}>{badge}</span>}
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={wished ? `Remove ${product.title} from wishlist` : `Save ${product.title}`}
          onClick={(event) => { event.stopPropagation(); onWishlist(); }}
          className="absolute right-1.5 top-1.5 h-7 w-7 rounded-full border-border bg-card p-0 shadow-sm sm:right-2 sm:top-2 sm:h-8 sm:w-8"
        >
          <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${wished ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
        </Button>
      </div>
      <div className="min-w-0 p-2 sm:p-3">
        <button type="button" onClick={onOpen} className="block min-w-0 w-full text-left">
          <h3 className="truncate text-[10px] font-bold leading-tight text-foreground sm:text-sm">{product.title}</h3>
          <p className="mt-1 truncate text-[8px] leading-tight text-muted-foreground sm:text-xs">{product.category}</p>
          <div className="mt-1.5 flex min-w-0 items-center gap-0.5 text-[8px] font-semibold text-foreground sm:text-[11px]">
            <Star className="h-3 w-3 shrink-0 fill-sellora-warning text-sellora-warning sm:h-3.5 sm:w-3.5" />
            <span>{ratings[index % ratings.length]}</span>
            <span className="truncate font-normal text-muted-foreground">({Math.max(product.views || 0, 1)})</span>
          </div>
        </button>
        <div className="mt-1.5 flex min-w-0 items-end justify-between gap-1">
          <div className="min-w-0">
            <p className="truncate text-[12px] font-extrabold leading-none text-foreground sm:text-base">₹{price.toLocaleString('en-IN')}</p>
            <p className="mt-1 truncate text-[8px] text-muted-foreground line-through sm:text-[10px]">₹{oldPrice.toLocaleString('en-IN')}</p>
          </div>
          <Button type="button" size="icon" onClick={onOpen} aria-label={`Add ${product.title}`} className="h-7 w-7 shrink-0 rounded-[10px] p-0 shadow-category-button sm:h-9 sm:w-9">
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
};

const ProductGrid: React.FC<{
  products: Product[];
  loading: boolean;
  badges: string[];
  sellerGrid?: boolean;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  openProduct: (id: string) => void;
}> = ({ products, loading, badges, sellerGrid = false, isWishlisted, toggleWishlist, openProduct }) => {
  if (loading) {
    return <div className="grid grid-cols-3 gap-1.5 sm:gap-3">{[1, 2, 3].map((item) => <div key={item} className="aspect-[.58] animate-pulse rounded-[15px] bg-card" />)}</div>;
  }
  if (!products.length) return null;
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          badge={badges[index]}
          badgeTone={sellerGrid ? (index === 0 ? 'success' : index === 1 ? 'primary' : 'deal') : 'deal'}
          wished={isWishlisted(product.id)}
          onWishlist={() => toggleWishlist(product.id)}
          onOpen={() => openProduct(product.id)}
        />
      ))}
    </div>
  );
};

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState(params.get('cat') || categories[0].id);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    setParams({ cat: selected }, { replace: true });
  }, [selected, setParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) console.error(error);
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matchesSearch = query
      ? products.filter((product) => `${product.title} ${product.description || ''} ${product.category}`.toLowerCase().includes(query))
      : products;
    const categoryMatches = matchesSearch.filter((product) => product.category === selected);
    return categoryMatches.length ? categoryMatches : matchesSearch;
  }, [products, search, selected]);

  const deals = visibleProducts.slice(0, 3);
  const bestSellers = [...visibleProducts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  const openProduct = (id: string) => navigate(`/product/${id}`);

  return (
    <div className="categories-light min-h-screen w-full max-w-full overflow-x-hidden bg-background pb-28 text-foreground md:pb-10">
      <div className="mx-auto w-full max-w-[1180px] px-2.5 pt-3 sm:px-5 lg:px-8">
        <header className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-3 sm:flex sm:gap-4">
          <button type="button" onClick={() => navigate('/')} className="flex min-w-0 items-center gap-2 text-left" aria-label="Go to Sellora home">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary shadow-category-button">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[22px] font-extrabold leading-none text-foreground">Sell<span className="text-primary">ora</span></span>
              <span className="mt-1 block truncate text-[9px] font-medium text-muted-foreground">Shop More, Live Better</span>
            </span>
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/categories')}
            aria-label="Explore categories"
            className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground shadow-category-button hover:bg-primary/90 sm:order-3"
          >
            <Compass className="h-5 w-5" />
          </Button>
          <label className="col-span-2 flex h-11 min-w-0 items-center gap-2.5 rounded-full bg-secondary px-4 focus-within:ring-2 focus-within:ring-primary/20 sm:order-2 sm:col-auto sm:flex-1">
            <Search className="h-5 w-5 shrink-0 text-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder="Search products, brands..." />
          </label>
        </header>

        <div className="grid grid-cols-[66px_minmax(0,1fr)] items-start gap-2.5 sm:grid-cols-[86px_minmax(0,1fr)] sm:gap-5">
          <aside className="w-full min-w-0">
            <nav aria-label="Product categories" className="sticky top-2 max-h-[calc(100svh-96px)] space-y-1 overflow-y-auto overflow-x-hidden pb-24 scrollbar-hide">
              {categories.map((category) => {
                const Icon = category.icon;
                const active = category.id === selected;
                return (
                  <Button
                    key={category.id}
                    type="button"
                    variant="ghost"
                    onClick={() => setSelected(category.id)}
                    className={`relative h-auto min-h-[70px] w-full min-w-0 flex-col gap-1 whitespace-normal rounded-[16px] px-0.5 py-2 text-center transition-all ${active ? 'bg-accent text-primary' : 'text-foreground hover:bg-secondary'}`}
                  >
                    {active && <span className="absolute -left-2.5 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary" />}
                    <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />
                    <span className="block w-full break-words text-[9px] font-semibold leading-[1.12] sm:text-[11px]">{category.label}</span>
                  </Button>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 overflow-hidden">
            <div className="mb-3 flex min-w-0 items-end justify-between gap-1.5">
              <div className="min-w-0">
                <h1 className="truncate text-[25px] font-extrabold leading-tight text-foreground sm:text-[32px]">Categories</h1>
                <p className="truncate text-[10px] text-muted-foreground sm:text-sm">Explore by category and find what you love</p>
              </div>
            </div>

            <section className="relative mb-4 aspect-[1.62/1] min-h-[170px] w-full overflow-hidden rounded-[20px] bg-accent shadow-category-hero sm:aspect-[2.15/1] sm:min-h-[250px] sm:rounded-[24px]">
              <img src={heroImage} alt="Premium electronics on a lavender display" className="absolute inset-0 h-full w-full object-cover object-center" />
              <div className="absolute inset-0 bg-category-hero-overlay" />
              <div className="relative z-10 flex h-full max-w-[58%] flex-col items-start justify-center p-3 sm:p-8">
                <h2 className="text-[19px] font-extrabold leading-[1.02] text-foreground sm:text-[38px]">Upgrade<br />Your <span className="text-primary">Tech Life</span></h2>
                <p className="mt-2 hidden text-sm leading-relaxed text-muted-foreground min-[470px]:block">Latest gadgets. Better living.<br />Only on Sellora.</p>
                <Button onClick={() => setSelected('Electronics')} className="mt-3 h-8 rounded-[10px] px-2.5 text-[9px] shadow-category-button sm:h-11 sm:px-5 sm:text-sm">Shop Electronics <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" /></Button>
              </div>
              <span className="absolute bottom-2.5 right-3 text-[9px] font-semibold text-primary-foreground sm:bottom-4 sm:right-4 sm:text-xs">1/3</span>
            </section>

            <section className="mb-4">
              <div className="mb-2 flex items-center justify-between"><h2 className="text-[17px] font-extrabold text-foreground sm:text-2xl">Shop by Category</h2><Button variant="ghost" className="h-8 px-1 text-[9px] text-muted-foreground sm:text-xs">See All <ArrowRight className="h-3.5 w-3.5" /></Button></div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:gap-5">
                {categories.slice(0, 5).map((category) => {
                  const Icon = category.icon;
                  const active = category.id === selected;
                  return (
                    <Button key={category.id} type="button" variant="ghost" onClick={() => setSelected(category.id)} className="h-auto min-w-[47px] flex-col gap-1.5 p-0 hover:bg-transparent sm:min-w-[84px]">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all sm:h-16 sm:w-16 ${active ? 'border-primary bg-card text-primary shadow-category-ring' : 'border-border bg-card text-foreground shadow-sm'}`}><Icon className="h-5 w-5 sm:h-6 sm:w-6" /></span>
                      <span className={`w-[48px] whitespace-normal text-center text-[8px] font-semibold leading-tight sm:w-[78px] sm:text-xs ${active ? 'text-primary' : 'text-muted-foreground'}`}>{category.label}</span>
                    </Button>
                  );
                })}
              </div>
            </section>

            <section className="mb-4 rounded-[20px] bg-accent p-2 sm:rounded-[24px] sm:p-4">
              <div className="mb-2.5 flex min-w-0 items-end justify-between gap-1">
                <div className="min-w-0"><h2 className="truncate text-[17px] font-extrabold text-foreground sm:text-2xl">Today's Deals <span aria-hidden="true">🔥</span></h2><p className="truncate text-[8px] text-muted-foreground sm:text-sm">Limited time offers. Don't miss out!</p></div>
                <Button variant="outline" className="h-8 shrink-0 rounded-full border-border bg-card px-2 text-[8px] text-primary shadow-sm sm:h-9 sm:px-3 sm:text-xs">View All <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" /></Button>
              </div>
              <ProductGrid products={deals} loading={loading} badges={dealBadges} isWishlisted={isWishlisted} toggleWishlist={toggleWishlist} openProduct={openProduct} />
            </section>

            <section className="mb-4">
              <div className="mb-2.5 flex items-center justify-between gap-1"><h2 className="flex min-w-0 items-center gap-1 truncate text-[17px] font-extrabold text-foreground sm:text-2xl"><Crown className="h-5 w-5 shrink-0 fill-sellora-warning text-sellora-warning sm:h-6 sm:w-6" /> Best Sellers</h2><Button variant="ghost" className="h-8 shrink-0 px-1 text-[9px] text-muted-foreground sm:text-xs">See All <ArrowRight className="h-3.5 w-3.5" /></Button></div>
              <ProductGrid products={bestSellers} loading={loading} badges={sellerBadges} sellerGrid isWishlisted={isWishlisted} toggleWishlist={toggleWishlist} openProduct={openProduct} />
            </section>

          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default CategoriesPage;