import { api } from "@/services/axios.config";

export async function getActiveBanners(options = {}) {
  const params = new URLSearchParams();

  if (options.canteenId) {
    params.append("canteenId", options.canteenId);
  }

  const query = params.toString();
  const response = await api.get(`/banners/active${query ? `?${query}` : ""}`);

  return response.data?.data?.banners || [];
}
