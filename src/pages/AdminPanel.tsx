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
  Calendar
} from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import SellerCard from '@/components/admin/SellerCard';
import AnimatedTable from '@/components/admin/AnimatedTable';

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

type AdminSection = 'dashboard' | 'users' | 'sellers' | 'products' | 'searches' | 'clicks';

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
    if (activeSection === 'sellers') fetchSellers();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Dashboard */}
      {activeSection === 'dashboard' && (
        <div className="animate-slide-in-right">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">Overview of your platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
        </div>
      )}

      {/* Sellers List */}
      {activeSection === 'sellers' && !selectedSeller && (
        <div className="animate-slide-in-right">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              All <span className="text-gradient">Sellers</span>
            </h1>
            <p className="text-muted-foreground">{sellers.length} registered sellers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sellers.map((seller, index) => (
              <SellerCard key={seller.id} seller={seller} onClick={() => handleSellerClick(seller)} delay={index * 0.05} />
            ))}
          </div>
        </div>
      )}

      {/* Seller Detail */}
      {selectedSeller && (
        <div className="animate-slide-in-right">
          <button
            onClick={() => setSelectedSeller(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Sellers
          </button>

          {/* Seller Info Card */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 mb-8 animate-fade-in-up">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">{selectedSeller.shop_name}</h2>
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
                className="p-5 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 animate-fade-in-up hover:border-primary/30 transition-all duration-300"
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
              <p className="col-span-full text-center py-12 text-muted-foreground">No products uploaded yet</p>
            )}
          </div>
        </div>
      )}

      {/* Products */}
      {activeSection === 'products' && (
        <div className="animate-slide-in-right">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              All <span className="text-gradient">Products</span>
            </h1>
            <p className="text-muted-foreground">{products.length} products listed</p>
          </div>

          <AnimatedTable columns={productColumns} data={products} />
        </div>
      )}

      {/* Searches */}
      {activeSection === 'searches' && (
        <div className="animate-slide-in-right">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Search <span className="text-gradient">Logs</span>
            </h1>
            <p className="text-muted-foreground">{searchLogs.length} recent searches</p>
          </div>

          <AnimatedTable columns={searchColumns} data={searchLogs} />
        </div>
      )}

      {/* Views / Clicks */}
      {activeSection === 'clicks' && (
        <div className="animate-slide-in-right">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Views & <span className="text-gradient">Clicks</span>
            </h1>
            <p className="text-muted-foreground">{clickLogs.length} recent interactions</p>
          </div>

          <AnimatedTable columns={clickColumns} data={clickLogs} />
        </div>
      )}

      {/* Users (placeholder) */}
      {activeSection === 'users' && (
        <div className="animate-slide-in-right">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              All <span className="text-gradient">Users</span>
            </h1>
            <p className="text-muted-foreground">User management coming soon</p>
          </div>

          <div className="p-12 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 text-center">
            <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4 animate-float" />
            <p className="text-muted-foreground">User management will be available soon</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

