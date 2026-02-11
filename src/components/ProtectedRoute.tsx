import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("user" | "shopkeeper" | "admin")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  const needsApprovedSellerCheck =
    !!user && !!allowedRoles?.includes("shopkeeper") && role !== "shopkeeper";

  const {
    data: isApprovedSeller,
    isLoading: approvedSellerLoading,
  } = useQuery({
    queryKey: ["approvedSeller", user?.id],
    enabled: needsApprovedSellerCheck,
    staleTime: 1000 * 60 * 2,
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from("sellers")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking seller approval:", error);
        return false;
      }

      return data?.status === "approved";
    },
  });

  // IMPORTANT: do not redirect while auth/role is still being resolved
  // (prevents redirect loop + "double click" feeling)
  if (loading || (needsApprovedSellerCheck && approvedSellerLoading)) {
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

  // Direct role check
  if (allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  // Seller exception: allow access when sellers.status is approved even if role mapping isn't ready yet
  if (needsApprovedSellerCheck && isApprovedSeller) {
    return <>{children}</>;
  }

  // No access
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
