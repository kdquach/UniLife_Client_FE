import { api } from "@/services/axios.config";

export async function getNotificationFeed(params = {}) {
  const response = await api.get("/notifications/feed", { params });
  return {
    data: Array.isArray(response.data?.data) ? response.data.data : [],
    pagination: response.data?.pagination || null,
  };
}

export async function getUnreadCount() {
  const response = await api.get("/notifications/unread-count");
  return response.data?.data?.unreadCount || 0;
}

export async function markAllAsRead() {
  const response = await api.patch("/notifications/read-all");
  return response.data;
}

export async function markAsRead(notificationId) {
  if (!notificationId) return null;
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data?.data?.notification || null;
}

export async function getNotificationById(notificationId) {
  if (!notificationId) return null;
  try {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data?.data?.notification || null;
  } catch (error) {
    const status = error?.response?.status;
    const shouldFallback = status === 403 || status === 404 || status === 405;

    if (!shouldFallback) {
      throw error;
    }

    try {
      const fallback = await getNotificationFeed({ limit: 100 });
      const rows = Array.isArray(fallback?.data) ? fallback.data : [];
      return (
        rows.find((item) => String(item?._id || item?.id) === String(notificationId)) ||
        null
      );
    } catch {
      return null;
    }
  }
}
