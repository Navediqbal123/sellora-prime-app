import React from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingBag } from "lucide-react";

const MainLayout = () => {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-svh w-full bg-background">
        <header className="sticky top-0 z-40 h-12 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="flex h-full items-center gap-2 px-2.5">
            <SidebarTrigger className="hover-scale h-8 w-8" />
            <span className="relative w-6 h-6 rounded-md bg-gradient-to-br from-primary via-primary to-[hsl(280,80%,50%)] flex items-center justify-center shadow-[0_4px_12px_-3px_hsl(var(--primary)/0.7)]">
              <ShoppingBag className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              <span className="absolute inset-0 rounded-md ring-1 ring-inset ring-white/20" />
            </span>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-foreground via-primary to-[hsl(280,80%,65%)] bg-clip-text text-transparent leading-none">
              Sellora
            </span>
            <div className="flex-1" />
          </div>
        </header>

        <div className="flex min-h-[calc(100svh-3rem)] w-full">
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

