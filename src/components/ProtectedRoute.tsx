import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'shopkeeper' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const [sellerStatus, setSellerStatus] = useState<string | null>(null);
  const [checkingSellerStatus, setCheckingSellerStatus] = useState(false);

  // Check seller status directly from sellers table for real-time accuracy
  useEffect(() => {
    const checkSellerStatus = async () => {
      if (!user || !allowedRoles?.includes('shopkeeper')) {
        setCheckingSellerStatus(false);
        return;
      }

      setCheckingSellerStatus(true);
      const { data } = await supabase
        .from('sellers')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();

      setSellerStatus(data?.status ?? null);
      setCheckingSellerStatus(false);
    };

    checkSellerStatus();
  }, [user, allowedRoles]);

  if (loading || checkingSellerStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has access based on allowedRoles
  if (allowedRoles) {
    // Direct role check
    const hasRoleAccess = allowedRoles.includes(role);
    
    // For shopkeeper routes: allow if seller status is 'approved' (works for ANY user including admins)
    const hasSellerAccess = allowedRoles.includes('shopkeeper') && sellerStatus === 'approved';
    
    // For admin routes: only allow admins
    const hasAdminAccess = allowedRoles.includes('admin') && role === 'admin';
    
    // Allow access if user meets ANY of the access criteria
    if (hasRoleAccess || hasSellerAccess || hasAdminAccess) {
      return <>{children}</>;
    }
    
    // No access - redirect to appropriate page based on user's actual role
    // Important: Don't auto-redirect between admin/seller - just go home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
