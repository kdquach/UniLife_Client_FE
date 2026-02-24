import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import NotificationDropdown from "@/components/header/NotificationDropdown.jsx";
import { getCurrentUser, isAuthenticated } from "@/services/auth.service";
import {
  getMyNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@/services/notification.service";
import { getNotificationSocket } from "@/services/notification.socket";
import { formatDate } from "@/utils/formatDate";
import { useCampusStore } from "@/store/useCampusStore";
import { useRightPanel } from "@/store/rightPanel.store.js";

export default function NotificationCenter() {
  const CLIENT_NOTIFICATION_TYPES = [
    { value: "", label: "Tất cả loại" },
    { value: "order", label: "Đơn hàng" },
    { value: "promotion", label: "Khuyến mãi" },
    { value: "system", label: "Hệ thống" },
    { value: "feedback", label: "Phản hồi" },
  ];

  const { selectedCanteen } = useCampusStore();
  const panel = useRightPanel();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loadingAll, setLoadingAll] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const limit = 200;
  const socketRef = useRef(null);
  const lastCanteenRef = useRef(null);
  const networkErrorLoggedRef = useRef(false);

  const navigate = useNavigate();
  const userAuthenticated = isAuthenticated();
  const currentUser = getCurrentUser();
  const userId = currentUser?._id || currentUser?.id || null;
  const canteenId = selectedCanteen?.id || selectedCanteen?._id || null;

  const typeConfig = {
    promotion: { icon: "local_offer", bg: "bg-amber-50 text-amber-600" },
    order: { icon: "receipt_long", bg: "bg-emerald-50 text-emerald-600" },
    shift: { icon: "event", bg: "bg-violet-50 text-violet-600" },
    salary: { icon: "payments", bg: "bg-teal-50 text-teal-600" },
    feedback: { icon: "chat_bubble", bg: "bg-orange-50 text-orange-600" },
    system: { icon: "campaign", bg: "bg-sky-50 text-sky-600" },
  };

  const getTypeConfig = (type) => typeConfig[type] || typeConfig.system;

  const buildDashboardRefreshUrl = (path) => {
    const refreshToken = Date.now();
    return `http://localhost:5174${path}?refresh=${refreshToken}`;
  };

  const buildFilterParams = useCallback(() => {
    const params = { limit };
    if (selectedType) {
      params.type = selectedType;
    }
    if (selectedStatus === "read") {
      params.isRead = true;
    }
    if (selectedStatus === "unread") {
      params.isRead = false;
    }
    return params;
  }, [limit, selectedType, selectedStatus]);

  const openOrderFromNotification = (orderId) => {
    if (!orderId) return false;
    navigate("/orders", { state: { orderId } });
    panel.expand();
    return true;
  };

  const copyToClipboard = async (text) => {
    if (!text) return false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "absolute";
        area.style.left = "-9999px";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      return true;
    } catch (error) {
      console.error("Failed to copy voucher code", error);
      return false;
    }
  };

  const extractVoucherCode = (notification, metadata) => {
    const codeFromMetadata = metadata?.voucherCode || metadata?.code;
    if (codeFromMetadata) return codeFromMetadata;

    const raw = `${notification?.title || ""} ${notification?.content || ""}`;
    const match = raw.match(/\b[A-Z0-9]{5,16}\b/);
    return match?.[0] || "";
  };

  const showBackgroundNotification = (notification) => {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      return;
    }
    if (document.visibilityState !== "hidden") return;
    if (Notification.permission !== "granted") return;

    const browserNotification = new Notification(notification.title || "Thông báo", {
      body: notification.content || "Bạn có thông báo mới.",
      tag: `unilife-notification-${notification.id || Date.now()}`,
      icon: "/vite.svg",
    });

    browserNotification.onclick = async () => {
      window.focus();
      await handleToastClick(notification);
      browserNotification.close();
    };
  };

  useEffect(() => {
    if (!userAuthenticated) return;
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      return;
    }
    if (Notification.permission !== "default") return;

    Notification.requestPermission().catch(() => null);
  }, [userAuthenticated]);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const loadNotifications = async () => {
      if (!userAuthenticated) {
        if (isMounted) {
          setNotifications([]);
          setUnreadCount(0);
        }
        return;
      }

      try {
        const [result, count] = await Promise.all([
          getMyNotifications(buildFilterParams()),
          getUnreadCount(),
        ]);

        if (!isMounted) return;

        const mapped = (result?.data || []).map((n) => ({
          id: n._id,
          title: n.title,
          content: n.content,
          time: formatDate(n.createdAt, "HH:mm DD/MM"),
          createdAt: n.createdAt,
          isRead: n.isRead,
          type: n.type,
          metadata: n.metadata || null,
        }));

        setNotifications(mapped);
        setUnreadCount(count);
      } catch (error) {
        if (isMounted) {
          setNotifications([]);
          setUnreadCount(0);
        }
        const isNetworkError = error?.code === "ERR_NETWORK";
        if (!isNetworkError) {
          console.error("Failed to load notifications", error);
          return;
        }

        if (!networkErrorLoggedRef.current) {
          console.warn("Notification API is unreachable (backend may be down)");
          networkErrorLoggedRef.current = true;
        }
      }
    };

    loadNotifications();
    intervalId = setInterval(loadNotifications, 30000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [userAuthenticated, buildFilterParams]);

  useEffect(() => {
    if (!userAuthenticated || !userId) return;

    const socket = getNotificationSocket();
    socketRef.current = socket;

    // Gắn auth trước khi connect
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    socket.auth = { token };

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      socket.emit("register", { userId });
      if (canteenId) {
        socket.emit("join:canteen", canteenId);
      }
      lastCanteenRef.current = canteenId;
    };

    const handleNewNotification = (event) => {
      if (!event?.payload?.title) return;

      const createdAt = new Date();
      const nextItem = {
        id: event.payload?.notificationId || `rt-${createdAt.getTime()}`,
        title: event.payload.title,
        content: event.payload.content || "",
        time: formatDate(createdAt, "HH:mm DD/MM"),
        createdAt: createdAt.toISOString(),
        isRead: false,
        type: event.payload?.type || "system",
        metadata: event.payload?.metadata || null,
      };

      const typeMatch = !selectedType || nextItem.type === selectedType;
      const statusMatch = selectedStatus !== "read";

      if (!typeMatch || !statusMatch) {
        setUnreadCount((prev) => prev + 1);
        return;
      }

      setNotifications((prev) => [nextItem, ...prev].slice(0, 200));
      setUnreadCount((prev) => prev + 1);

      showBackgroundNotification(nextItem);

      toast.custom(
        (t) => (
          <NotificationToast
            item={nextItem}
            config={getTypeConfig(nextItem.type)}
            onClick={async () => {
              await handleToastClick(nextItem);
              toast.dismiss(t);
            }}
          />
        ),
        { duration: 4500 }
      );
    };

    // 🔥 Quan trọng: clear trước khi on để tránh duplicate
    socket.off("connect");
    socket.off("notification:new");

    socket.on("connect", handleConnect);
    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("notification:new", handleNewNotification);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAuthenticated, userId, canteenId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const previousId = lastCanteenRef.current;
    if (previousId && previousId !== canteenId) {
      socket.emit("leave:canteen", previousId);
    }
    if (canteenId && previousId !== canteenId) {
      socket.emit("join:canteen", canteenId);
    }
    lastCanteenRef.current = canteenId;
  }, [canteenId]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleOpenNotification = async (notification) => {
    if (!notification) return;
    try {
      if (!notification?.isRead) {
        await handleMarkRead(notification);
      }

      await openByNotificationType(notification, notification?.metadata || null);
    } catch (error) {
      console.error("Failed to open notification", error);
    }
  };

  const handleCopyPromotionCode = async (notification) => {
    if (!notification || notification.type !== "promotion") return false;
    const metadata = notification?.metadata || null;
    const code = extractVoucherCode(notification, metadata);
    return copyToClipboard(code);
  };

  const handleMarkRead = async (notification = null) => {
    const target = notification;
    if (!target || target.isRead) return;

    try {
      await markAsRead(target.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === target.id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleLoadAllNotifications = async () => {
    if (loadingAll) return;
    try {
      setLoadingAll(true);
      const result = await getMyNotifications(buildFilterParams());
      const mapped = (result?.data || []).map((n) => ({
        id: n._id,
        title: n.title,
        content: n.content,
        time: formatDate(n.createdAt, "HH:mm DD/MM"),
        createdAt: n.createdAt,
        isRead: n.isRead,
        type: n.type,
        metadata: n.metadata || null,
      }));

      setNotifications(mapped);
    } catch (error) {
      console.error("Failed to load all notifications", error);
    } finally {
      setLoadingAll(false);
    }
  };

  const handleFilterChange = ({ type, status }) => {
    if (type !== undefined) {
      setSelectedType(type);
    }
    if (status !== undefined) {
      setSelectedStatus(status);
    }
  };

  const handleOpenChange = (nextOpen) => {
    setDropdownOpen(nextOpen);
  };

  const handleToastClick = async (notification) => {
    try {
      await openByNotificationType(notification, notification?.metadata || null);
    } catch (error) {
      console.error("Failed to open toast notification", error);
    }
  };

  const openByNotificationType = async (notification, metadata = null) => {
    const kind = metadata?.kind;

    if (notification.type === "order") {
      const orderId = metadata?.orderId || null;
      const opened = openOrderFromNotification(orderId);
      if (!opened) {
        navigate("/orders");
        panel.expand();
      }
      setDropdownOpen(false);
      return true;
    }

    if (notification.type === "shift") {
      navigate("/shifts");
      setDropdownOpen(false);
      return true;
    }

    if (notification.type === "feedback") {
      navigate("/feedback");
      setDropdownOpen(false);
      return true;
    }

    if (kind === "schedule_published") {
      window.location.href = buildDashboardRefreshUrl("/staff/schedule");
      return true;
    }

    if (kind === "shift_change_request") {
      window.location.href = buildDashboardRefreshUrl("/manager/shift-requests");
      return true;
    }

    if (!notification?.id) return false;

    navigate(`/notifications/${notification.id}`, {
      state: {
        notification: {
          id: notification.id,
          title: notification.title,
          content: notification.content || "",
          time: notification.time,
          createdAt: notification.createdAt,
          type: notification.type,
        },
      },
    });
    setDropdownOpen(false);
    return true;
  };

  return (
    <NotificationDropdown
      notifications={notifications}
      badge={unreadCount}
      onItemClick={handleOpenNotification}
      onCopyCode={handleCopyPromotionCode}
      onMarkAllRead={handleMarkAllRead}
      onLoadMore={undefined}
      hasMore={false}
      loadingMore={false}
      onViewAll={handleLoadAllNotifications}
      open={dropdownOpen}
      onOpenChange={handleOpenChange}
      loadingAll={loadingAll}
      selectedType={selectedType}
      selectedStatus={selectedStatus}
      onFilterChange={handleFilterChange}
      typeOptions={CLIENT_NOTIFICATION_TYPES}
    />
  );
}

function NotificationToast({ item, config, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-90 rounded-xl bg-white shadow-[0_8px_20px_rgba(15,23,42,0.08)] ring-1 ring-black/5"
    >
      <div className="flex gap-3 px-4 py-3 text-left">
        <div className={`grid h-9 w-9 place-items-center rounded-full ${config.bg}`}>
          <MaterialIcon name={config.icon} className="text-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm leading-5 text-text">
            <span className="font-semibold text-text">
              {item.title || "Thông báo"}
            </span>
            {item.content ? ` ${item.content}` : ""}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">
              {item.time}
            </span>
          </div>
        </div>
        <div className="flex w-4 items-center justify-end">
          <span className="h-2 w-2 rounded-full bg-primary" />
        </div>
      </div>
    </button>
  );
}
