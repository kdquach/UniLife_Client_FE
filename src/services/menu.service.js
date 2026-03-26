import { api } from '@/services/axios.config';

export const getCurrentMenuByCanteen = async (canteenId) => {
  const response = await api.get(`/menus/canteen/${canteenId}/current-menu`);
  return response.data;
};
