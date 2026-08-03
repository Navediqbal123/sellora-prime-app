import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-svh w-full bg-white">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
