import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import SellerLayout from "@/layouts/SellerLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import BecomeSellerPage from "./pages/BecomeSellerPage";
import SellerReviewPage from "./pages/SellerReviewPage";
import AdminPanel from "./pages/AdminPanel";
import ProfilePage from "./pages/ProfilePage";
import LoginHistoryPage from "./pages/LoginHistoryPage";
import NotFound from "./pages/NotFound";

// Seller Pages
import SellerOverview from "./pages/seller/SellerOverview";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerAddProduct from "./pages/seller/SellerAddProduct";
import SellerAnalytics from "./pages/seller/SellerAnalytics";

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

        {/* Protected catch-all keeps sidebar visible after login */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Seller Routes - Separate Layout */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRoles={["shopkeeper"]}>
            <SellerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SellerOverview />} />
        <Route path="dashboard" element={<SellerOverview />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="add-product" element={<SellerAddProduct />} />
        <Route path="analytics" element={<SellerAnalytics />} />
      </Route>

      {/* Admin routes - Wrapped in MainLayout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminPanel section="dashboard" />} />
        <Route path="users" element={<AdminPanel section="users" />} />
        <Route path="sellers" element={<AdminPanel section="sellers" />} />
        <Route path="products" element={<AdminPanel section="products" />} />
        <Route path="searches" element={<AdminPanel section="searches" />} />
        <Route path="views" element={<AdminPanel section="clicks" />} />
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

