import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Product, SellerProfile } from '@/lib/supabase';
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
  ShoppingBag,
  ShoppingCart
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import { ViewsLineChart, ClicksBarChart, CategoryDonutChart } from '@/components/analytics/AnalyticsCharts';

type SellerSection = 'overview' | 'products' | 'analytics' | 'add-product';

const SellerDashboard = ({ section = 'overview' }: { section?: SellerSection }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (section === 'add-product') {
      setActiveTab('products');
      setShowAddProduct(true);
      return;
    }

    setShowAddProduct(false);
    setEditingProduct(null);
    setActiveTab(section);
  }, [section]);

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
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (sellerError) throw sellerError;

      // Check if seller exists and is approved
      if (!sellerData) {
        navigate('/seller/onboarding');
        return;
      }

      if (sellerData.status !== 'approved') {
        navigate('/seller/review');
        return;
      }

      setSeller(sellerData as any);

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
      const sellerPhone = (seller as any)?.phone_number ?? (seller as any)?.phone;

      const productData = {
        seller_id: seller.id,
        title: productForm.title,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        city: productForm.city || seller.city,
        state: productForm.state || seller.state,
        phone_number: productForm.phone_number || sellerPhone,
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
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
            className="btn-glow mt-4 md:mt-0 group"
          >
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add Product
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fade-in-up">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-300
                         ${activeTab === tab.id
                           ? 'bg-primary text-primary-foreground shadow-button'
                           : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                         }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {activeTab === tab.id && (
                <div className="absolute inset-0 rounded-xl bg-primary blur-md opacity-40 -z-10" />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
            <AnalyticsCard
              title="Total Products"
              value={products.length}
              icon={Package}
              color="primary"
              delay={0}
            />
            <AnalyticsCard
              title="Total Views"
              value={totalViews}
              icon={Eye}
              color="accent"
              delay={0.1}
            />
            <AnalyticsCard
              title="Total Clicks"
              value={totalClicks}
              icon={MousePointer}
              color="gold"
              delay={0.2}
            />
            <AnalyticsCard
              title="Orders"
              value={0}
              icon={ShoppingCart}
              color="success"
              suffix="(soon)"
              delay={0.3}
            />
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {products.length > 0 ? (
              products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="group overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 
                            border border-border/50 hover:border-primary/30 
                            transition-all duration-500 hover:shadow-glow animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="h-44 bg-secondary overflow-hidden relative">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md
                                   text-xs font-medium text-foreground border border-border/50">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-2xl font-bold text-gradient-gold mt-2">₹{product.price.toLocaleString()}</p>
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
                        className="flex-1 group/btn"
                      >
                        <Edit2 className="w-4 h-4 mr-1 group-hover/btn:rotate-12 transition-transform" /> Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="group/btn"
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
                    <ShoppingBag className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">No products yet</h3>
                <p className="text-muted-foreground mb-6">Start by adding your first product</p>
                <Button onClick={() => setShowAddProduct(true)} className="btn-glow">
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnalyticsCard title="Total Products" value={products.length} icon={Package} color="primary" delay={0} />
              <AnalyticsCard title="Total Views" value={totalViews} icon={Eye} color="accent" delay={0.1} />
              <AnalyticsCard title="Total Clicks" value={totalClicks} icon={MousePointer} color="gold" delay={0.2} />
              <AnalyticsCard 
                title="Conversion Rate" 
                value={totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0} 
                icon={TrendingUp} 
                color="success" 
                suffix="%" 
                delay={0.3} 
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ViewsLineChart />
              <ClicksBarChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CategoryDonutChart />
              
              {/* Product Performance List */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 
                             border border-border/50 animate-fade-in-up stagger-3">
                <h3 className="text-lg font-semibold mb-6 text-foreground">Product Performance</h3>
                {products.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {products.map((product, index) => (
                      <div 
                        key={product.id} 
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/50
                                  hover:bg-secondary transition-colors animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <span className="font-medium truncate flex-1 text-foreground">{product.title}</span>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="w-4 h-4 text-accent" />{product.views || 0}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MousePointer className="w-4 h-4 text-sellora-gold" />{product.clicks || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-12">No products to analyze</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl
                           bg-gradient-to-br from-card to-card/50 border border-border/50 
                           shadow-glow-lg animate-scale-in">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button 
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground 
                            hover:bg-secondary transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-5">
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
                    <label htmlFor="category">Category *</label>
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
                    id="image"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm(p => ({ ...p, image_url: e.target.value }))}
                    placeholder="Image URL"
                  />
                  <label htmlFor="image">Image URL</label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowAddProduct(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 btn-glow"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default SellerDashboard;
