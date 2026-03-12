import React from 'react';
import PageBackButton from '@/components/PageBackButton';
import SalesHistory from '@/components/seller/SalesHistory';

const SellerSalesHistory = () => {
  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <PageBackButton fallbackPath="/seller/dashboard" />
      <SalesHistory />
    </div>
  );
};

export default SellerSalesHistory;
