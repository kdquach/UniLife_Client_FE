import { api } from "@/services/axios.config";

/**
 * Get current user's order history with pagination
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.status - Filter by order status (e.g., pending, completed)
 * @returns {Promise<Object>} - { status, data: { results, pagination }, message }
 */
export async function getMyOrders(options = {}) {
  const params = new URLSearchParams();

  if (options.page) params.append("page", options.page);
  if (options.limit) params.append("limit", options.limit);

  // Logic filter: Nếu status khác 'all' thì mới append
  if (options.status && options.status !== "all") {
    params.append("status", options.status);
  }

  const response = await api.get(`/orders/my-orders?${params.toString()}`);
  return response.data;
}

/** Get order by ID */
export async function getOrderById(id) {
  const res = await api.get(`/orders/${id}`);
  return res.data; // { status, data: { order } }
}

/**
 * Get order detail by ID
 * @param {string} id - Order ID
 * @returns {Promise<Object>} - { status, data: { order } }
 */
export async function getOrderDetail(id) {
  const response = await api.get(`/orders/${id}`);
  return response.data;
}

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @param {string} orderData.canteenId - Canteen ID
 * @param {Array} orderData.items - List of items
 * @param {Object} orderData.payment - Payment info
 * @param {string} orderData.note - Order note
 * @param {Object} orderData.summary - Price summary
 * @returns {Promise<Object>} - { status, data: { order } }
 */
export async function createOrder(orderData) {
  const response = await api.post("/orders", orderData);
  return response.data;
}

/**
 * Re-order: Add items from an old order to cart
 * @param {string} orderId - ID of the old order
 * @param {string} currentCanteenId - Current canteen context (required by BE)
 * @returns {Promise<Object>} - { status, data: { successItems, failedItems }, message }
 */
export async function reOrder(orderId, currentCanteenId) {
  const response = await api.post(`/orders/${orderId}/re-order`, {
    currentCanteenId,
  });
  return response.data;
}
