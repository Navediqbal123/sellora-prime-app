import React from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const MainLayout = () => {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-svh w-full bg-background">
        <header className="sticky top-0 z-40 h-14 w-full border-b border-border/60 bg-background/60 backdrop-blur">
          <div className="flex h-full items-center gap-2 px-3">
            {/* Global trigger: required for mobile drawer + desktop collapse */}
            <SidebarTrigger className="hover-scale" />
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

