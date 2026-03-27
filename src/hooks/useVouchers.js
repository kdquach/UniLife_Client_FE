import { useCallback, useState } from 'react';
import { getActiveVouchers } from '@/services/voucher.service';

export function useVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActive = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getActiveVouchers(options);
      const items = response?.data?.vouchers;
      const nextVouchers = Array.isArray(items) ? items : [];
      setVouchers(nextVouchers);
      return nextVouchers;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể tải danh sách voucher';
      setError(message);
      setVouchers([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vouchers,
    loading,
    error,
    fetchActive,
  };
}
