import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  totalProducts: number;
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
  viewsOverTime: { name: string; value: number }[];
  clicksPerProduct: { name: string; value: number }[];
  productsByCategory: { name: string; value: number }[];
  products: any[];
}

interface UseSellerAnalyticsResult {
  data: AnalyticsData;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSellerAnalytics = (): UseSellerAnalyticsResult => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData>({
    totalProducts: 0,
    totalViews: 0,
    totalClicks: 0,
    conversionRate: 0,
    viewsOverTime: [],
    clicksPerProduct: [],
    productsByCategory: [],
    products: [],
  });

  const fetchAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Get seller ID
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (sellerError || !sellerData) {
        throw new Error('Seller not found');
      }

      const sellerId = sellerData.id;

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      const productsList = products || [];

      // Calculate totals from products
      const totalProducts = productsList.length;
      const totalViews = productsList.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalClicks = productsList.reduce((sum, p) => sum + (p.clicks || 0), 0);
      const conversionRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

      // Generate views over time (last 7 days simulation based on product data)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const today = new Date().getDay();
      const viewsOverTime = days.map((day, index) => ({
        name: day,
        value: Math.floor((totalViews / 7) * (0.5 + Math.random())),
      }));

      // Clicks per product (top 5)
      const clicksPerProduct = productsList
        .slice(0, 5)
        .map(p => ({
          name: p.title.length > 12 ? p.title.substring(0, 12) + '...' : p.title,
          value: p.clicks || 0,
        }));

      // Products by category
      const categoryMap: Record<string, number> = {};
      productsList.forEach(p => {
        const cat = p.category || 'Other';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });
      const productsByCategory = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
      }));

      setData({
        totalProducts,
        totalViews,
        totalClicks,
        conversionRate,
        viewsOverTime,
        clicksPerProduct,
        productsByCategory,
        products: productsList,
      });
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return { data, loading, error, refetch: fetchAnalytics };
};
