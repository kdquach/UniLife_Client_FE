import { io } from "socket.io-client";

let socket = null;

// Ưu tiên endpoint websocket riêng.
// Nếu chưa có, fallback từ VITE_API_BASE_URL bằng cách bỏ hậu tố "/api".
const resolveSocketBaseUrl = () => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL || "";
  if (socketUrl) {
    return socketUrl;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  if (apiBase) {
    return apiBase.replace(/\/api\/?$/, "");
  }

  // Fallback theo origin trình duyệt (hợp lệ khi FE và BE cùng host/proxy).
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "";
};

export const getNotificationSocket = () => {
  if (socket) return socket;

  const baseUrl = resolveSocketBaseUrl();

  socket = io(baseUrl, {
    // Cho phép fallback polling để giảm lỗi kết nối ở một số môi trường dev/proxy.
    transports: ["websocket", "polling"],
    autoConnect: false,
    withCredentials: true,
    timeout: 5000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  return socket;
};