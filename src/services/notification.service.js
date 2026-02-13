import { api } from "@/services/axios.config";

export async function getMyNotifications(params = {}) {
  const response = await api.get("/notifications/my", { params });
  return response.data || {};
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
  const response = await api.get(`/notifications/${notificationId}`);
  return response.data?.data?.notification || null;
}
