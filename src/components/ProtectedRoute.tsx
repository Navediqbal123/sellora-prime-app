import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'shopkeeper' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
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

  // No role restriction — allow all authenticated users
  if (!allowedRoles) {
    return <>{children}</>;
  }

  // Direct role check — no extra async seller lookup needed
  // The AuthContext already resolves shopkeeper from sellers table
  if (allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  // No access
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
