import { useCallback, useEffect, useMemo, useState } from "react";
import { getActiveBanners } from "@/services/banner.service";
import { getCanteenById } from "@/services/canteen.service";
import { useCampusStore } from "@/store/useCampusStore";

const DEFAULT_AUTO_SLIDE_MS = 5000;

const formatDateTime = (value) => {
  if (!value) return "Không giới hạn";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không giới hạn";

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function useHome() {
  const { selectedCanteen } = useCampusStore();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canteenDetail, setCanteenDetail] = useState(null);

  const canteenId = selectedCanteen?.id || null;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [banners, detail] = await Promise.all([
        getActiveBanners({ canteenId }),
        canteenId ? getCanteenById(canteenId) : Promise.resolve(null),
      ]);

      setItems(Array.isArray(banners) ? banners : []);
      setCanteenDetail(detail || null);
      setCurrentIndex(0);
    } catch (err) {
      setItems([]);
      setCanteenDetail(null);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải banner cho căng tin hiện tại",
      );
    } finally {
      setLoading(false);
    }
  }, [canteenId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!items.length) return undefined;

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, DEFAULT_AUTO_SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [items.length]);

  const activeBanner = useMemo(() => {
    if (!items.length) return null;
    return items[currentIndex] || null;
  }, [currentIndex, items]);

  const canteenMeta = useMemo(() => {
    if (!canteenDetail) {
      return {
        name: selectedCanteen?.name || "Toàn hệ thống",
        location: "",
        openingTime: "--:--",
        closingTime: "--:--",
      };
    }

    return {
      name: canteenDetail.name || selectedCanteen?.name || "Canteen",
      location: canteenDetail.location || "",
      openingTime: canteenDetail.openingTime || "--:--",
      closingTime: canteenDetail.closingTime || "--:--",
    };
  }, [canteenDetail, selectedCanteen?.name]);

  const activeDurationText = useMemo(() => {
    if (!activeBanner) return "";
    return `${formatDateTime(activeBanner.startDate)} - ${formatDateTime(activeBanner.endDate)}`;
  }, [activeBanner]);

  return {
    items,
    loading,
    error,
    refresh,
    currentIndex,
    setCurrentIndex,
    activeBanner,
    activeDurationText,
    canteenMeta,
    selectedCanteen,
  };
}
