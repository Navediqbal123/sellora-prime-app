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

  // Check if user has access
  if (allowedRoles) {
    // Direct role check
    const hasRoleAccess = allowedRoles.includes(role);
    
    // For shopkeeper routes: also allow if seller status is 'approved'
    const hasSellerAccess = allowedRoles.includes('shopkeeper') && sellerStatus === 'approved';
    
    if (!hasRoleAccess && !hasSellerAccess) {
      // Redirect based on role
      if (role === 'admin') {
        return <Navigate to="/admin" replace />;
      }
      // If seller is approved but role not updated yet, allow access
      if (sellerStatus === 'approved') {
        return <>{children}</>;
      }
      if (role === 'shopkeeper') {
        return <Navigate to="/seller" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
