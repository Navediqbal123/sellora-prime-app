import React from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingBag } from "lucide-react";

const MainLayout = () => {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-svh w-full bg-background">
        <header className="sticky top-0 z-40 h-14 w-full border-b border-border/60 bg-background/60 backdrop-blur">
          <div className="flex h-full items-center gap-2 px-3">
            {/* Global trigger: required for mobile drawer + desktop collapse */}
            <SidebarTrigger className="hover-scale" />
            <span className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-primary to-[hsl(280,80%,50%)] flex items-center justify-center shadow-[0_6px_18px_-4px_hsl(var(--primary)/0.7)]">
              <ShoppingBag className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20" />
            </span>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-primary to-[hsl(280,80%,65%)] bg-clip-text text-transparent leading-none">
              Sellora
            </span>
            <div className="flex-1" />
          </div>
        </header>

        <div className="flex min-h-[calc(100svh-3.5rem)] w-full">
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

