import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import BecomeSellerPage from "./pages/BecomeSellerPage";
import SellerReviewPage from "./pages/SellerReviewPage";
import SellerDashboard from "./pages/SellerDashboard";
import AdminPanel from "./pages/AdminPanel";
import ProfilePage from "./pages/ProfilePage";
import LoginHistoryPage from "./pages/LoginHistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const FullscreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Public-only wrapper: redirects authenticated users away from /login and /signup
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullscreenLoader />;
  if (user) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes (NO sidebar) */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignupPage />
            </PublicOnlyRoute>
          }
        />

        {/* Backwards-compat */}
        <Route path="/auth" element={<Navigate to="/login" replace />} />
      </Route>

      {/* Protected routes (GLOBAL sidebar layout) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="login-history" element={<LoginHistoryPage />} />

        <Route
          path="seller/onboarding"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <BecomeSellerPage />
            </ProtectedRoute>
          }
        />

        {/* Backwards-compat */}
        <Route path="become-seller" element={<Navigate to="/seller/onboarding" replace />} />

        {/* Seller Review Page (pending/rejected sellers) */}
        <Route
          path="seller/review"
          element={
            <ProtectedRoute>
              <SellerReviewPage />
            </ProtectedRoute>
          }
        />

        {/* Seller routes */}
        <Route
          path="seller"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <SellerDashboard section="overview" />
            </ProtectedRoute>
          }
        />
        <Route
          path="seller/add-product"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <SellerDashboard section="add-product" />
            </ProtectedRoute>
          }
        />
        <Route
          path="seller/products"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <SellerDashboard section="products" />
            </ProtectedRoute>
          }
        />
        <Route
          path="seller/analytics"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <SellerDashboard section="analytics" />
            </ProtectedRoute>
          }
        />

        {/* Convenience aliases requested */}
        <Route
          path="products"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <SellerDashboard section="products" />
            </ProtectedRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <SellerDashboard section="analytics" />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel section="dashboard" />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel section="users" />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/sellers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel section="sellers" />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/products"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel section="products" />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/searches"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel section="searches" />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/views"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel section="clicks" />
            </ProtectedRoute>
          }
        />

        {/* Protected catch-all keeps sidebar visible after login */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

