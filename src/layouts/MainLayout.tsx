import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingBag, Bell, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith('/profile');
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-svh w-full bg-background">
        <header className="sticky top-0 z-40 h-16 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-sm">
          <div className="flex h-full items-center gap-2.5 px-3">
            <SidebarTrigger className="hover-scale h-9 w-9" />
            <span className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-[hsl(280,80%,50%)] flex items-center justify-center shadow-[0_6px_18px_-4px_hsl(var(--primary)/0.75)]">
              <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.5} />
              <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
            </span>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-primary to-[hsl(280,80%,65%)] bg-clip-text text-transparent leading-none">
              Sellora
            </span>
            <div className="flex-1" />
            {!isProfilePage && (
              <>
                <button
                  aria-label="Notifications"
                  className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-card to-secondary/60 border border-border/60 flex items-center justify-center hover:border-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                >
                  <Bell className="w-[18px] h-[18px] text-foreground" strokeWidth={2.25} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive shadow-[0_0_8px_hsl(var(--destructive))] animate-pulse" />
                </button>
                <button
                  aria-label="Cart"
                  onClick={() => navigate('/orders')}
                  className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-card to-secondary/60 border border-border/60 flex items-center justify-center hover:border-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                >
                  <ShoppingCart className="w-[18px] h-[18px] text-foreground" strokeWidth={2.25} />
                </button>
              </>
            )}
          </div>
        </header>

        <div className="flex min-h-[calc(100svh-4rem)] w-full">
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

