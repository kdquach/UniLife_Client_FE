import { api } from '@/services/axios.config';

/**
 * Validate a voucher code and get discount amount
 * @param {Object} params - Validation parameters
 * @param {string} params.code - Voucher code (e.g., "WELCOME10")
 * @param {number} params.orderTotal - Subtotal of the order
 * @param {Array} params.items - List of items in cart
 * @param {string} params.campusId - Current campus ID (optional)
 * @returns {Promise<Object>} - { voucher, discountAmount, message }
 */
export async function validateVoucher({ code, orderTotal, items, campusId }) {
  const payload = {
    code,
    orderTotal,
    items: items.map((item) => ({
      productId: item.productId?._id || item.productId,
      quantity: item.quantity || 1,
      price: item.productId?.price || item.price || 0,
    })),
  };

  // Only include campusId if provided
  if (campusId) {
    payload.campusId = campusId;
  }

  const response = await api.post('/vouchers/validate', payload);
  return response.data;
}

/**
 * Lấy danh sách voucher đang hoạt động
 * @param {Object} params
 * @param {string} [params.canteenId] - Id canteen đang chọn
 * @param {string} [params.campusId] - Alias cho canteenId (tương thích code cũ)
 * @returns {Promise<Object>} response từ server
 */
export async function getActiveVouchers({ canteenId, campusId } = {}) {
  const resolvedCanteenId = canteenId || campusId;
  const params = {};

  // Backend hiện chưa filter theo canteen; vẫn gửi để tương lai có thể hỗ trợ
  if (resolvedCanteenId) {
    params.canteenId = resolvedCanteenId;
  }

  const response = await api.get('/vouchers/active', { params });
  return response.data;
}
