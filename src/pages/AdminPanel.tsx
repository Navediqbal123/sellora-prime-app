import React, { useState, useEffect } from 'react';
import { supabase, SellerProfile, Product, SellerStatus, Profile } from '@/lib/supabase';
import { adminApi } from '@/lib/api';
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
  Clock,
  Shield,
  ShieldOff,
  Loader2,
  Check
} from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import SellerCard from '@/components/admin/SellerCard';
import AnimatedTable from '@/components/admin/AnimatedTable';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

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

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  seller?: SellerProfile;
}

// Seller Requests list is sourced from `seller` table (single source of truth)
interface SellerRequestRow {
  user_id: string;
  shop_name: string;
  owner_name: string;
  phone?: string;
  city: string;
  state: string;
  pincode: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
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

  // Seller Requests page (pending only) — sourced from `seller` table
  const [pendingSellerRequests, setPendingSellerRequests] = useState<SellerRequestRow[]>([]);
  const [removingSellerRequests, setRemovingSellerRequests] = useState<Record<string, boolean>>({});

  const [products, setProducts] = useState<Product[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [clickLogs, setClickLogs] = useState<ClickLog[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [togglingUser, setTogglingUser] = useState<string | null>(null);
  
  // Action states for buttons
  const [actionLoading, setActionLoading] = useState<{ [key: string]: 'approve' | 'reject' | 'block' | 'unblock' | null }>({});
  const [actionSuccess, setActionSuccess] = useState<{ [key: string]: 'approve' | 'reject' | 'block' | 'unblock' | null }>({});
  const [actionError, setActionError] = useState<{ [key: string]: boolean }>({});
  
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
    if (activeSection === 'sellers') fetchSellers();
    if (activeSection === 'seller-requests') fetchPendingSellerRequests();
    if (activeSection === 'products') fetchProducts();
    if (activeSection === 'searches') fetchSearchLogs();
    if (activeSection === 'clicks') fetchClickLogs();
    if (activeSection === 'users') fetchUsers();
  }, [activeSection]);

