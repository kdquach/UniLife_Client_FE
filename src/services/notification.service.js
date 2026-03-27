import { api } from "@/services/axios.config";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientNetworkError = (error) => {
  const code = error?.code || "";
  const message = String(error?.message || "").toLowerCase();
  return (
    code === "ERR_NETWORK" ||
    code === "ECONNABORTED" ||
    message.includes("network error") ||
    message.includes("connection closed") ||
    message.includes("timeout")
  );
};

const withRetry = async (requestFn, { retries = 2, delayMs = 300 } = {}) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isTransientNetworkError(error)) {
        throw error;
      }
      await sleep(delayMs * (attempt + 1));
    }
  }

  throw lastError;
};

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
  const response = await withRetry(
    () => api.patch(`/notifications/${notificationId}/read`, {}, { params }),
    { retries: 2, delayMs: 300 },
  );
  return response.data?.data?.notification || null;
}

export async function getNotificationById(notificationId, params = {}) {
  if (!notificationId) return null;
  const response = await api.get(`/notifications/${notificationId}`, { params });
  return response.data?.data?.notification || null;
}
