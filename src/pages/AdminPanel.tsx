import React, { useState, useEffect } from 'react';
import { supabase, SellerProfile, Product } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Store, 
  Package, 
  Search, 
  Eye, 
  MousePointer,
  ArrowLeft,
  Loader2,
  Calendar,
  Phone,
  MapPin,
  Mail,
  X
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalSearches: number;
  totalViews: number;
}

interface SearchLog {
  id: string;
  query: string;
  created_at: string;
}

interface ClickLog {
  id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

const AdminPanel = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalSearches: 0,
    totalViews: 0
  });
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [clickLogs, setClickLogs] = useState<ClickLog[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch counts
      const [sellersRes, productsRes, searchesRes] = await Promise.all([
        supabase.from('sellers').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id, views', { count: 'exact' }),
        supabase.from('search_logs').select('id', { count: 'exact', head: true })
      ]);

      const totalViews = productsRes.data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

      setStats({
        totalUsers: sellersRes.count || 0, // Approximation
        totalSellers: sellersRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalSearches: searchesRes.count || 0,
        totalViews
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellers = async () => {
    const { data } = await supabase
      .from('sellers')
      .select('*')
      .order('created_at', { ascending: false });
    setSellers(data || []);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        seller:sellers(shop_name, owner_name)
      `)
      .order('created_at', { ascending: false });
    setProducts(data || []);
  };

  const fetchSearchLogs = async () => {
    const { data } = await supabase
      .from('search_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setSearchLogs(data || []);
  };

  const fetchClickLogs = async () => {
    const { data } = await supabase
      .from('click_logs')
      .select(`
        *,
        product:products(title, seller_id)
      `)
      .order('created_at', { ascending: false })
      .limit(100);
    setClickLogs(data || []);
  };

  const fetchSellerProducts = async (sellerId: string) => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
    setSellerProducts(data || []);
  };

  const handleSectionClick = async (section: string) => {
    setActiveSection(section);
    setSelectedSeller(null);

    switch (section) {
      case 'sellers':
        await fetchSellers();
        break;
      case 'products':
        await fetchProducts();
        break;
      case 'searches':
        await fetchSearchLogs();
        break;
      case 'clicks':
        await fetchClickLogs();
        break;
    }
  };

  const handleSellerClick = async (seller: SellerProfile) => {
    setSelectedSeller(seller);
    await fetchSellerProducts(seller.id);
  };

  const statCards = [
    { id: 'users', label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'primary' },
    { id: 'sellers', label: 'Total Sellers', value: stats.totalSellers, icon: Store, color: 'accent' },
    { id: 'products', label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'sellora-gold' },
    { id: 'searches', label: 'Total Searches', value: stats.totalSearches, icon: Search, color: 'sellora-warning' },
    { id: 'clicks', label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'sellora-success' }
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
        <div className="mb-8 animate-fade-in-up">
          {activeSection ? (
            <button
              onClick={() => {
                setActiveSection(null);
                setSelectedSeller(null);
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          ) : null}
          <h1 className="text-3xl font-bold text-foreground">
            Admin <span className="text-gradient">Panel</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage your platform</p>
        </div>

        {/* Main Dashboard */}
        {!activeSection && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {statCards.map((card, index) => (
                <div
                  key={card.id}
                  className="stat-card animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleSectionClick(card.id)}
                >
                  <div className={`w-12 h-12 rounded-xl bg-${card.color}/10 flex items-center justify-center mb-3`}>
                    <card.icon className={`w-6 h-6 text-${card.color}`} />
                  </div>
                  <p className="text-muted-foreground text-sm">{card.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in-up stagger-2">
              {[
                { id: 'sellers', label: 'Sellers', icon: Store },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'searches', label: 'Searches', icon: Search },
                { id: 'clicks', label: 'Views/Clicks', icon: MousePointer }
              ].map(action => (
                <Button
                  key={action.id}
                  variant="secondary"
                  className="h-24 flex-col gap-2"
                  onClick={() => handleSectionClick(action.id)}
                >
                  <action.icon className="w-6 h-6" />
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          </>
        )}

        {/* Sellers Section */}
        {activeSection === 'sellers' && !selectedSeller && (
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4">All Sellers ({sellers.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellers.map((seller, index) => (
                <div
                  key={seller.id}
                  onClick={() => handleSellerClick(seller)}
                  className="card-premium p-4 cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{seller.shop_name}</h3>
                      <p className="text-sm text-muted-foreground">{seller.owner_name}</p>
                    </div>
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {seller.phone_number}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {seller.city}, {seller.state}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {new Date(seller.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Seller Detail */}
        {selectedSeller && (
          <div className="animate-fade-in-up">
            <button
              onClick={() => setSelectedSeller(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Sellers
            </button>

            <div className="card-premium p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedSeller.shop_name}</h2>
                  <p className="text-muted-foreground">{selectedSeller.owner_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{new Date(selectedSeller.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedSeller.phone_number}</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium truncate">{selectedSeller.email}</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedSeller.city}, {selectedSeller.state}</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Business Type</p>
                  <p className="font-medium">{selectedSeller.business_type}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Full Address</p>
                <p className="font-medium">
                  {selectedSeller.address}, {selectedSeller.city}, {selectedSeller.state} - {selectedSeller.pincode}
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">
              Products by {selectedSeller.shop_name} ({sellerProducts.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellerProducts.map(product => (
                <div key={product.id} className="card-premium p-4">
                  <h4 className="font-semibold truncate">{product.title}</h4>
                  <p className="text-xl font-bold text-gradient-gold mt-2">₹{product.price.toLocaleString()}</p>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span><Eye className="w-4 h-4 inline" /> {product.views || 0}</span>
                    <span><MousePointer className="w-4 h-4 inline" /> {product.clicks || 0}</span>
                  </div>
                </div>
              ))}
              {sellerProducts.length === 0 && (
                <p className="col-span-full text-muted-foreground text-center py-8">No products yet</p>
              )}
            </div>
          </div>
        )}

        {/* Products Section */}
        {activeSection === 'products' && (
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4">All Products ({products.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Product</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Seller</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Price</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Views</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr 
                      key={product.id} 
                      className="border-b border-border/50 hover:bg-secondary/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <td className="py-3 px-4 font-medium">{product.title}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {(product.seller as any)?.shop_name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-sellora-gold font-semibold">
                        ₹{product.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">{product.views || 0}</td>
                      <td className="py-3 px-4">{product.clicks || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Searches Section */}
        {activeSection === 'searches' && (
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4">Search Logs ({searchLogs.length})</h2>
            <div className="card-premium overflow-hidden">
              {searchLogs.length > 0 ? (
                <div className="divide-y divide-border">
                  {searchLogs.map((log, index) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{log.query}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No search logs yet</p>
              )}
            </div>
          </div>
        )}

        {/* Clicks Section */}
        {activeSection === 'clicks' && (
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4">Click Logs ({clickLogs.length})</h2>
            <div className="card-premium overflow-hidden">
              {clickLogs.length > 0 ? (
                <div className="divide-y divide-border">
                  {clickLogs.map((log, index) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <MousePointer className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {(log.product as any)?.title || 'Unknown Product'}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No click logs yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPanel;