  const fetchUsers = async () => {
    try {
      // Try fetching from profiles first
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Get sellers for each user
      const { data: sellersData } = await supabase.from('sellers').select('*');

      // Get user_roles for role info
      const { data: rolesData } = await supabase.from('user_roles').select('user_id, role');

      if (!profilesError && profilesData && profilesData.length > 0) {
        const usersWithSellers = profilesData.map((profile) => ({
          ...profile,
          is_active: profile.is_active !== false,
          seller: sellersData?.find((s) => s.user_id === profile.id),
          userRole: rolesData?.find((r) => r.user_id === profile.id)?.role || 'user',
        }));
        setUsers(usersWithSellers);
      } else {
        // Fallback: build user list from user_roles table
        if (rolesData && rolesData.length > 0) {
          const uniqueUserIds = [...new Set(rolesData.map((r) => r.user_id))];
          const usersFromRoles = uniqueUserIds.map((uid) => {
            const roleRow = rolesData.find((r) => r.user_id === uid);
            const sellerRow = sellersData?.find((s) => s.user_id === uid);
            return {
              id: uid,
              email: sellerRow?.email || 'N/A',
              full_name: sellerRow?.owner_name || '—',
              is_active: true,
              created_at: sellerRow?.created_at || new Date().toISOString(),
              seller: sellerRow,
              userRole: roleRow?.role || 'user',
            };
          });
          setUsers(usersFromRoles as any);
        } else {
          setUsers([]);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const handleToggleUserBan = async (userId: string, currentStatus: boolean) => {
    setTogglingUser(userId);
    
    try {
      const newStatus = !currentStatus;
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_active: newStatus } : u
      ));

      toast({
        title: newStatus ? "User Unbanned" : "User Banned",
        description: newStatus 
          ? "User can now access the platform" 
          : "User has been blocked from accessing the platform"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive"
      });
    } finally {
      setTogglingUser(null);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [sellersRes, productsRes, searchesRes, pendingRes] = await Promise.all([
        supabase.from('sellers').select('id, status', { count: 'exact' }),
        supabase.from('products').select('id, views', { count: 'exact' }),
        supabase.from('search_logs').select('id', { count: 'exact', head: true }),
        // Pending requests must come from `seller` table
        supabase.from('seller').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
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

  const fetchPendingSellerRequests = async () => {
    const { data, error } = await supabase
      .from('seller')
      .select('user_id, shop_name, owner_name, phone, city, state, pincode, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending seller requests:', error);
      setPendingSellerRequests([]);
      return;
    }

    setPendingSellerRequests((data || []) as SellerRequestRow[]);
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

  // Helper to handle action with animation states
  const withActionAnimation = async (
    sellerId: string, 
    actionType: 'approve' | 'reject' | 'block' | 'unblock',
    action: () => Promise<void>
  ) => {
    setActionLoading(prev => ({ ...prev, [sellerId]: actionType }));
    setActionError(prev => ({ ...prev, [sellerId]: false }));
    setActionSuccess(prev => ({ ...prev, [sellerId]: null }));

    try {
      await action();
      setActionSuccess(prev => ({ ...prev, [sellerId]: actionType }));
      
      // Clear success state and update lists after animation
      setTimeout(() => {
        setActionSuccess(prev => ({ ...prev, [sellerId]: null }));
        if (activeSection === 'seller-requests') {
          fetchPendingSellerRequests();
        } else {
          fetchSellers();
        }
        fetchStats();
      }, 800);
    } catch (error) {
      setActionError(prev => ({ ...prev, [sellerId]: true }));
      setTimeout(() => {
        setActionError(prev => ({ ...prev, [sellerId]: false }));
      }, 600);
      throw error;
    } finally {
      setActionLoading(prev => ({ ...prev, [sellerId]: null }));
    }
  };

  // Admin Actions for Sellers with animations - using backend API
  const handleApproveSeller = async (sellerId: string) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller?.user_id) {
      toast({ title: "Error", description: "Seller user_id not found", variant: "destructive" });
      return;
    }

    await withActionAnimation(sellerId, 'approve', async () => {
      try {
        // Call backend API with user_id
        await adminApi.approveSeller(seller.user_id);
        
        // Immediately remove from pending list (smooth slide-out)
        setPendingSellers(prev => prev.filter(s => s.id !== sellerId));
        
        toast({ 
          title: "✓ Seller Approved!", 
          description: "The seller can now access their dashboard" 
        });
      } catch (error: any) {
        // Fallback to direct Supabase update if API fails
        const { error: dbError } = await supabase
          .from('sellers')
          .update({ status: 'approved' })
          .eq('id', sellerId);

        if (dbError) throw dbError;

        // Add shopkeeper role
        await supabase
          .from('user_roles')
          .upsert({ user_id: seller.user_id, role: 'shopkeeper' }, { onConflict: 'user_id' });

        setPendingSellers(prev => prev.filter(s => s.id !== sellerId));
        
        toast({ 
          title: "✓ Seller Approved!", 
          description: "The seller can now access their dashboard" 
        });
      }
    });
  };

  const handleRejectSeller = async (sellerId: string, reason?: string) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller?.user_id) {
      toast({ title: "Error", description: "Seller user_id not found", variant: "destructive" });
      return;
    }

    await withActionAnimation(sellerId, 'reject', async () => {
      try {
        // Call backend API with user_id
        await adminApi.rejectSeller(seller.user_id);
        
        // Immediately remove from pending list
        setPendingSellers(prev => prev.filter(s => s.id !== sellerId));
        
        toast({ title: "Seller Rejected", description: "The seller request has been rejected" });
      } catch (error: any) {
        // Fallback to direct Supabase update
        const { error: dbError } = await supabase
          .from('sellers')
          .update({ status: 'rejected', rejection_reason: reason || 'Application rejected by admin' })
          .eq('id', sellerId);

        if (dbError) throw dbError;
        
        setPendingSellers(prev => prev.filter(s => s.id !== sellerId));
        
        toast({ title: "Seller Rejected", description: "The seller request has been rejected" });
      }
    });
  };

  // Seller Requests actions (uses `seller.user_id` as the stable identifier)
  const handleApproveSellerRequest = async (userId: string) => {
    await withActionAnimation(userId, 'approve', async () => {
      await adminApi.approveSeller(userId);

      // Ensure single source of truth is updated
      await supabase.from('seller').update({ status: 'approved' }).eq('user_id', userId);

      // Smooth exit then remove from local state (no page reload)
      setRemovingSellerRequests(prev => ({ ...prev, [userId]: true }));
      setTimeout(() => {
        setPendingSellerRequests(prev => prev.filter(s => s.user_id !== userId));
        setRemovingSellerRequests(prev => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }, 250);

      toast({ title: "Seller approved" });
    });
  };

  const handleRejectSellerRequest = async (userId: string) => {
    await withActionAnimation(userId, 'reject', async () => {
      await adminApi.rejectSeller(userId);

      // Ensure single source of truth is updated
      await supabase.from('seller').update({ status: 'rejected' }).eq('user_id', userId);

      setRemovingSellerRequests(prev => ({ ...prev, [userId]: true }));
      setTimeout(() => {
        setPendingSellerRequests(prev => prev.filter(s => s.user_id !== userId));
        setRemovingSellerRequests(prev => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }, 250);

      toast({ title: "Seller request rejected" });
    });
  };

  const handleBlockSeller = async (sellerId: string) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller?.user_id) {
      toast({ title: "Error", description: "Seller user_id not found", variant: "destructive" });
      return;
    }

    await withActionAnimation(sellerId, 'block', async () => {
      try {
        await adminApi.blockSeller(seller.user_id);
        toast({ title: "Seller Blocked", description: "The seller's account has been blocked" });
      } catch (error: any) {
        // Fallback
        const { error: dbError } = await supabase
          .from('sellers')
          .update({ status: 'blocked', rejection_reason: 'Account blocked by admin' })
          .eq('id', sellerId);

        if (dbError) throw dbError;
        toast({ title: "Seller Blocked", description: "The seller's account has been blocked" });
      }
    });
  };

  const handleUnblockSeller = async (sellerId: string) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller?.user_id) {
      toast({ title: "Error", description: "Seller user_id not found", variant: "destructive" });
      return;
    }

