import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface ProductRating {
  average: number;
  count: number;
}

export type RatingMap = Record<string, ProductRating>;

/**
 * Loads real average rating + review count from the `reviews` table
 * for the given product ids, and keeps them live via realtime updates.
 */
export function useProductRatings(productIds: string[]): RatingMap {
  const [ratings, setRatings] = useState<RatingMap>({});
  const key = productIds.slice().sort().join(',');

  const fetchRatings = useCallback(async () => {
    const ids = key ? key.split(',') : [];
    if (ids.length === 0) {
      setRatings({});
      return;
    }
    const { data, error } = await supabase
      .from('reviews')
      .select('product_id, rating')
      .in('product_id', ids);

    if (error) {
      console.error('Error fetching review ratings:', error);
      return;
    }

    const totals: Record<string, { sum: number; count: number }> = {};
    (data || []).forEach((row: any) => {
      if (!row?.product_id) return;
      const entry = totals[row.product_id] || { sum: 0, count: 0 };
      entry.sum += Number(row.rating) || 0;
      entry.count += 1;
      totals[row.product_id] = entry;
    });

    const next: RatingMap = {};
    ids.forEach((id) => {
      const t = totals[id];
      next[id] = t && t.count > 0
        ? { average: t.sum / t.count, count: t.count }
        : { average: 0, count: 0 };
    });
    setRatings(next);
  }, [key]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  useEffect(() => {
    if (!key) return;
    const channel = supabase
      .channel(`reviews-ratings-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        fetchRatings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [key, fetchRatings]);

  return ratings;
}
