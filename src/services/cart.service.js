import { api } from '@/services/axios.config';

/** View Cart */
export async function getCart(canteenId) {
    const res = await api.get('/cart', { params: { canteenId } });
    return res.data; // { status, data: { cart } }
}

/** Cart totals */
export async function getCartTotal(canteenId) {
    const res = await api.get('/cart/total', { params: { canteenId } });
    return res.data; // { status, data: { itemCount, totalPrice } }
}

/** Add to Cart */
export async function addToCart(productId, quantity = 1) {
    const res = await api.post('/cart/add', { productId, quantity });
    return res.data; // { status, data: { cart } }
}

/** Update Quantity */
export async function updateCartItemQuantity(productId, quantity, canteenId) {
    // axios.patch(url, data, config)
    const res = await api.patch(
        `/cart/items/${productId}`,
        { quantity },
        { params: { canteenId } }
    );
    return res.data; // { status, data: { cart } }
}

/** Delete Item */
export async function deleteCartItem(productId, canteenId) {
    const res = await api.delete(`/cart/items/${productId}`, { params: { canteenId } })
    return res.data; // { status, data: { cart } }
}

export async function clearCart(canteenId) {
    const res = await api.delete("/cart", { params: { canteenId } })
    return res.data;
}
