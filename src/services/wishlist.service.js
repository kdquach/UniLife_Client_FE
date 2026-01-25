import { api } from '@/services/axios.config';

/**
 * Get current user's wishlist
 * @returns {Promise<{status:string,data:{wishlist:Object}}>} 
 */
export async function getMyWishlist() {
    const response = await api.get('/wishlist');
    return response.data;
}

/**
 * Toggle a product in wishlist (add if not exists, remove if exists)
 * @param {string} productId
 * @returns {Promise<{status:string,data:{action:'added'|'removed',wishlist:Object}}>} 
 */
export async function toggleWishlist(productId) {
    const response = await api.post('/wishlist/toggle', { productId });
    return response.data;
}

/**
 * Clear all wishlist items
 * @returns {Promise<{status:string,data:{wishlist:Object}}>} 
 */
export async function clearWishlist() {
    const response = await api.delete('/wishlist');
    return response.data;
}

/**
 * Get wishlist count
 * @returns {Promise<{status:string,data:{count:number}}>} 
 */
export async function getWishlistCount() {
    const response = await api.get('/wishlist/count');
    return response.data;
}
