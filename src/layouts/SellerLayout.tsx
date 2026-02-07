import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const SellerLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/seller' || location.pathname === '/seller/dashboard';

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-svh w-full bg-background">
        <header className="sticky top-0 z-40 h-14 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex h-full items-center gap-3 px-4">
            <SidebarTrigger className="hover-scale" />
            <div className="h-6 w-px bg-border/50" />
            <span className="text-sm font-medium text-gradient">Seller Dashboard</span>
            <div className="flex-1" />
          </div>
        </header>

        <div className="flex min-h-[calc(100svh-3.5rem)] w-full">
          <div className="animate-slide-in-left">
            <SellerSidebar />
          </div>

          <SidebarInset className="flex-1 flex flex-col">
            <main className={`flex-1 ${isDashboard ? '' : 'animate-fade-in'}`}>
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SellerLayout;
