import { api } from "@/services/axios.config";

export async function getNotificationFeed(params = {}) {
  const response = await api.get("/notifications/feed", { params });
  return {
    data: Array.isArray(response.data?.data) ? response.data.data : [],
    pagination: response.data?.pagination || null,
  };
}

export async function getUnreadCount(params = {}) {
  const response = await api.get("/notifications/unread-count", { params });
  return response.data?.data?.unreadCount || 0;
}

export async function markAllAsRead(params = {}) {
  const response = await api.patch("/notifications/read-all", {}, { params });
  return response.data;
}

export async function markAsRead(notificationId, params = {}) {
  if (!notificationId) return null;
  const response = await api.patch(`/notifications/${notificationId}/read`, {}, { params });
  return response.data?.data?.notification || null;
}

export async function getNotificationById(notificationId, params = {}) {
  if (!notificationId) return null;
  const response = await api.get(`/notifications/${notificationId}`, { params });
  return response.data?.data?.notification || null;
}
