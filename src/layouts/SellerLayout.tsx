import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import SellerBottomNav from "@/components/seller/SellerBottomNav";

const SellerLayout = () => {
  const { pathname } = useLocation();
  // Insights has its own dedicated bottom nav — hide the seller nav there.
  const hideSellerNav = pathname.startsWith("/seller/insights");
  return (
    <div className="seller-light min-h-svh w-full" style={{ background: "#ffffff" }}>
      <main className={hideSellerNav ? "" : "pb-28"}>
        <Outlet />
      </main>
      {!hideSellerNav && <SellerBottomNav />}
    </div>
  );
};

export default SellerLayout;
