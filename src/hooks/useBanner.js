import { useCallback, useState } from "react";
import { getActiveBanners } from "@/services/banner.service";

export function useBanner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActive = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getActiveBanners(options);
      const nextBanners = Array.isArray(result) ? result : [];
      setBanners(nextBanners);
      return nextBanners;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Khong the tai danh sach banner";
      setError(message);
      setBanners([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    banners,
    loading,
    error,
    fetchActive,
  };
}
