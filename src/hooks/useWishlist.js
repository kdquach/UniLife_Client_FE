import { useState, useCallback } from 'react';
import {
    getMyWishlist,
    toggleWishlist as apiToggle,
    clearWishlist as apiClear,
} from '@/services/wishlist.service';

/**
 * Hook to manage wishlist state for current user
 * Provides ids Set for quick lookups and full items for rendering.
 */
export function useWishlist() {
    const [items, setItems] = useState([]); // array of { _id, productId }
    const [ids, setIds] = useState(() => new Set()); // Set of productId strings
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const syncFromWishlist = useCallback((wishlist) => {
        const nextItems = Array.isArray(wishlist?.items) ? wishlist.items : [];
        setItems(nextItems);
        setIds(new Set(nextItems.map((it) => it.productId?._id ?? it.productId)));
    }, []);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMyWishlist();
            syncFromWishlist(res.data?.wishlist ?? res.data);
            return res;
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Failed to load wishlist';
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [syncFromWishlist]);

    const toggle = useCallback(
        async (productId) => {
            setError(null);
            try {
                const res = await apiToggle(productId);
                syncFromWishlist(res.data?.wishlist);
                return res.data?.action; // 'added' | 'removed'
            } catch (err) {
                const msg = err?.response?.data?.message || err.message || 'Toggle failed';
                setError(msg);
                throw err;
            }
        },
        [syncFromWishlist]
    );

    const clear = useCallback(async () => {
        setError(null);
        try {
            const res = await apiClear();
            syncFromWishlist(res.data?.wishlist);
            return true;
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Clear failed';
            setError(msg);
            throw err;
        }
    }, [syncFromWishlist]);

    return { items, ids, loading, error, fetch, toggle, clear };
}
