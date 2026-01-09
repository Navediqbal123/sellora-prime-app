import { supabase } from './supabase';

const API_BASE_URL = 'https://storelink-backend.onrender.com';

// Get auth token for API requests
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

// Generic API request helper
const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Seller API endpoints
export const sellerApi = {
  becomeSeller: (data: {
    shop_name: string;
    owner_name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    business_type: string;
  }) => apiRequest('/shopkeeper/become-shopkeeper', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getDashboard: () => apiRequest('/shopkeeper/dashboard'),
};

// Product API endpoints
export const productApi = {
  addProduct: (data: {
    title: string;
    description: string;
    price: number;
    phone: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  }) => apiRequest('/products/add', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateProduct: (id: string, data: any) => 
    apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: string) => 
    apiRequest(`/products/${id}`, { method: 'DELETE' }),

  getMyProducts: () => apiRequest('/products?user=me'),
};

// Admin API endpoints
export const adminApi = {
  getStats: () => apiRequest('/admin/stats'),
  getSearchLogs: () => apiRequest('/admin/search-logs'),
  getClickLogs: () => apiRequest('/admin/click-logs'),
  getSellerRequests: () => apiRequest('/seller_requests'),
};
