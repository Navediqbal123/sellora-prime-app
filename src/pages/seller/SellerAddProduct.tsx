import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Package, Sparkles } from 'lucide-react';
import ImageUploader from '@/components/seller/ImageUploader';

const categories = [
  'Electronics',
  'Fashion',
  'Home & Living',
  'Vehicles',
  'Services',
  'Other'
];

const SellerAddProduct = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editId);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    city: '',
    state: '',
    phone_number: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch seller info
      const { data: seller } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (seller) {
        setSellerId(seller.id);
        setSellerInfo(seller);
        
        // Pre-fill location from seller
        setForm(prev => ({
          ...prev,
          city: seller.city || '',
          state: seller.state || '',
          phone_number: seller.phone_number || seller.phone || '',
        }));
      }

      // If editing, fetch product
      if (editId) {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', editId)
          .single();

        if (product) {
          setForm({
            title: product.title,
            description: product.description || '',
            price: product.price.toString(),
            category: product.category,
            city: product.city,
            state: product.state,
            phone_number: product.phone_number,
          });
          
          // Handle existing images
          if (product.images && Array.isArray(product.images)) {
            setImages(product.images);
          } else if (product.image_url) {
            setImages([product.image_url]);
          }
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user, editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sellerId) {
      toast({
        title: "Error",
        description: "Seller profile not found",
        variant: "destructive"
      });
      return;
    }

    if (!form.title.trim() || !form.price || !form.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        seller_id: sellerId,
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        city: form.city,
        state: form.state,
        phone_number: form.phone_number,
        image_url: images[0] || null,
        images: images,
        views: 0,
        clicks: 0
      };

      if (editId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editId);

        if (error) throw error;
        toast({ title: "Success!", description: "Product updated successfully" });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast({ title: "Success!", description: "Product added successfully" });
      }

      navigate('/seller/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-primary/20 animate-ping" />
          <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/seller/products')}
          className="rounded-xl hover:bg-white/5 hover:scale-105 transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            {editId ? 'Edit' : 'Add New'} <span className="text-gradient">Product</span>
            <Sparkles className="w-6 h-6 text-sellora-gold animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-1">
            {editId ? 'Update your product details' : 'List a new product in your store'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-card via-card/80 to-card/40 border border-border/50 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
            
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-foreground mb-1">Product Images</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Upload high-quality images to attract buyers
              </p>
              
              <ImageUploader
                images={images}
                onImagesChange={setImages}
                maxImages={5}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-card via-card/80 to-card/40 border border-border/50 backdrop-blur-xl space-y-6">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
            
            <div className="relative z-10 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Product Details</h3>
                <p className="text-sm text-muted-foreground">
                  Provide accurate information about your product
                </p>
              </div>

              {/* Title */}
              <div className="input-floating">
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder=" "
                  required
                  className="h-14"
                />
                <label htmlFor="title">Product Title *</label>
              </div>

              {/* Description */}
              <div className="input-floating">
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder=" "
                  rows={4}
                  className="pt-6"
                />
                <label htmlFor="description">Description</label>
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="input-floating">
                  <Input
                    id="price"
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder=" "
                    required
                    min="0"
                    step="0.01"
                    className="h-14"
                  />
                  <label htmlFor="price">Price (₹) *</label>
                </div>

                <div>
                  <Select
                    value={form.category}
                    onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="h-14 bg-input border-border">
                      <SelectValue placeholder="Select Category *" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Contact Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-card via-card/80 to-card/40 border border-border/50 backdrop-blur-xl space-y-6">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
            
            <div className="relative z-10 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Location & Contact</h3>
                <p className="text-sm text-muted-foreground">
                  Help buyers find and reach you
                </p>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="input-floating">
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder=" "
                    className="h-14"
                  />
                  <label htmlFor="city">City</label>
                </div>

                <div className="input-floating">
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => setForm(prev => ({ ...prev, state: e.target.value }))}
                    placeholder=" "
                    className="h-14"
                  />
                  <label htmlFor="state">State</label>
                </div>
              </div>

              {/* Phone */}
              <div className="input-floating">
                <Input
                  id="phone"
                  value={form.phone_number}
                  onChange={(e) => setForm(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder=" "
                  className="h-14"
                />
                <label htmlFor="phone">Contact Phone</label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/seller/products')}
            className="flex-1 h-14 text-muted-foreground hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-14 btn-glow group"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {editId ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                <Package className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                {editId ? 'Update Product' : 'Add Product'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SellerAddProduct;
