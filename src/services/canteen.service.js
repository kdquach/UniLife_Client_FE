import { api } from '@/services/axios.config';

/**
 * Get canteens by campus/location
 * @param {string} location - Campus name (e.g., 'Hồ Chí Minh')
 * @returns {Promise<Array>} - List of canteens
 */
export async function getCanteensByLocation(location) {
  const params = new URLSearchParams();
  if (location) params.append('location', location);
  const res = await api.get(`/canteens?${params.toString()}`);
  return res.data?.data?.canteens || [];
}
