import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, SellerProfile, SellerStatus } from '@/lib/supabase';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Store,
  Building,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const SellerReviewPage = () => {
  const { user, refreshRole } = useAuth();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchSellerData = useCallback(async (showSpinner = true) => {
    if (!user) return;

    if (showSpinner) setChecking(true);

    try {
      const { data, error } = await supabase
        .from('seller')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSeller(data);
        
        // If approved, redirect to seller dashboard
        if (data.status === 'approved') {
          await refreshRole();
          navigate('/seller/dashboard');
          return;
        }
      } else {
        // No seller application, redirect to onboarding
        navigate('/seller/onboarding');
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }, [user, refreshRole, navigate]);

  // Initial fetch
  useEffect(() => {
    fetchSellerData();
  }, [fetchSellerData]);

  // Auto-poll `seller` status every 3–5 seconds when pending
  useEffect(() => {
    if (!user) return;

    const tick = async () => {
      if (seller?.status === 'pending') {
        await fetchSellerData(false);
      }
    };

    // Run once immediately
    tick();

    const interval = setInterval(tick, 4000);
    return () => clearInterval(interval);
  }, [user, seller?.status, fetchSellerData]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your application...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return null;
  }

  const getStatusConfig = (status: SellerStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          title: 'Application Under Review',
          description: 'Your seller application is being reviewed by our team. This usually takes 1-2 business days.',
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          title: 'Application Approved!',
          description: 'Congratulations! Your seller application has been approved.',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          title: 'Application Rejected',
          description: seller.rejection_reason || 'Unfortunately, your application was not approved at this time.',
        };
      case 'blocked':
        return {
          icon: AlertTriangle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          title: 'Account Blocked',
          description: seller.rejection_reason || 'Your seller account has been blocked. Please contact support for more information.',
        };
      default:
        return {
          icon: Clock,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/10',
          borderColor: 'border-muted/30',
          title: 'Unknown Status',
          description: 'Please contact support.',
        };
    }
  };

  const statusConfig = getStatusConfig(seller.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Status Banner */}
      <div className={`mb-8 p-6 rounded-2xl border ${statusConfig.borderColor} ${statusConfig.bgColor} animate-fade-in-up`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${statusConfig.bgColor}`}>
            <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${statusConfig.color} mb-1`}>{statusConfig.title}</h2>
            <p className="text-muted-foreground">{statusConfig.description}</p>
          </div>
        </div>
      </div>

      {/* Application Details */}
      <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up stagger-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Store className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Your Application Details</h3>
            <p className="text-sm text-muted-foreground">Submitted on {new Date(seller.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              Business Information
            </h4>
            
            <div className="space-y-3 pl-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Shop Name</p>
                <p className="text-foreground font-medium">{seller.shop_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Owner Name</p>
                <p className="text-foreground font-medium">{seller.owner_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Business Type</p>
                <p className="text-foreground font-medium">{seller.business_type}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Contact Information
            </h4>
            
            <div className="space-y-3 pl-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                <p className="text-foreground font-medium">{seller.phone_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                <p className="text-foreground font-medium">{seller.email}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4 md:col-span-2">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Location
            </h4>
            
            <div className="pl-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Address</p>
              <p className="text-foreground font-medium">
                {seller.address}, {seller.city}, {seller.state} - {seller.pincode}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions based on status */}
      {seller.status === 'pending' && (
        <div className="mt-8 text-center animate-fade-in-up stagger-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-4">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-sm text-yellow-500 font-medium">Waiting for admin approval</span>
          </div>
          
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSellerData(true)}
              disabled={checking}
              className="text-muted-foreground hover:text-foreground"
            >
              {checking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Status
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Auto-checking every 10 seconds</p>
          </div>
        </div>
      )}

      {seller.status === 'approved' && (
        <div className="mt-8 text-center animate-fade-in-up stagger-3">
          <Button onClick={() => navigate('/seller')} className="btn-glow">
            Go to Seller Dashboard
          </Button>
        </div>
      )}

      {(seller.status === 'rejected' || seller.status === 'blocked') && (
        <div className="mt-8 text-center animate-fade-in-up stagger-3">
          <Button variant="outline" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      )}
    </div>
  );
};

export default SellerReviewPage;
