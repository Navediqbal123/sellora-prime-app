import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Product, SellerProfile } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Plus, 
  Eye, 
  MousePointer,
  TrendingUp,
  Edit2,
  Trash2,
  Loader2,
  X,
  ShoppingBag
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    city: '',
    state: '',
    phone_number: '',
    image_url: ''
  });

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Living',
    'Vehicles',
    'Services',
    'Other'
  ];

  useEffect(() => {
    fetchSellerData();
  }, [user]);

  const fetchSellerData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);

      // Fetch seller's products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerData.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!seller) return;

    // Validation
    if (!productForm.title.trim() || !productForm.price || !productForm.category) {
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
        seller_id: seller.id,
        title: productForm.title,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        city: productForm.city || seller.city,
        state: productForm.state || seller.state,
        phone_number: productForm.phone_number || seller.phone_number,
        image_url: productForm.image_url || null,
        views: 0,
        clicks: 0
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: "Product Updated!", description: "Your product has been updated successfully" });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast({ title: "Product Added!", description: "Your product is now live" });
      }

      setShowAddProduct(false);
      setEditingProduct(null);
      resetForm();
      fetchSellerData();
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

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({ title: "Product Deleted", description: "Product has been removed" });
      fetchSellerData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      city: product.city,
      state: product.state,
      phone_number: product.phone_number,
      image_url: product.image_url || ''
    });
    setShowAddProduct(true);
  };

  const resetForm = () => {
    setProductForm({
      title: '',
      description: '',
      price: '',
      category: '',
      city: '',
      state: '',
      phone_number: '',
      image_url: ''
    });
  };

  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalClicks = products.reduce((sum, p) => sum + (p.clicks || 0), 0);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'My Products' },
    { id: 'analytics', label: 'Analytics' }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome, <span className="text-gradient">{seller?.owner_name}</span>
            </h1>
            <p className="text-muted-foreground">{seller?.shop_name}</p>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowAddProduct(true);
            }}
            className="btn-glow mt-4 md:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fade-in-up stagger-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up stagger-2">
            <div className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <span className="text-muted-foreground">Total Products</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{products.length}</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                <span className="text-muted-foreground">Total Views</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{totalViews}</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-sellora-gold/10 flex items-center justify-center">
                  <MousePointer className="w-6 h-6 text-sellora-gold" />
                </div>
                <span className="text-muted-foreground">Total Clicks</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{totalClicks}</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-sellora-success/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-sellora-success" />
                </div>
                <span className="text-muted-foreground">Total Orders</span>
              </div>
              <p className="text-3xl font-bold text-foreground">0</p>
              <span className="text-xs text-muted-foreground">Coming Soon</span>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {products.length > 0 ? (
              products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="card-premium overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="h-40 bg-secondary flex items-center justify-center">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground truncate">{product.title}</h3>
                    <p className="text-xl font-bold text-gradient-gold mt-2">₹{product.price.toLocaleString()}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" /> {product.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointer className="w-4 h-4" /> {product.clicks || 0}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleEditProduct(product)}
                        className="flex-1"
                      >
                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first product</p>
                <Button onClick={() => setShowAddProduct(true)} className="btn-glow">
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="card-premium p-6">
              <h3 className="text-xl font-semibold mb-4">Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-muted-foreground text-sm">Views Today</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-muted-foreground text-sm">Clicks Today</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-muted-foreground text-sm">Conversion Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="card-premium p-6">
              <h3 className="text-xl font-semibold mb-4">Product Performance</h3>
              {products.length > 0 ? (
                <div className="space-y-3">
                  {products.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <span className="font-medium truncate flex-1">{product.title}</span>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span><Eye className="w-4 h-4 inline mr-1" />{product.views || 0}</span>
                        <span><MousePointer className="w-4 h-4 inline mr-1" />{product.clicks || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No products to analyze</p>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
            <div className="card-premium w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button 
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="input-floating">
                  <input
                    type="text"
                    id="title"
                    value={productForm.title}
                    onChange={(e) => setProductForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Product Title"
                  />
                  <label htmlFor="title">Product Title *</label>
                </div>

                <div className="input-floating">
                  <textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Description"
                    className="min-h-[100px] resize-none"
                  />
                  <label htmlFor="description">Description</label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="input-floating">
                    <input
                      type="number"
                      id="price"
                      value={productForm.price}
                      onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))}
                      placeholder="Price"
                    />
                    <label htmlFor="price">Price (₹) *</label>
                  </div>

                  <div className="input-floating">
                    <select
                      id="category"
                      value={productForm.category}
                      onChange={(e) => setProductForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full bg-input border border-border rounded-lg px-4 pt-6 pb-2"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <label htmlFor="category" className="text-xs text-primary -translate-y-3 scale-90">
                      Category *
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="input-floating">
                    <input
                      type="text"
                      id="city"
                      value={productForm.city}
                      onChange={(e) => setProductForm(p => ({ ...p, city: e.target.value }))}
                      placeholder="City"
                    />
                    <label htmlFor="city">City</label>
                  </div>

                  <div className="input-floating">
                    <input
                      type="text"
                      id="state"
                      value={productForm.state}
                      onChange={(e) => setProductForm(p => ({ ...p, state: e.target.value }))}
                      placeholder="State"
                    />
                    <label htmlFor="state">State</label>
                  </div>
                </div>

                <div className="input-floating">
                  <input
                    type="tel"
                    id="phone"
                    value={productForm.phone_number}
                    onChange={(e) => setProductForm(p => ({ ...p, phone_number: e.target.value }))}
                    placeholder="Phone Number"
                  />
                  <label htmlFor="phone">Phone Number</label>
                </div>

                <div className="input-floating">
                  <input
                    type="url"
                    id="image_url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm(p => ({ ...p, image_url: e.target.value }))}
                    placeholder="Image URL"
                  />
                  <label htmlFor="image_url">Image URL (optional)</label>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full btn-glow h-12">
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    editingProduct ? 'Update Product' : 'Add Product'
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SellerDashboard;
