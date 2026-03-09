import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }

    const fetchWishlist = async () => {
      const { data } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);

      setWishlistIds(new Set((data || []).map((w: any) => w.product_id)));
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user) return false;

    const isWished = wishlistIds.has(productId);

    if (isWished) {
      setWishlistIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
    } else {
      setWishlistIds(prev => new Set(prev).add(productId));
      await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId });
    }

    return !isWished;
  }, [user, wishlistIds]);

  const isWishlisted = useCallback((productId: string) => wishlistIds.has(productId), [wishlistIds]);

  return { toggleWishlist, isWishlisted };
};
