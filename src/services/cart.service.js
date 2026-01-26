import { api } from '@/services/axios.config';

/** View Cart */
export async function getCart() {
    const res = await api.get('/cart');
    return res.data; // { status, data: { cart } }
}

/** Cart totals */
export async function getCartTotal() {
    const res = await api.get('/cart/total');
    return res.data; // { status, data: { itemCount, totalPrice } }
}

/** Add to Cart */
export async function addToCart(productId, quantity = 1) {
    const res = await api.post('/cart/add', { productId, quantity });
    return res.data; // { status, data: { cart } }
}

/** Update Quantity */
export async function updateCartItemQuantity(productId, quantity) {
    const res = await api.patch(`/cart/items/${productId}`, { quantity });
    return res.data; // { status, data: { cart } }
}

/** Delete Item */
export async function deleteCartItem(productId) {
    const res = await api.delete(`/cart/items/${productId}`);
    return res.data; // { status, data: { cart } }
}

export async function clearCart() {
    const res = await api.delete("/cart");
    return res.data;
}
