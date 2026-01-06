import React, { useState, useEffect } from 'react';
import { supabase, SellerProfile, Product } from '@/lib/supabase';
import { 
  Users, 
  Store, 
  Package, 
  Search, 
  Eye, 
  MousePointer,
  ArrowLeft,
  Loader2,
  Phone,
  MapPin,
  Mail,
  Building,
  Calendar,
  TrendingUp,
  Sparkles,
  LayoutDashboard,
  ChevronRight
} from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import SellerCard from '@/components/admin/SellerCard';
import AnimatedTable from '@/components/admin/AnimatedTable';
import { Button } from '@/components/ui/button';

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

type AdminSection = 'dashboard' | 'users' | 'sellers' | 'products' | 'searches' | 'clicks' | 'seller-requests';

const sectionTabs = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'sellers', label: 'Sellers', icon: Store },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'seller-requests', label: 'Seller Requests', icon: Sparkles },
  { id: 'searches', label: 'Searches', icon: Search },
  { id: 'clicks', label: 'Views / Clicks', icon: Eye },
];

const AdminPanel = ({ section = 'dashboard' }: { section?: AdminSection }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalSearches: 0,
    totalViews: 0
  });
  const [activeSection, setActiveSection] = useState<AdminSection>(section);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [clickLogs, setClickLogs] = useState<ClickLog[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);

  useEffect(() => {
    setActiveSection(section);
    setSelectedSeller(null);
  }, [section]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeSection === 'sellers' || activeSection === 'seller-requests') fetchSellers();
    if (activeSection === 'products') fetchProducts();
    if (activeSection === 'searches') fetchSearchLogs();
    if (activeSection === 'clicks') fetchClickLogs();
  }, [activeSection]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [sellersRes, productsRes, searchesRes] = await Promise.all([
        supabase.from('sellers').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id, views', { count: 'exact' }),
        supabase.from('search_logs').select('id', { count: 'exact', head: true })
      ]);

      const totalViews = productsRes.data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

      setStats({
        totalUsers: sellersRes.count || 0,
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
      .select(`*, seller:sellers(shop_name, owner_name)`)
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
      .select(`*, product:products(title, seller_id)`)
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

  const handleSellerClick = async (seller: SellerProfile) => {
    setSelectedSeller(seller);
    await fetchSellerProducts(seller.id);
  };

  const statCards = [
    { id: 'users', label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'primary' as const },
    { id: 'sellers', label: 'Total Sellers', value: stats.totalSellers, icon: Store, color: 'accent' as const },
    { id: 'products', label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'gold' as const },
    { id: 'searches', label: 'Total Searches', value: stats.totalSearches, icon: Search, color: 'warning' as const },
    { id: 'clicks', label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'success' as const }
  ];

  const productColumns = [
    { key: 'title', label: 'Product', render: (val: string) => <span className="font-medium text-foreground">{val}</span> },
    { key: 'seller', label: 'Seller', render: (_: any, row: any) => <span className="text-muted-foreground">{row.seller?.shop_name || 'Unknown'}</span> },
    { key: 'price', label: 'Price', render: (val: number) => <span className="font-semibold text-sellora-gold">₹{val?.toLocaleString()}</span> },
    { key: 'views', label: 'Views', render: (val: number) => val || 0 },
    { key: 'clicks', label: 'Clicks', render: (val: number) => val || 0 },
  ];

  const searchColumns = [
    { key: 'query', label: 'Search Query', render: (val: string) => (
      <div className="flex items-center gap-3">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{val}</span>
      </div>
    )},
    { key: 'created_at', label: 'Time', render: (val: string) => (
      <span className="text-muted-foreground text-sm">{new Date(val).toLocaleString()}</span>
    )},
  ];

  const clickColumns = [
    { key: 'product', label: 'Product', render: (_: any, row: any) => (
      <div className="flex items-center gap-3">
        <MousePointer className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{row.product?.title || 'Unknown'}</span>
      </div>
    )},
    { key: 'created_at', label: 'Time', render: (val: string) => (
      <span className="text-muted-foreground text-sm">{new Date(val).toLocaleString()}</span>
    )},
  ];

  const sellerRequestColumns = [
    { key: 'shop_name', label: 'Shop Name', render: (val: string) => (
      <span className="font-semibold text-foreground">{val}</span>
    )},
    { key: 'owner_name', label: 'Owner', render: (val: string) => (
      <span className="text-muted-foreground">{val}</span>
    )},
    { key: 'email', label: 'Email', render: (val: string) => (
      <span className="text-muted-foreground truncate">{val}</span>
    )},
    { key: 'city', label: 'Location', render: (val: string, row: any) => (
      <span className="text-muted-foreground">{val}, {row.state}</span>
    )},
    { key: 'created_at', label: 'Joined', render: (val: string) => (
      <span className="text-sm text-muted-foreground">{new Date(val).toLocaleDateString()}</span>
    )},
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <LayoutDashboard className="absolute inset-0 m-auto w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      {/* Premium Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Admin <span className="text-gradient">Panel</span>
            </h1>
            <p className="text-muted-foreground">Manage your platform</p>
          </div>
        </div>
      </div>

      {/* Premium Tab Navigation */}
      <div className="mb-8 overflow-x-auto pb-2 animate-fade-in-up stagger-1">
        <div className="flex gap-2 min-w-max">
          {sectionTabs.map((tab, index) => {
            const isActive = activeSection === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id as AdminSection);
                  setSelectedSeller(null);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300
                           ${isActive 
                             ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-button' 
                             : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
                           }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <TabIcon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Overview */}
      {activeSection === 'dashboard' && (
        <div className="space-y-8 animate-fade-in-up stagger-2">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            {statCards.map((card, index) => (
              <StatsCard
                key={card.id}
                label={card.label}
                value={card.value}
                icon={card.icon}
                color={card.color}
                onClick={() => setActiveSection(card.id === 'users' ? 'users' : (card.id as AdminSection))}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-3">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'View Sellers', section: 'sellers', icon: Store },
                  { label: 'View Products', section: 'products', icon: Package },
                  { label: 'Seller Requests', section: 'seller-requests', icon: Sparkles },
                  { label: 'Search Logs', section: 'searches', icon: Search },
                ].map((action) => (
                  <Button
                    key={action.section}
                    variant="outline"
                    onClick={() => setActiveSection(action.section as AdminSection)}
                    className="h-auto py-4 flex-col gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                  >
                    <action.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-4">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-accent" />
                Recent Sellers
              </h3>
              <div className="space-y-3">
                {sellers.slice(0, 3).map((seller, index) => (
                  <div
                    key={seller.id}
                    onClick={() => handleSellerClick(seller)}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-all duration-300 group"
                  >
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {seller.shop_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{seller.owner_name}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
                {sellers.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No sellers yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sellers List */}
      {activeSection === 'sellers' && !selectedSeller && (
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              All <span className="text-gradient">Sellers</span>
            </h2>
            <p className="text-muted-foreground">{sellers.length} registered sellers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sellers.map((seller, index) => (
              <SellerCard key={seller.id} seller={seller} onClick={() => handleSellerClick(seller)} delay={index * 0.05} />
            ))}
          </div>
          {sellers.length === 0 && (
            <div className="text-center py-16 glass-card rounded-2xl">
              <Store className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No sellers registered yet</p>
            </div>
          )}
        </div>
      )}

      {/* Seller Detail */}
      {selectedSeller && (
        <div className="animate-fade-in-up">
          <button
            onClick={() => setSelectedSeller(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Sellers
          </button>

          {/* Seller Info Card */}
          <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{selectedSeller.shop_name}</h2>
                <p className="text-xl text-muted-foreground">{selectedSeller.owner_name}</p>
              </div>
              <div className="flex gap-4">
                <div className="px-6 py-4 rounded-xl bg-primary/10 text-center">
                  <p className="text-3xl font-bold text-primary">{sellerProducts.length}</p>
                  <p className="text-sm text-muted-foreground">Products</p>
                </div>
                <div className="px-6 py-4 rounded-xl bg-accent/10 text-center">
                  <p className="text-3xl font-bold text-accent">
                    {sellerProducts.reduce((sum, p) => sum + (p.views || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Views</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-secondary/50 flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{selectedSeller.phone_number}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground truncate">{selectedSeller.email}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-sellora-gold" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{selectedSeller.city}, {selectedSeller.state}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 flex items-center gap-3">
                <Building className="w-5 h-5 text-sellora-success" />
                <div>
                  <p className="text-xs text-muted-foreground">Business Type</p>
                  <p className="font-medium text-foreground">{selectedSeller.business_type}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Full Address</p>
              <p className="font-medium text-foreground">
                {selectedSeller.address}, {selectedSeller.city}, {selectedSeller.state} - {selectedSeller.pincode}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Joined on {new Date(selectedSeller.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Seller Products */}
          <h3 className="text-xl font-semibold mb-4 text-foreground">
            Products ({sellerProducts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sellerProducts.map((product, index) => (
              <div
                key={product.id}
                className="glass-card p-5 rounded-xl animate-fade-in-up hover:border-primary/30 transition-all duration-300"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <h4 className="font-semibold text-foreground truncate">{product.title}</h4>
                <p className="text-2xl font-bold text-gradient-gold mt-2">₹{product.price.toLocaleString()}</p>
                <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {product.views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointer className="w-4 h-4" /> {product.clicks || 0}
                  </span>
                </div>
              </div>
            ))}
            {sellerProducts.length === 0 && (
              <div className="col-span-full text-center py-12 glass-card rounded-2xl">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No products uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products */}
      {activeSection === 'products' && (
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              All <span className="text-gradient">Products</span>
            </h2>
            <p className="text-muted-foreground">{products.length} products listed</p>
          </div>

          <AnimatedTable columns={productColumns} data={products} />
        </div>
      )}

      {/* Seller Requests (Start Selling on Sellora) */}
      {activeSection === 'seller-requests' && (
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              <span className="text-gradient">Seller Requests</span>
            </h2>
            <p className="text-muted-foreground">Users who completed the seller onboarding form</p>
          </div>

          <div className="glass-card rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
              <div>
                <p className="font-semibold text-foreground">{sellers.length} Total Seller Registrations</p>
                <p className="text-sm text-muted-foreground">Complete seller form data with products & analytics</p>
              </div>
            </div>
          </div>

          <AnimatedTable columns={sellerRequestColumns} data={sellers} />
        </div>
      )}

      {/* Searches */}
      {activeSection === 'searches' && (
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Search <span className="text-gradient">Logs</span>
            </h2>
            <p className="text-muted-foreground">{searchLogs.length} recent searches</p>
          </div>

          <AnimatedTable columns={searchColumns} data={searchLogs} />
        </div>
      )}

      {/* Views / Clicks */}
      {activeSection === 'clicks' && (
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Views & <span className="text-gradient">Clicks</span>
            </h2>
            <p className="text-muted-foreground">{clickLogs.length} recent interactions</p>
          </div>

          <AnimatedTable columns={clickColumns} data={clickLogs} />
        </div>
      )}

      {/* Users */}
      {activeSection === 'users' && (
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              All <span className="text-gradient">Users</span>
            </h2>
            <p className="text-muted-foreground">User management coming soon</p>
          </div>

          <div className="glass-card rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4 animate-float" />
            <p className="text-lg text-muted-foreground mb-2">User management will be available soon</p>
            <p className="text-sm text-muted-foreground/70">
              You'll be able to view all registered users, their activity, and manage roles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
