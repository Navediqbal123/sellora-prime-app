import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type ClickAction = 'view' | 'click' | 'wishlist' | 'order' | 'cancel' | 'review';

export interface RawClickLog {
  id: string;
  user_id: string | null;
  product_id: string | null;
  action: ClickAction | string;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  currency_code?: string | null;
  amount?: number | null;
  price?: number | null;
  created_at: string;
}

export interface ProfileLite {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface ProductLite {
  id: string;
  title: string;
  price?: number | null;
  image_url?: string | null;
}

export interface InsightsData {
  logs: RawClickLog[];
  profiles: Record<string, ProfileLite>;
  products: Record<string, ProductLite>;
  productIds: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSellerInsights(): InsightsData {
  const { user } = useAuth();
  const [logs, setLogs] = useState<RawClickLog[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [products, setProducts] = useState<Record<string, ProductLite>>({});
  const [productIds, setProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productIdsRef = useRef<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Resolve seller id
      const { data: sellerRow } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Fetch seller's products (try seller_id, then user_id)
      let prodRows: any[] = [];
      if (sellerRow?.id) {
        const r = await supabase
          .from('products')
          .select('id,title,price,image_url')
          .eq('seller_id', sellerRow.id);
        if (!r.error) prodRows = r.data || [];
      }
      if (!prodRows.length) {
        const r2 = await supabase
          .from('products')
          .select('id,title,price,image_url')
          .eq('user_id', user.id);
        if (!r2.error && r2.data) prodRows = r2.data;
      }

      const pMap: Record<string, ProductLite> = {};
      prodRows.forEach((p) => (pMap[p.id] = p));
      const pIds = prodRows.map((p) => p.id);
      productIdsRef.current = new Set(pIds);
      setProducts(pMap);
      setProductIds(pIds);

      if (pIds.length === 0) {
        setLogs([]);
        setProfiles({});
        return;
      }

      const { data: clickRows, error: clickErr } = await supabase
        .from('click_logs')
        .select('*')
        .in('product_id', pIds)
        .order('created_at', { ascending: false })
        .limit(500);

      if (clickErr) throw clickErr;
      const rows: RawClickLog[] = clickRows || [];
      setLogs(rows);

      // Fetch profiles for referenced users
      const uids = Array.from(new Set(rows.map((l) => l.user_id).filter(Boolean))) as string[];
      if (uids.length) {
        const { data: profRows } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, city, country')
          .in('id', uids);
        const map: Record<string, ProfileLite> = {};
        (profRows || []).forEach((p: any) => (map[p.id] = p));
        setProfiles(map);
      } else {
        setProfiles({});
      }
    } catch (e: any) {
      console.error('insights load failed', e);
      setError(e.message || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime click_logs subscription (filter client-side by seller product ids)
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('seller-insights-clicklogs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'click_logs' },
        async (payload) => {
          const row = payload.new as RawClickLog;
          if (!row?.product_id || !productIdsRef.current.has(row.product_id)) return;
          setLogs((prev) => [row, ...prev].slice(0, 500));
          if (row.user_id && !profiles[row.user_id]) {
            const { data: prof } = await supabase
              .from('profiles')
              .select('id, full_name, email, phone, city, country')
              .eq('id', row.user_id)
              .maybeSingle();
            if (prof) setProfiles((prev) => ({ ...prev, [prof.id]: prof as any }));
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { logs, profiles, products, productIds, loading, error, refetch: load };
}

// ---------- Helpers ----------

const COUNTRY_FLAGS: Record<string, string> = {
  india: '🇮🇳', in: '🇮🇳',
  'united states': '🇺🇸', usa: '🇺🇸', us: '🇺🇸',
  'united kingdom': '🇬🇧', uk: '🇬🇧', gb: '🇬🇧',
  uae: '🇦🇪', 'united arab emirates': '🇦🇪', ae: '🇦🇪',
  canada: '🇨🇦', ca: '🇨🇦',
  australia: '🇦🇺', au: '🇦🇺',
  germany: '🇩🇪', de: '🇩🇪',
  france: '🇫🇷', fr: '🇫🇷',
  japan: '🇯🇵', jp: '🇯🇵',
  china: '🇨🇳', cn: '🇨🇳',
  singapore: '🇸🇬', sg: '🇸🇬',
  pakistan: '🇵🇰', pk: '🇵🇰',
  bangladesh: '🇧🇩', bd: '🇧🇩',
  brazil: '🇧🇷', br: '🇧🇷',
  mexico: '🇲🇽', mx: '🇲🇽',
  spain: '🇪🇸', es: '🇪🇸',
  italy: '🇮🇹', it: '🇮🇹',
  netherlands: '🇳🇱', nl: '🇳🇱',
};

export function countryFlag(name?: string | null): string {
  if (!name) return '🌍';
  const key = name.trim().toLowerCase();
  if (COUNTRY_FLAGS[key]) return COUNTRY_FLAGS[key];
  // ISO-2 code auto-emoji
  if (/^[a-z]{2}$/.test(key)) {
    const A = 0x1f1e6;
    return String.fromCodePoint(A + (key.charCodeAt(0) - 97)) + String.fromCodePoint(A + (key.charCodeAt(1) - 97));
  }
  return '🌍';
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', GBP: '£', EUR: '€', AED: 'د.إ', CAD: 'C$', AUD: 'A$',
  JPY: '¥', CNY: '¥', SGD: 'S$', BRL: 'R$', MXN: 'MX$',
};

export function currencySymbol(code?: string | null): string {
  if (!code) return '₹';
  return CURRENCY_SYMBOLS[code.toUpperCase()] || code.toUpperCase() + ' ';
}

export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return phone;
  const last4 = digits.slice(-4);
  const prefix = phone.startsWith('+') ? phone.slice(0, 3) + ' ' : '';
  return `${prefix}${digits.slice(0, 2)}••••${last4}`;
}

export function initials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
}