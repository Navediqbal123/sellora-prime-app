import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import {
  ShoppingBag,
  Heart,
  Star,
  TicketPercent,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Pencil,
  Store,
  LayoutDashboard,
  Camera,
} from 'lucide-react';

const PURPLE = '#7C3AED';
const CARD_SHADOW =
  '0 1px 2px rgba(15,15,25,0.04), 0 8px 24px -12px rgba(15,15,25,0.08)';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string; email?: string } | null>(null);
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, reviews: 0, coupons: 0 });
  const [orderCounts, setOrderCounts] = useState({ pending: 0, shipped: 0, delivered: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [sellerStatus, setSellerStatus] = useState<string | null>(null);
  const [hasSellerApp, setHasSellerApp] = useState(false);

  const fullName =
    profile?.full_name ||
    (user?.user_metadata as any)?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'Guest');
  const email = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatar_url || (user?.user_metadata as any)?.avatar_url;

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      const [profileRes, ordersCountRes, wishlistRes, reviewsRes, ordersListRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('buyer_id', user.id),
        supabase.from('wishlists').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('orders').select('status').eq('buyer_id', user.id),
      ]);
      if (profileRes.data) setProfile(profileRes.data as any);
      const sellerRes = await supabase
        .from('sellers')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();
      if (sellerRes.data) {
        setHasSellerApp(true);
        setSellerStatus((sellerRes.data as any).status);
      } else {
        setHasSellerApp(false);
        setSellerStatus(null);
      }
      setStats({
        orders: ordersCountRes.count || 0,
        wishlist: wishlistRes.count || 0,
        reviews: reviewsRes.count || 0,
        coupons: 0,
      });
      const list = (ordersListRes.data || []) as { status: string }[];
      setOrderCounts({
        pending: list.filter((o) => o.status === 'pending').length,
        shipped: list.filter((o) => o.status === 'ready').length,
        delivered: list.filter((o) => o.status === 'completed').length,
        cancelled: list.filter((o) => o.status === 'cancelled').length,
      });
      setLoading(false);
    })();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: 'Signed out', description: 'You have been logged out successfully.' });
      navigate('/login', { replace: true });
    } catch (e: any) {
      toast({ title: 'Sign out failed', description: e?.message || 'Please try again.', variant: 'destructive' });
    }
  };

  const statItems = [
    { icon: ShoppingBag, label: 'Orders', value: stats.orders },
    { icon: Heart, label: 'Wishlist', value: stats.wishlist },
    { icon: Star, label: 'Reviews', value: stats.reviews },
    { icon: Ticket, label: 'Coupons', value: stats.coupons },
  ];

  const orderStatuses = [
    { icon: Clock, label: 'Pending', count: orderCounts.pending, color: 'text-amber-400' },
    { icon: Truck, label: 'Shipped', count: orderCounts.shipped, color: 'text-blue-400' },
    { icon: PackageCheck, label: 'Delivered', count: orderCounts.delivered, color: 'text-emerald-400' },
    { icon: XCircle, label: 'Cancelled', count: orderCounts.cancelled, color: 'text-rose-400' },
  ];

  const isApprovedSeller = sellerStatus === 'approved';
  const isPendingSeller = hasSellerApp && !isApprovedSeller;

  const sellerItem = isApprovedSeller
    ? { icon: LayoutDashboard, label: 'Seller Dashboard', onClick: () => navigate('/seller') }
    : isPendingSeller
    ? {
        icon: Store,
        label: 'Sell on Sellora',
        badge: 'Pending',
        onClick: () =>
          toast({
            title: 'Application under review',
            description: 'Your seller application is being reviewed by our team.',
          }),
      }
    : { icon: Store, label: 'Sell on Sellora', onClick: () => navigate('/seller/onboarding') };

  const menuItems: Array<{ icon: any; label: string; onClick: () => void; danger?: boolean; badge?: string }> = [
    sellerItem,
    { icon: MapPin, label: 'My Addresses', onClick: () => navigate('/profile/addresses') },
    { icon: CreditCard, label: 'Payment Methods', onClick: () => navigate('/profile/payment-methods') },
    { icon: Ticket, label: 'My Coupons', onClick: () => navigate('/profile/coupons') },
    { icon: Bell, label: 'Notifications', onClick: () => navigate('/profile/notifications') },
    { icon: HelpCircle, label: 'Help Center', onClick: () => navigate('/profile/help') },
    { icon: LogOut, label: 'Logout', onClick: handleLogout, danger: true },
  ];

  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: '#FFFFFF', color: '#111111' }}>
      <div className="max-w-2xl mx-auto px-5 pt-6">
        {/* Header */}
        <div className="mb-5 animate-fade-in-up">
          <h1 className="text-[28px] font-bold tracking-tight" style={{ color: '#111111' }}>
            Profile
          </h1>
          <p className="text-[14px] mt-1" style={{ color: '#6B7280' }}>
            Manage your profile and preferences
          </p>
        </div>

        {/* Profile card */}
        <div
          className="rounded-[24px] p-5 animate-fade-in-up"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFF3', boxShadow: CARD_SHADOW }}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="w-[76px] h-[76px] rounded-full flex items-center justify-center text-xl font-bold overflow-hidden"
                style={{ backgroundColor: '#F3F4F6', color: '#111111' }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <button
                onClick={() => navigate('/profile/edit')}
                aria-label="Change photo"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEE', boxShadow: '0 4px 10px rgba(15,15,25,0.08)' }}
              >
                <Camera size={14} style={{ color: '#111111' }} strokeWidth={2} />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[19px] font-bold truncate" style={{ color: '#111111' }}>
                {loading ? 'Loading...' : fullName}
              </h2>
              <p className="text-[13.5px] truncate mt-0.5" style={{ color: '#6B7280' }}>
                {email}
              </p>
              <button
                onClick={() => navigate('/profile/edit')}
                className="mt-3 inline-flex items-center gap-1.5 px-4 h-9 rounded-full text-[13px] font-semibold transition-all active:scale-[0.97]"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', color: '#111111' }}
              >
                <Pencil size={14} strokeWidth={2.25} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4 animate-fade-in-up stagger-1">
          {statItems.map((s) => (
            <div
              key={s.label}
              className="rounded-[20px] p-3 flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFF3', boxShadow: CARD_SHADOW }}
            >
              <s.icon size={22} strokeWidth={1.75} style={{ color: '#111111' }} />
              <span className="text-[20px] font-bold leading-none mt-2" style={{ color: '#111111' }}>
                {s.value}
              </span>
              <span className="text-[11.5px] mt-1" style={{ color: '#6B7280' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* My Orders */}
        <div
          className="rounded-[24px] p-5 mt-4 animate-fade-in-up stagger-2"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFF3', boxShadow: CARD_SHADOW }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold" style={{ color: '#111111' }}>
              My Orders
            </h3>
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-0.5 text-[12.5px] font-semibold"
              style={{ color: '#6B7280' }}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {orderStatuses.map((o) => (
              <button
                key={o.label}
                onClick={() => navigate('/orders')}
                className="flex flex-col items-center p-2 rounded-xl transition-all active:scale-[0.96]"
              >
                <div className="relative">
                  <o.icon size={26} strokeWidth={1.75} style={{ color: '#111111' }} />
                  {o.count > 0 && (
                    <span
                      className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: PURPLE, color: '#FFFFFF' }}
                    >
                      {o.count}
                    </span>
                  )}
                </div>
                <span className="text-[11.5px] mt-2" style={{ color: '#6B7280' }}>
                  {o.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div
          className="rounded-[24px] mt-4 overflow-hidden animate-fade-in-up stagger-3"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFF3', boxShadow: CARD_SHADOW }}
        >
          {menuItems.map((item, idx) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors active:bg-black/[0.03]"
              style={{
                borderBottom: idx !== menuItems.length - 1 ? '1px solid #F1F1F4' : 'none',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#F5F5F7' }}
              >
                <item.icon
                  size={19}
                  strokeWidth={2}
                  style={{ color: item.danger ? '#DC2626' : '#111111' }}
                />
              </div>
              <span
                className="flex-1 text-[14.5px] font-semibold flex items-center gap-2"
                style={{ color: item.danger ? '#DC2626' : '#111111' }}
              >
                {item.label}
                {item.badge && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}
                  >
                    {item.badge}
                  </span>
                )}
              </span>
              <ChevronRight size={16} style={{ color: '#9CA3AF' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;