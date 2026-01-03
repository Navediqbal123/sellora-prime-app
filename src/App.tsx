import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

// Pages
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import BecomeSellerPage from "./pages/BecomeSellerPage";
import SellerDashboard from "./pages/SellerDashboard";
import AdminPanel from "./pages/AdminPanel";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Auth redirect component
const AuthRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <AuthPage />;
};

// Protected layout wrapper - sidebar only shows when logged in
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout>
      {children}
    </Layout>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth - NO sidebar */}
      <Route path="/auth" element={<AuthRedirect />} />
      
      {/* Protected Routes - WITH sidebar via Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <HomePage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <ProfilePage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/become-seller" element={
        <ProtectedRoute allowedRoles={['user']}>
          <ProtectedLayout>
            <BecomeSellerPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/seller" element={
        <ProtectedRoute allowedRoles={['shopkeeper']}>
          <ProtectedLayout>
            <SellerDashboard />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ProtectedLayout>
            <AdminPanel />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
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
