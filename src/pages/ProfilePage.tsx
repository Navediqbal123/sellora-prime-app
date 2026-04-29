import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  ShoppingBag,
  Heart,
  Star,
  Ticket,
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
} from 'lucide-react';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string; email?: string } | null>(null);
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, reviews: 0, coupons: 0 });
  const [orderCounts, setOrderCounts] = useState({ pending: 0, shipped: 0, delivered: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);

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

  const menuItems = [
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
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Header card */}
        <div className="card-premium p-6 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-[hsl(280,80%,50%)] flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-glow overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">
                {loading ? 'Loading...' : fullName}
              </h1>
              <p className="text-sm text-muted-foreground truncate">{email}</p>
            </div>
          </div>
          <Button className="btn-glow w-full mt-5 h-11" onClick={() => navigate('/profile/edit')}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mt-4 animate-fade-in-up stagger-1">
          {statItems.map((s) => (
            <div
              key={s.label}
              className="card-premium p-3 flex flex-col items-center justify-center text-center"
            >
              <s.icon className="w-5 h-5 text-primary mb-1.5" />
              <span className="text-lg font-bold text-foreground leading-none">{s.value}</span>
              <span className="text-[11px] text-muted-foreground mt-1">{s.label}</span>
            </div>
          ))}
        </div>

        {/* My Orders */}
        <div className="card-premium p-5 mt-4 animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">My Orders</h2>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs text-primary font-medium hover:underline"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {orderStatuses.map((o) => (
              <button
                key={o.label}
                onClick={() => navigate('/orders')}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
                    <o.icon className={`w-5 h-5 ${o.color}`} />
                  </div>
                  {o.count > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                      {o.count}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground mt-1.5">{o.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu list */}
        <div className="card-premium mt-4 overflow-hidden animate-fade-in-up stagger-3">
          {menuItems.map((item, idx) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors active:bg-secondary/80 hover:bg-secondary/40 ${
                idx !== menuItems.length - 1 ? 'border-b border-border/50' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  item.danger ? 'bg-destructive/10' : 'bg-primary/10'
                }`}
              >
                <item.icon
                  className={`w-4.5 h-4.5 ${item.danger ? 'text-destructive' : 'text-primary'}`}
                  size={18}
                />
              </div>
              <span
                className={`flex-1 text-sm font-medium ${
                  item.danger ? 'text-destructive' : 'text-foreground'
                }`}
              >
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;