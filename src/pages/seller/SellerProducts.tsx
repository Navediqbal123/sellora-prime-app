import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Eye, Heart, ShoppingCart, Edit2, Trash2, Search, BarChart3, SlidersHorizontal, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSellerAnalytics } from '@/hooks/useSellerAnalytics';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const formatCompact = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
};

const statusStyles: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  active:      { dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700', label: 'Active' },
  draft:       { dot: 'bg-amber-500',   bg: 'bg-amber-50',    text: 'text-amber-700',   label: 'Draft' },
  out_of_stock:{ dot: 'bg-red-500',     bg: 'bg-red-50',      text: 'text-red-700',     label: 'Out of Stock' },
  paused:      { dot: 'bg-slate-400',   bg: 'bg-slate-100',   text: 'text-slate-700',   label: 'Paused' },
};

const SellerProducts = () => {
  const navigate = useNavigate();
  const { data, loading, refetch } = useSellerAnalytics();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProducts = data.products.filter(product =>
    product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({ title: "Product Deleted", description: "Product has been removed successfully" });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-svh bg-white text-[#111111]">
      <div className="mx-auto max-w-2xl px-5 pt-8 pb-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-5 animate-fade-in">
          <h1 className="text-[32px] font-bold tracking-tight text-[#111111]">My Products</h1>
          <button
            className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center relative hover:border-slate-300 transition-colors"
            aria-label="Filters"
          >
            <SlidersHorizontal className="w-5 h-5 text-[#111111]" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6 animate-fade-in">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm text-[15px] placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#7C3AED]/20 focus-visible:border-[#7C3AED]"
          />
        </div>

        {/* Product cards */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 rounded-[20px] bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="space-y-4">
            {filteredProducts.map((product, index) => {
              const price = Number(product.price) || 0;
              const mrp = Number(product.mrp || product.original_price || product.compare_at_price) || 0;
              const hasDiscount = mrp > price && price > 0;
              const discountPct = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;
              const rawStatus = (product.status || 'active').toString().toLowerCase().replace(/\s+/g, '_');
              const status = statusStyles[rawStatus] || statusStyles.active;
              const views = product.views || 0;
              const wishlists = product.wishlist_count || product.wishlists || 0;
              const orders = product.orders_count || product.orders || 0;

              return (
                <div
                  key={product.id}
                  className="rounded-[20px] bg-white border border-slate-100 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.08)] overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <div className="p-4 flex gap-4">
                    {/* Image */}
                    <div className="w-[112px] h-[112px] rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-10 h-10 text-slate-300" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[16px] leading-snug text-[#111111] line-clamp-2">
                          {product.title}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1 -m-1 text-slate-400 hover:text-[#111111] transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/seller/add-product?edit=${product.id}`)}>
                              Edit product
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/seller/insights')}>
                              View insights
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => setDeleteId(product.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Status badge */}
                      <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </div>

                      {/* Prices */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {hasDiscount && (
                          <span className="text-slate-400 line-through text-sm">₹{mrp.toLocaleString()}</span>
                        )}
                        <span className="text-[20px] font-bold text-[#111111]">₹{price.toLocaleString()}</span>
                        {hasDiscount && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            -{discountPct}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="px-4 pb-3 grid grid-cols-3 gap-2">
                    <Stat icon={<Eye className="w-4 h-4 text-slate-500" />} value={formatCompact(views)} label="Views" />
                    <Stat icon={<Heart className="w-4 h-4 text-slate-500" />} value={formatCompact(wishlists)} label="Wishlists" />
                    <Stat icon={<ShoppingCart className="w-4 h-4 text-slate-500" />} value={formatCompact(orders)} label="Orders" />
                  </div>

                  {/* Actions */}
                  <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
                    <button
                      onClick={() => navigate(`/seller/add-product?edit=${product.id}`)}
                      className="flex items-center justify-center gap-1.5 py-3.5 text-[#7C3AED] font-medium text-sm hover:bg-[#7C3AED]/5 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => navigate('/seller/insights')}
                      className="flex items-center justify-center gap-1.5 py-3.5 text-[#7C3AED] font-medium text-sm hover:bg-[#7C3AED]/5 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" /> Insights
                    </button>
                    <button
                      onClick={() => setDeleteId(product.id)}
                      className="flex items-center justify-center gap-1.5 py-3.5 text-red-500 font-medium text-sm bg-red-50/40 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-[#7C3AED]/10 to-[#7C3AED]/5 flex items-center justify-center mb-5">
              <Package className="w-12 h-12 text-[#7C3AED]" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-[#111111] mb-2">
              {searchQuery ? 'No products found' : 'No Products Yet'}
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              {searchQuery ? 'Try a different search term' : 'Tap the + button below to add your first product.'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({ icon, value, label }) => (
  <div className="flex items-center gap-2">
    {icon}
    <div className="leading-tight">
      <div className="text-sm font-semibold text-[#111111]">{value}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  </div>
);

export default SellerProducts;
