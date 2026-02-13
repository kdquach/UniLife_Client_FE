import { io } from "socket.io-client";

const resolveSocketBaseUrl = () => {
  const explicit = import.meta.env.VITE_WS_BASE_URL;
  if (explicit) return explicit;

  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  if (apiBase) {
    return apiBase.replace(/\/api\/?$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "";
};

export const createNotificationSocket = () => {
  const baseUrl = resolveSocketBaseUrl();
  return io(baseUrl, {
    transports: ["websocket", "polling"],
  });
};
