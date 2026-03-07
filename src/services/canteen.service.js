import { api } from '@/services/axios.config';

/**
 * Lấy danh sách canteen theo campusId
 * @param {string} campusId - ID của campus
 * @returns {Promise<Array>} Danh sách canteen
 */
export async function getCanteensByCampus(campusId) {
  const params = new URLSearchParams();
  if (campusId) params.append('campusId', campusId);
  params.append('status', 'active');
  const res = await api.get(`/canteens?${params.toString()}`);
  return res.data?.data?.canteens || [];
}
