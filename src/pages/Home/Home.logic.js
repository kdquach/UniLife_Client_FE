import { useCallback, useState } from "react";

export function useHome() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setItems([]);
      setLoading(false);
    }, 500);
  }, []);

  return { items, loading, refresh };
}
