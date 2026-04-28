import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Smartphone, Shirt, Home as HomeIcon, Sparkles, Dumbbell,
  Gamepad2, Car, BookOpen, ArrowLeft, Plus, Flame, Star,
} from 'lucide-react';
import { supabase, Product } from '@/lib/supabase';
import BottomNav from '@/components/home/BottomNav';
import { toast } from '@/hooks/use-toast';

const categories = [
  { id: 'Electronics', label: 'Electronics', icon: Smartphone, color: 'from-blue-500 to-cyan-400' },
  { id: 'Fashion', label: 'Fashion', icon: Shirt, color: 'from-pink-500 to-rose-400' },
  { id: 'Home & Living', label: 'Home & Living', icon: HomeIcon, color: 'from-amber-500 to-orange-400' },
  { id: 'Beauty & Health', label: 'Beauty & Health', icon: Sparkles, color: 'from-fuchsia-500 to-purple-400' },
  { id: 'Sports & Outdoors', label: 'Sports & Outdoors', icon: Dumbbell, color: 'from-emerald-500 to-teal-400' },
  { id: 'Toys & Games', label: 'Toys & Games', icon: Gamepad2, color: 'from-indigo-500 to-violet-400' },
  { id: 'Automotive', label: 'Automotive', icon: Car, color: 'from-red-500 to-orange-500' },
  { id: 'Books', label: 'Books', icon: BookOpen, color: 'from-yellow-500 to-amber-400' },
];

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initial = params.get('cat') || categories[0].id;
  const [selected, setSelected] = useState(initial);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  const featured = useMemo(() => products.slice(0, 6), [products]);
  const bestSellers = useMemo(() => {
    return [...products]
      .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
      .slice(0, 6);
  }, [products]);

  const activeCat = categories.find((c) => c.id === selected) || categories[0];

  const handleAdd = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${p.id}`);
    toast({ title: 'Opening product', description: p.title });
  };

  return (
    <div className="bg-background min-h-screen pb-24 md:pb-8">
      <div className="container mx-auto px-4 pt-5 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center hover:border-primary/40 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Categories</h1>
            <p className="text-xs text-muted-foreground">Browse by category</p>
          </div>
        </div>

        {/* Two-column layout: left rail + right content */}
        <div className="flex gap-3">
          {/* LEFT SIDEBAR */}
          <aside className="w-20 sm:w-24 shrink-0">
            <div className="sticky top-3 space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide pr-1">
              {categories.map((c) => {
                const Icon = c.icon;
                const active = c.id === selected;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={`relative w-full flex flex-col items-center gap-1.5 px-1 py-3 rounded-2xl transition-all duration-300
                      ${active
                        ? 'bg-primary/10 border border-primary/40'
                        : 'bg-card border border-border/50 hover:border-primary/30'}`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-r-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                      ${active
                        ? `bg-gradient-to-br ${c.color} shadow-[0_6px_18px_-6px_hsl(var(--primary)/0.6)]`
                        : 'bg-muted/50'}`}>
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`text-[10px] font-medium leading-tight text-center line-clamp-2
                      ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Banner */}
            <div className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${activeCat.color}`}>
              <div className="relative z-10">
                <p className="text-[11px] uppercase tracking-wider text-white/80">Category</p>
                <h2 className="text-lg sm:text-2xl font-bold text-white">{activeCat.label}</h2>
                <p className="text-xs text-white/85 mt-0.5">
                  {products.length} {products.length === 1 ? 'product' : 'products'} available
                </p>
              </div>
              <activeCat.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/20" />
            </div>

            {/* Featured */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-primary" /> Featured
                </h3>
                <span className="text-[11px] text-muted-foreground">{featured.length} items</span>
              </div>
              {loading ? (
                <div className="grid grid-cols-2 gap-2.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-[3/4] bg-card border border-border/50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : featured.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">No featured products yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {featured.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden text-left hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="aspect-square bg-muted overflow-hidden">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <activeCat.icon className="w-8 h-8 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <h4 className="text-xs font-semibold text-foreground line-clamp-1">{p.title}</h4>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-sm font-bold text-primary">₹{p.price}</span>
                          <span
                            onClick={(e) => handleAdd(p, e)}
                            className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center
                                       hover:scale-110 active:scale-95 transition-transform shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.6)]"
                            aria-label="Add"
                          >
                            <Plus className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Best Sellers */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-primary fill-primary/30" /> Best Sellers
                </h3>
                <span className="text-[11px] text-muted-foreground">{bestSellers.length} items</span>
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-card border border-border/50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : bestSellers.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">No best sellers yet.</p>
              ) : (
                <div className="space-y-2">
                  {bestSellers.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="w-full flex items-center gap-3 p-2 bg-card border border-border/60 rounded-2xl
                                 hover:border-primary/40 transition-all duration-300 text-left"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <activeCat.icon className="w-6 h-6 text-muted-foreground/40" />
                          </div>
                        )}
                        <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-md">
                          {i + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground line-clamp-1">{p.title}</h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{p.city || activeCat.label}</p>
                        <p className="text-sm font-bold text-primary mt-0.5">₹{p.price}</p>
                      </div>
                      <span
                        onClick={(e) => handleAdd(p, e)}
                        className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0
                                   hover:scale-105 active:scale-95 transition-transform shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.6)]"
                        aria-label="Add"
                      >
                        <Plus className="w-4 h-4" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default CategoriesPage;