import { useCallback, useState } from 'react';
import { getCurrentMenuByCanteen } from '@/services/menu.service';

const mapScheduleToProducts = (schedule) => {
  const menu = schedule?.menuId;
  const items = Array.isArray(menu?.items) ? menu.items : [];

  const products = items.map((item) => item?.productId).filter(Boolean);

  const deduped = [];
  const idSet = new Set();

  products.forEach((product) => {
    const id = String(product?._id || product?.id || '');
    if (!id || idSet.has(id)) {
      return;
    }

    idSet.add(id);
    deduped.push(product);
  });

  return deduped;
};

export const useDailyMenu = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchByCanteen = useCallback(async (canteenId) => {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const result = await getCurrentMenuByCanteen(canteenId);
      const schedule = result?.data || null;
      const mappedProducts = mapScheduleToProducts(schedule);
      const hasMenu = Boolean(schedule?.menuId);

      if (!hasMenu) {
        setNotice('Hiện chưa có menu theo ngày cho căng tin này.');
      } else if (mappedProducts.length === 0) {
        setNotice('Menu theo ngày hiện chưa có món khả dụng.');
      }

      setProducts(mappedProducts);
      return result;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Khong the tai menu theo ngay';
      setError(errorMessage);
      setNotice(null);
      setProducts([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProducts([]);
    setError(null);
    setNotice(null);
  }, []);

  return {
    products,
    loading,
    error,
    notice,
    fetchByCanteen,
    reset,
  };
};
