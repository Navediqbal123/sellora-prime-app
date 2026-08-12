import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "@/components/NotificationBell";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const headerlessRoutes = ["/categories", "/wishlist", "/orders", "/profile"];
  const hideHeader = headerlessRoutes.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + "/")
  );
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-svh w-full bg-background">
        {!hideHeader && (
        <header className="sticky top-0 z-40 h-16 w-full bg-white/90 backdrop-blur-xl" style={{ borderBottom: '1px solid #F1F1F5' }}>
          <div className="flex h-full items-center gap-2.5 px-4">
            <SidebarTrigger className="h-9 w-9 text-[#111111]" />
            <span
              className="w-9 h-9 rounded-[12px] flex items-center justify-center"
              style={{ backgroundColor: '#6D28D9', boxShadow: '0 8px 18px -8px rgba(109,40,217,0.6)' }}
            >
              <ShoppingBag className="w-[19px] h-[19px] text-white" strokeWidth={2} />
            </span>
            <span className="text-[22px] font-bold tracking-tight leading-none" style={{ color: '#111111' }}>
              Sellora
            </span>
            <div className="flex-1" />
            <NotificationBell />
          </div>
        </header>
        )}

        <div className={`flex w-full ${hideHeader ? "min-h-svh" : "min-h-[calc(100svh-4rem)]"}`}>
          <div className="animate-slide-in-left">
            <AppSidebar />
          </div>

          <SidebarInset className="flex-1">
            <main className="min-h-full animate-fade-in">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;

