import { useState, useCallback } from 'react';
import { getCanteensByLocation } from '@/services/canteen.service';

/**
 * Custom hook for fetching canteens by campus/location
 * @returns {Object} - { canteens, loading, error, fetchCanteens }
 */
export function useCanteen() {
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCanteens = useCallback(async (location) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCanteensByLocation(location);
      setCanteens(data);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to fetch canteens');
      setCanteens([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { canteens, loading, error, fetchCanteens };
}
