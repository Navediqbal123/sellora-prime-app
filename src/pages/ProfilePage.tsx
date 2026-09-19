import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import BottomNav from '@/components/home/BottomNav';
import { Button } from '@/components/ui/button';
import profileMascot from '@/assets/profile-shopping-mascot.png';
import {
  Bell,
  Camera,
  Check,
  ChevronRight,
  CircleHelp,
  Crown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Settings,
  ShoppingBag,
  Star,
  Store,
  TicketPercent,
  WalletCards,
} from 'lucide-react';

type ClayTone = 'purple' | 'pink' | 'orange' | 'blue' | 'gold' | 'cyan' | 'red';

const ClayIcon: React.FC<{
  icon: React.ElementType;
  tone: ClayTone;
  size?: 'sm' | 'md' | 'lg';
}> = ({ icon: Icon, tone, size = 'md' }) => (
  <span className={`profile-clay-icon profile-clay-icon--${tone} profile-clay-icon--${size}`} aria-hidden="true">
    <span className="profile-clay-icon__shine" />
    <Icon className="profile-clay-icon__glyph" strokeWidth={2.8} />
  </span>
);

const ProfilePage = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string; email?: string } | null>(null);
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, reviews: 0, coupons: 0 });
  const [loading, setLoading] = useState(true);
  const [sellerStatus, setSellerStatus] = useState<string | null>(null);
  const [hasSellerApp, setHasSellerApp] = useState(false);

  const fullName =
    profile?.full_name ||
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'Guest');
  const email = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatar_url || (user?.user_metadata as { avatar_url?: string } | undefined)?.avatar_url;

  const loadData = React.useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [profileRes, ordersCountRes, wishlistRes, reviewsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('buyer_id', user.id),
      supabase.from('wishlists').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);
    if (profileRes.data) setProfile(profileRes.data as typeof profile);
    const sellerRes = await supabase.from('sellers').select('status').eq('user_id', user.id).maybeSingle();
    if (sellerRes.data) {
      setHasSellerApp(true);
      setSellerStatus((sellerRes.data as { status?: string }).status || null);
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
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    loadData();

    const channel = supabase
      .channel(`profile-summary-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `buyer_id=eq.${user.id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlists', filter: `user_id=eq.${user.id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `user_id=eq.${user.id}` }, loadData)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadData]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: 'Signed out', description: 'You have been logged out successfully.' });
      navigate('/login', { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      toast({ title: 'Sign out failed', description: message, variant: 'destructive' });
    }
  };

  const isApprovedSeller = sellerStatus === 'approved';
  const isPendingSeller = hasSellerApp && !isApprovedSeller;
  const sellerItem = isApprovedSeller
    ? {
        icon: LayoutDashboard,
        tone: 'purple' as ClayTone,
        label: 'Seller Dashboard',
        subtitle: 'Manage your store',
        onClick: () => navigate('/seller'),
      }
    : isPendingSeller
      ? {
          icon: Store,
          tone: 'purple' as ClayTone,
          label: 'Sell on Sellora',
          subtitle: 'Application under review',
          badge: 'Pending',
          onClick: () => toast({ title: 'Application under review', description: 'Your seller application is being reviewed by our team.' }),
        }
      : {
          icon: Store,
          tone: 'purple' as ClayTone,
          label: 'Sell on Sellora',
          subtitle: 'Start your own store',
          onClick: () => navigate('/seller/onboarding'),
        };

  const statItems = [
    { icon: Package, tone: 'orange' as ClayTone, label: 'Orders', value: stats.orders, onClick: () => navigate('/orders') },
    { icon: Heart, tone: 'pink' as ClayTone, label: 'Wishlist', value: stats.wishlist, onClick: () => navigate('/wishlist') },
    { icon: Star, tone: 'gold' as ClayTone, label: 'Reviews', value: stats.reviews, onClick: () => navigate('/profile/edit') },
    { icon: TicketPercent, tone: 'blue' as ClayTone, label: 'Coupons', value: stats.coupons, onClick: () => navigate('/profile/coupons') },
  ];

  const menuItems = [
    ...(role === 'admin'
      ? [{ icon: Crown, tone: 'gold' as ClayTone, label: 'Admin Panel', subtitle: 'Manage users, products, orders & more', highlight: true, onClick: () => navigate('/admin') }]
      : []),
    sellerItem,
    { icon: MapPin, tone: 'pink' as ClayTone, label: 'My Addresses', subtitle: 'Manage delivery addresses', onClick: () => navigate('/profile/addresses') },
    { icon: WalletCards, tone: 'blue' as ClayTone, label: 'Payment Methods', subtitle: 'Cards, UPI & more', onClick: () => navigate('/profile/payment-methods') },
    { icon: TicketPercent, tone: 'purple' as ClayTone, label: 'My Coupons', subtitle: 'View and manage your coupons', onClick: () => navigate('/profile/coupons') },
    { icon: Bell, tone: 'orange' as ClayTone, label: 'Notifications', subtitle: 'Manage your notifications', onClick: () => navigate('/profile/notifications') },
    { icon: CircleHelp, tone: 'cyan' as ClayTone, label: 'Help Center', subtitle: 'Get support and FAQs', onClick: () => navigate('/profile/help') },
    { icon: LogOut, tone: 'red' as ClayTone, label: 'Logout', subtitle: 'Sign out from your account', danger: true, onClick: handleLogout },
  ];

  const initials = fullName.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="profile-clay min-h-svh overflow-x-hidden pb-28">
      <div className="profile-clay__ambient" aria-hidden="true" />
      <main className="relative z-10 mx-auto w-full max-w-[620px] px-3.5 pb-3 pt-5 sm:px-5 sm:pt-7">
        <header className="mb-4 flex items-center justify-between px-1">
          <div>
            <h1 className="profile-clay__title">Profile</h1>
            <p className="profile-clay__subtitle">Manage your profile and preferences</p>
          </div>
          <div className="flex gap-2.5">
            <Button type="button" variant="ghost" size="icon" className="profile-clay__header-button" onClick={() => navigate('/profile/notifications')} aria-label="Notifications">
              <ClayIcon icon={Bell} tone="blue" size="sm" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="profile-clay__header-button" onClick={() => navigate('/profile/edit')} aria-label="Profile settings">
              <ClayIcon icon={Settings} tone="purple" size="sm" />
            </Button>
          </div>
        </header>

        <section className="profile-clay__hero" aria-label="Profile summary">
          <div className="profile-clay__identity">
            <div className="profile-clay__avatar-wrap">
              <div className="profile-clay__avatar">
                {avatarUrl ? <img src={avatarUrl} alt={fullName} /> : <span>{initials}</span>}
              </div>
              <Button type="button" variant="ghost" size="icon" className="profile-clay__camera" onClick={() => navigate('/profile/edit')} aria-label="Change profile photo">
                <Camera strokeWidth={2.8} />
              </Button>
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <h2 className="profile-clay__name">
                <span className="truncate">{loading ? 'Loading...' : fullName}</span>
                <Crown className="profile-clay__name-crown" fill="currentColor" aria-hidden="true" />
              </h2>
              <p className="profile-clay__email">{email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="profile-clay__verified"><Check aria-hidden="true" /> Verified User</span>
                <Button type="button" variant="ghost" className="profile-clay__edit" onClick={() => navigate('/profile/edit')}>
                  <Pencil aria-hidden="true" /> Edit Profile
                </Button>
              </div>
            </div>
          </div>

          <div className="profile-clay__slogan" aria-hidden="true">Shop<br />More<br />Live Better</div>
          <img src={profileMascot} alt="Sellora shopping assistant" className="profile-clay__mascot" width={768} height={768} />
        </section>

        <section className="profile-clay__stats" aria-label="Account activity">
          {statItems.map((item) => (
            <Button key={item.label} type="button" variant="ghost" className="profile-clay__stat" onClick={item.onClick}>
              <ClayIcon icon={item.icon} tone={item.tone} size="lg" />
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </Button>
          ))}
        </section>

        <nav className="profile-clay__menu" aria-label="Account menu">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              type="button"
              variant="ghost"
              className={`profile-clay__menu-item${item.highlight ? ' profile-clay__menu-item--highlight' : ''}${item.danger ? ' profile-clay__menu-item--danger' : ''}`}
              onClick={item.onClick}
            >
              <ClayIcon icon={item.icon} tone={item.tone} />
              <span className="profile-clay__menu-copy">
                <span className="profile-clay__menu-title">
                  {item.label}
                  {'badge' in item && item.badge ? <small>{item.badge}</small> : null}
                </span>
                <span className="profile-clay__menu-subtitle">{item.subtitle}</span>
              </span>
              <ChevronRight className="profile-clay__chevron" strokeWidth={3} aria-hidden="true" />
            </Button>
          ))}
        </nav>
      </main>
      <BottomNav variant="clay" />
    </div>
  );
};

export default ProfilePage;