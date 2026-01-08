import React, { useState, useEffect } from 'react';
import { supabase, SellerProfile, Product, SellerStatus } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  Store, 
  Package, 
  Search, 
  Eye, 
  MousePointer,
  ArrowLeft,
  Phone,
  MapPin,
  Mail,
  Building,
  Calendar,
  TrendingUp,
  Sparkles,
  LayoutDashboard,
  ChevronRight,
  Menu,
  CheckCircle,
  XCircle,
  Ban,
  Unlock,
  Trash2,
  Clock
} from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import SellerCard from '@/components/admin/SellerCard';
import AnimatedTable from '@/components/admin/AnimatedTable';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';

interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalSearches: number;
  totalViews: number;
  pendingRequests: number;
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

const AdminPanel = ({ section = 'dashboard' }: { section?: AdminSection }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalSearches: 0,
    totalViews: 0,
    pendingRequests: 0
  });
  const [activeSection, setActiveSection] = useState<AdminSection>(section);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [pendingSellers, setPendingSellers] = useState<SellerProfile[]>([]);
  const [approvedSellers, setApprovedSellers] = useState<SellerProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [clickLogs, setClickLogs] = useState<ClickLog[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      const [sellersRes, productsRes, searchesRes, pendingRes] = await Promise.all([
        supabase.from('sellers').select('id, status', { count: 'exact' }),
        supabase.from('products').select('id, views', { count: 'exact' }),
        supabase.from('search_logs').select('id', { count: 'exact', head: true }),
        supabase.from('sellers').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      const totalViews = productsRes.data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
      const approvedCount = sellersRes.data?.filter(s => s.status === 'approved').length || 0;

      setStats({
        totalUsers: sellersRes.count || 0,
        totalSellers: approvedCount,
        totalProducts: productsRes.count || 0,
        totalSearches: searchesRes.count || 0,
        totalViews,
        pendingRequests: pendingRes.count || 0
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
    
    const allSellers = data || [];
    setSellers(allSellers);
    setPendingSellers(allSellers.filter(s => s.status === 'pending'));
    setApprovedSellers(allSellers.filter(s => s.status === 'approved' || s.status === 'blocked'));
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

  // Admin Actions for Sellers
  const handleApproveSeller = async (sellerId: string) => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update({ status: 'approved' })
        .eq('id', sellerId);

      if (error) throw error;

      // Also add shopkeeper role to user_roles table
      const seller = sellers.find(s => s.id === sellerId);
      if (seller) {
        await supabase
          .from('user_roles')
          .upsert({ user_id: seller.user_id, role: 'shopkeeper' }, { onConflict: 'user_id' });
      }

      toast({ title: "Seller Approved!", description: "The seller can now access their dashboard" });
      fetchSellers();
      fetchStats();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRejectSeller = async (sellerId: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update({ status: 'rejected', rejection_reason: reason || 'Application rejected by admin' })
        .eq('id', sellerId);

      if (error) throw error;
      toast({ title: "Seller Rejected", description: "The seller has been notified" });
      fetchSellers();
      fetchStats();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleBlockSeller = async (sellerId: string) => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update({ status: 'blocked', rejection_reason: 'Account blocked by admin' })
        .eq('id', sellerId);

      if (error) throw error;
      toast({ title: "Seller Blocked", description: "The seller's account has been blocked" });
      fetchSellers();
      fetchStats();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleUnblockSeller = async (sellerId: string) => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update({ status: 'approved', rejection_reason: null })
        .eq('id', sellerId);

      if (error) throw error;
      toast({ title: "Seller Unblocked", description: "The seller can now access their dashboard" });
      fetchSellers();
      fetchStats();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteSeller = async (sellerId: string) => {
    if (!confirm('Are you sure you want to delete this seller? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('sellers')
        .delete()
        .eq('id', sellerId);

      if (error) throw error;
      toast({ title: "Seller Deleted", description: "The seller has been removed" });
      setSelectedSeller(null);
      fetchSellers();
      fetchStats();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: SellerStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-500">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-500">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-500">Rejected</span>;
      case 'blocked':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-500">Blocked</span>;
      default:
        return null;
    }
  };

  const statCards = [
    { id: 'seller-requests', label: 'Pending Requests', value: stats.pendingRequests, icon: Clock, color: 'warning' as const },
    { id: 'sellers', label: 'Approved Sellers', value: stats.totalSellers, icon: Store, color: 'accent' as const },
    { id: 'products', label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'gold' as const },
    { id: 'searches', label: 'Total Searches', value: stats.totalSearches, icon: Search, color: 'primary' as const },
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
      <div className="flex min-h-screen">
        {/* Admin Sidebar */}
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section as AdminSection);
            setSelectedSeller(null);
          }}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        
        {/* Content Area */}
        <div className={`flex-1 transition-all duration-260 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
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
        </div>
      </div>
    );
  }

  // Get section title for header
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard': return { title: 'Overview', subtitle: 'Dashboard analytics & insights' };
      case 'users': return { title: 'Users', subtitle: 'Manage all platform users' };
      case 'sellers': return { title: 'Sellers', subtitle: 'View all registered sellers' };
      case 'products': return { title: 'Products', subtitle: 'All products on the platform' };
      case 'seller-requests': return { title: 'Seller Requests', subtitle: 'New seller registrations' };
      case 'searches': return { title: 'Search Logs', subtitle: 'User search analytics' };
      case 'clicks': return { title: 'Views & Clicks', subtitle: 'Product interaction data' };
      default: return { title: 'Admin', subtitle: 'Panel' };
    }
  };

  const { title, subtitle } = getSectionTitle();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section as AdminSection);
          setSelectedSeller(null);
        }}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-260 ease-[cubic-bezier(0.4,0,0.2,1)]
                      ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        
        {/* Mobile Header with Hamburger */}
        <header className="md:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-4 px-4 h-16">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-card hover:bg-primary/10 transition-all duration-180 group"
            >
              <Menu className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">{title}</h1>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-4 md:p-8">
          {/* Desktop Header */}
          <div className="hidden md:block mb-8 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 
                              flex items-center justify-center shadow-glow">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {title} <span className="text-gradient">Panel</span>
                </h1>
                <p className="text-muted-foreground">{subtitle}</p>
              </div>
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

      {/* Seller Requests (Pending) */}
      {activeSection === 'seller-requests' && (
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              <span className="text-gradient">Pending Seller Requests</span>
            </h2>
            <p className="text-muted-foreground">Review and approve new seller applications</p>
          </div>

          <div className="glass-card rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <Clock className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="font-semibold text-foreground">{pendingSellers.length} Pending Applications</p>
                <p className="text-sm text-muted-foreground">Sellers waiting for your approval</p>
              </div>
            </div>
          </div>

          {pendingSellers.length > 0 ? (
            <div className="space-y-4">
              {pendingSellers.map((seller, index) => (
                <div
                  key={seller.id}
                  className="glass-card rounded-2xl p-6 animate-fade-in-up hover:border-primary/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{seller.shop_name}</h3>
                        {getStatusBadge(seller.status)}
                      </div>
                      <p className="text-muted-foreground mb-3">{seller.owner_name} • {seller.business_type}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{seller.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{seller.phone_number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{seller.city}, {seller.state}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-3">
                        Applied on {new Date(seller.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 lg:flex-col">
                      <Button
                        onClick={() => handleApproveSeller(seller.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectSeller(seller.id)}
                        variant="outline"
                        className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500/30 mx-auto mb-4 animate-float" />
              <p className="text-lg text-muted-foreground mb-2">No pending requests</p>
              <p className="text-sm text-muted-foreground/70">
                All seller applications have been reviewed.
              </p>
            </div>
          )}
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
      </div>
    </div>
  );
};

export default AdminPanel;
