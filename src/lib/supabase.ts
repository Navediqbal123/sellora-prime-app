import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbnhhdygqfaqissjxuiq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNibmhoZHlncWZhcWlzc2p4dWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MDUyMzUsImV4cCI6MjA4MTE4MTIzNX0.AiMEw6cWe7F1dPZj1m78hKjiYn94oJF_yolhTY8p1zI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'user' | 'shopkeeper' | 'admin';

export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'blocked';

export interface SellerProfile {
  id: string;
  user_id: string;
  shop_name: string;
  owner_name: string;
  phone_number: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  business_type: string;
  status: SellerStatus;
  rejection_reason?: string;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  state: string;
  phone_number: string;
  image_url?: string;
  views: number;
  clicks: number;
  created_at: string;
  seller?: SellerProfile;
}

