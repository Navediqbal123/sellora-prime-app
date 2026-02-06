import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Eye, MousePointer, Edit2, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSellerAnalytics } from '@/hooks/useSellerAnalytics';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
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

const SellerProducts = () => {
  const navigate = useNavigate();
  const { data, loading, refetch } = useSellerAnalytics();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProducts = data.products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
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

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-40" />
        </div>
        <Skeleton className="h-12 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
              <Skeleton className="h-44 w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            My <span className="text-gradient">Products</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {data.totalProducts} products in your store
          </p>
        </div>
        <Button 
          onClick={() => navigate('/seller/add-product')}
          className="btn-glow group"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 bg-card/50 border-border/50 focus:border-primary/50"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="group overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 
                        border border-border/50 hover:border-primary/30 
                        transition-all duration-500 hover:shadow-[0_0_40px_-10px_hsl(262,83%,58%,0.3)]
                        animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Image */}
              <div className="h-44 bg-secondary/30 overflow-hidden relative">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-xl
                               text-xs font-medium text-foreground border border-border/50">
                  {product.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors text-lg">
                  {product.title}
                </h3>
                
                <p className="text-2xl font-bold text-gradient-gold mt-2">
                  ₹{product.price.toLocaleString()}
                </p>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Eye className="w-4 h-4 text-accent" /> 
                    <span>{product.views || 0}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MousePointer className="w-4 h-4 text-sellora-gold" /> 
                    <span>{product.clicks || 0}</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => navigate(`/seller/add-product?edit=${product.id}`)}
                    className="flex-1 group/btn bg-white/5 hover:bg-white/10"
                  >
                    <Edit2 className="w-4 h-4 mr-1.5 group-hover/btn:rotate-12 transition-transform" /> 
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setDeleteId(product.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 group/btn"
                  >
                    <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 animate-fade-in">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 
                             flex items-center justify-center animate-float">
                <Package className="w-12 h-12 text-muted-foreground/50" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">
              {searchQuery ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try a different search term' : 'Start by adding your first product'}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate('/seller/add-product')} className="btn-glow">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border/50">
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
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SellerProducts;