    await withActionAnimation(sellerId, 'unblock', async () => {
      try {
        await adminApi.unblockSeller(seller.user_id);
        toast({ title: "Seller Unblocked", description: "The seller can now access their dashboard" });
      } catch (error: any) {
        // Fallback
        const { error: dbError } = await supabase
          .from('sellers')
          .update({ status: 'approved', rejection_reason: null })
          .eq('id', sellerId);

        if (dbError) throw dbError;
        toast({ title: "Seller Unblocked", description: "The seller can now access their dashboard" });
      }
    });
  };

  // Get button state classes
  const getButtonState = (sellerId: string, actionType: 'approve' | 'reject' | 'block' | 'unblock') => {
    const isLoading = actionLoading[sellerId] === actionType;
    const isSuccess = actionSuccess[sellerId] === actionType;
    const isError = actionError[sellerId];
    
    return { isLoading, isSuccess, isError };
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

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined on {new Date(selectedSeller.created_at).toLocaleDateString()}</span>
                {getStatusBadge(selectedSeller.status)}
              </div>
              
              {/* Admin Actions */}
              <div className="flex items-center gap-3">
                {selectedSeller.status === 'approved' && (() => {
                  const blockState = getButtonState(selectedSeller.id, 'block');
                  return (
                    <Button
                      onClick={() => handleBlockSeller(selectedSeller.id)}
                      disabled={blockState.isLoading || blockState.isSuccess}
                      variant="outline"
                      className={`transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                        ${blockState.isSuccess 
                          ? 'border-red-500 bg-red-500/20 text-red-500' 
                          : blockState.isError 
                            ? 'animate-[shake_0.3s_ease-in-out]' 
                            : 'border-red-500/50 text-red-500 hover:bg-red-500/10'
                        }`}
                    >
                      {blockState.isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Blocking...
                        </>
                      ) : blockState.isSuccess ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Blocked
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4 mr-2" />
                          Block Seller
                        </>
                      )}
                    </Button>
                  );
                })()}
                {selectedSeller.status === 'blocked' && (() => {
                  const unblockState = getButtonState(selectedSeller.id, 'unblock');
                  return (
                    <Button
                      onClick={() => handleUnblockSeller(selectedSeller.id)}
                      disabled={unblockState.isLoading || unblockState.isSuccess}
                      variant="outline"
                      className={`transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                        ${unblockState.isSuccess 
                          ? 'border-green-500 bg-green-500/20 text-green-500' 
                          : unblockState.isError 
                            ? 'animate-[shake_0.3s_ease-in-out]' 
                            : 'border-green-500/50 text-green-500 hover:bg-green-500/10'
                        }`}
                    >
                      {unblockState.isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Unblocking...
                        </>
                      ) : unblockState.isSuccess ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Unblocked
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4 mr-2" />
                          Unblock Seller
                        </>
                      )}
                    </Button>
                  );
                })()}
                <Button
                  onClick={() => handleDeleteSeller(selectedSeller.id)}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
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
                <p className="font-semibold text-foreground">{pendingSellerRequests.length} Pending Applications</p>
                <p className="text-sm text-muted-foreground">Sellers waiting for your approval</p>
              </div>
            </div>
          </div>

          {pendingSellerRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingSellerRequests.map((seller, index) => {
                const approveState = getButtonState(seller.user_id, 'approve');
                const rejectState = getButtonState(seller.user_id, 'reject');
                const isRemoving = !!removingSellerRequests[seller.user_id];

                return (
                  <div
                    key={seller.user_id}
                    className={
                      "glass-card rounded-2xl p-6 animate-fade-in-up hover:border-primary/30 transition-all duration-300 " +
                      (isRemoving ? "opacity-0 translate-y-1 pointer-events-none" : "")
                    }
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{seller.shop_name}</h3>
                          {getStatusBadge(seller.status as SellerStatus)}
                        </div>
                        <p className="text-muted-foreground mb-3">{seller.owner_name}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{seller.phone || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{seller.city}, {seller.state} • {seller.pincode}</span>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mt-3">
                          Applied on {new Date(seller.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2 lg:flex-col">
                        <Button
                          onClick={() => handleApproveSellerRequest(seller.user_id)}
                          disabled={approveState.isLoading || approveState.isSuccess}
                          className={`flex-1 min-w-[120px] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                            ${approveState.isSuccess 
                              ? 'bg-green-500 hover:bg-green-500' 
                              : approveState.isError 
                                ? 'bg-red-500 animate-[shake_0.3s_ease-in-out]' 
                                : 'bg-green-600 hover:bg-green-700'
                            } text-white`}
                        >
                          {approveState.isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Approving...
                            </>
                          ) : approveState.isSuccess ? (
                            <>
                              <Check className="w-4 h-4 mr-2 animate-[scale-in_0.2s_ease-out]" />
                              Approved!
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => handleRejectSellerRequest(seller.user_id)}
                          disabled={rejectState.isLoading || rejectState.isSuccess}
                          variant="outline"
                          className={`flex-1 min-w-[120px] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                            ${rejectState.isSuccess 
                              ? 'border-red-500 bg-red-500/20 text-red-500' 
                              : rejectState.isError 
                                ? 'animate-[shake_0.3s_ease-in-out]' 
                                : 'border-red-500/50 text-red-500 hover:bg-red-500/10'
                            }`}
                        >
                          {rejectState.isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Rejecting...
                            </>
                          ) : rejectState.isSuccess ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Rejected
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
            <p className="text-muted-foreground">{users.length} registered users</p>
          </div>

          {users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className="glass-card rounded-2xl p-5 animate-fade-in-up hover:border-primary/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 
                                       flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {user.full_name || 'Unnamed User'}
                          </h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        {/* Status Badge */}
                        {user.is_active ? (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-500 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-500 flex items-center gap-1">
                            <ShieldOff className="w-3 h-3" />
                            BANNED
                          </span>
                        )}
                        {/* Role Badge */}
                        {(user as any).userRole && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            (user as any).userRole === 'admin' 
                              ? 'bg-purple-500/20 text-purple-400' 
                              : (user as any).userRole === 'shopkeeper'
                                ? 'bg-accent/20 text-accent'
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            {(user as any).userRole}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </span>
                        {user.seller && (
                          <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs">
                            Seller: {user.seller.shop_name}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Ban/Unban Toggle */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground">
                          {user.is_active ? 'Active' : 'Banned'}
                        </span>
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() => handleToggleUserBan(user.id, user.is_active)}
                          disabled={togglingUser === user.id}
                          className={`${user.is_active ? 'data-[state=checked]:bg-green-500' : 'data-[state=unchecked]:bg-red-500/50'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4 animate-float" />
              <p className="text-lg text-muted-foreground mb-2">No users found</p>
              <p className="text-sm text-muted-foreground/70">
                Users will appear here once they register.
              </p>
            </div>
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
