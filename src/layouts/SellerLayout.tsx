import React from "react";
import { Outlet } from "react-router-dom";
import SellerBottomNav from "@/components/seller/SellerBottomNav";

const SellerLayout = () => {
  return (
    <div className="seller-light min-h-svh w-full" style={{ background: "#ffffff" }}>
      <main className="pb-28">
        <Outlet />
      </main>
      <SellerBottomNav />
    </div>
  );
};

export default SellerLayout;
