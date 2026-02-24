import { io } from "socket.io-client";

let socket = null;

const resolveSocketBaseUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  if (apiBase) {
    return apiBase.replace(/\/api\/?$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "";
};

export const getNotificationSocket = () => {
  if (socket) return socket;

  const baseUrl = resolveSocketBaseUrl();

  socket = io(baseUrl, {
    transports: ["websocket"],
    autoConnect: false,
    withCredentials: true,
  });

  return socket;
};