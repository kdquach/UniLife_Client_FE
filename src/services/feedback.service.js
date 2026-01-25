import { api } from '@/services/axios.config';

/**
 * Get all feedbacks with pagination
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.productId - Filter by product ID
 * @param {string} options.orderId - Filter by order ID
 * @param {string} options.userId - Filter by user ID
 * @param {number} options.rating - Filter by rating (1-5)
 * @param {string} options.sort - Sort order (e.g., -createdAt, rating)
 * @returns {Promise<Object>} - { status, data, pagination, message }
 */
export async function getAllFeedbacks(options = {}) {
  const params = new URLSearchParams();

  if (options.page) params.append('page', options.page);
  if (options.limit) params.append('limit', options.limit);
  if (options.productId) params.append('productId', options.productId);
  if (options.orderId) params.append('orderId', options.orderId);
  if (options.userId) params.append('userId', options.userId);
  if (options.rating) params.append('rating', options.rating);
  if (options.sort) params.append('sort', options.sort);

  const response = await api.get(`/feedbacks?${params.toString()}`);
  return response.data;
}

/**
 * Get feedback by ID
 * @param {string} id - Feedback ID
 * @returns {Promise<Object>} - { status, data: { feedback } }
 */
export async function getFeedbackById(id) {
  const response = await api.get(`/feedbacks/${id}`);
  return response.data;
}

/**
 * Get feedbacks for a product with pagination
 * @param {string} productId - Product ID
 * @param {Object} options - Query options (page, limit, sort)
 * @returns {Promise<Object>} - { status, data, pagination, message }
 */
export async function getFeedbacksByProduct(productId, options = {}) {
  const params = new URLSearchParams();

  if (options.page) params.append('page', options.page);
  if (options.limit) params.append('limit', options.limit);
  if (options.sort) params.append('sort', options.sort);

  const response = await api.get(
    `/feedbacks/product/${productId}?${params.toString()}`
  );
  return response.data;
}

/**
 * Get product rating statistics
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - { status, data: { stats: { avgRating, totalReviews, distribution } } }
 */
export async function getProductRatingStats(productId) {
  const response = await api.get(`/feedbacks/product/${productId}/stats`);
  return response.data;
}

/**
 * Create a new feedback
 * @param {Object} payload - Feedback data
 * @param {string} payload.productId - Product ID (optional)
 * @param {string} payload.orderId - Order ID (optional)
 * @param {number} payload.rating - Rating 1-5 (required)
 * @param {string} payload.comment - Feedback comment (optional, max 1000 chars)
 * @returns {Promise<Object>} - { status, data: { feedback } }
 */
export async function createFeedback(payload) {
  const response = await api.post('/feedbacks', payload);
  return response.data;
}

/**
 * Update feedback
 * @param {string} id - Feedback ID
 * @param {Object} payload - Updated feedback data
 * @param {number} payload.rating - Rating 1-5 (optional)
 * @param {string} payload.comment - Feedback comment (optional)
 * @returns {Promise<Object>} - { status, data: { feedback } }
 */
export async function updateFeedback(id, payload) {
  const response = await api.patch(`/feedbacks/${id}`, payload);
  return response.data;
}

/**
 * Delete feedback
 * @param {string} id - Feedback ID
 * @returns {Promise<Object>} - { status, data: null }
 */
export async function deleteFeedback(id) {
  const response = await api.delete(`/feedbacks/${id}`);
  return response.data;
}
