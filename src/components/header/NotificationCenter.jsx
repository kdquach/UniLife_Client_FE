import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import NotificationDropdown from "@/components/header/NotificationDropdown.jsx";
import { getCurrentUser, isAuthenticated } from "@/services/auth.service";
import {
  getMyNotifications,
  getUnreadCount,
  getNotificationById,
  markAllAsRead,
  markAsRead,
} from "@/services/notification.service";
import { createNotificationSocket } from "@/services/notification.socket";
import { formatDate } from "@/utils/formatDate";
import { useCampusStore } from "@/store/useCampusStore";
import { useRightPanel } from "@/store/rightPanel.store.js";

export default function NotificationCenter() {
  const { selectedCanteen } = useCampusStore();
  const panel = useRightPanel();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const limit = 10;
  const socketRef = useRef(null);
  const lastCanteenRef = useRef(null);

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

  const openOrderFromNotification = (orderId) => {
    if (!orderId) return false;
    navigate("/orders", { state: { orderId } });
    panel.expand();
    return true;
  };

  const copyToClipboard = async (text) => {
    if (!text) return;
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
    } catch (error) {
      console.error("Failed to copy voucher code", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const loadNotifications = async () => {
      if (!userAuthenticated) {
        if (isMounted) {
          setNotifications([]);
          setUnreadCount(0);
          setPage(1);
          setHasNextPage(false);
          setShowAllNotifications(false);
        }
        return;
      }

      try {
        const [result, count] = await Promise.all([
          getMyNotifications({ limit, page: 1 }),
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
        setPage(1);
        setHasNextPage(Boolean(result?.pagination?.hasNextPage));
        setShowAllNotifications(false);
      } catch (error) {
        if (isMounted) {
          setNotifications([]);
          setUnreadCount(0);
          setPage(1);
          setHasNextPage(false);
          setShowAllNotifications(false);
        }
        console.error("Failed to load notifications", error);
      }
    };

    loadNotifications();
    intervalId = setInterval(loadNotifications, 30000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [userAuthenticated]);

  useEffect(() => {
    if (!userAuthenticated || !userId) return undefined;

    const socket = createNotificationSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      socket.emit("register", { userId, canteenId });
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
        metadata: null,
      };

      setNotifications((prev) => [nextItem, ...prev].slice(0, 10));
      setUnreadCount((prev) => prev + 1);

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
        { duration: 4500 },
      );
    };

    socket.on("connect", handleConnect);
    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("notification:new", handleNewNotification);
      socket.disconnect();
      socketRef.current = null;
      lastCanteenRef.current = null;
    };
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
    if (!notification?.isRead) {
      handleMarkRead(notification);
    }

    if (notification.type === "order") {
      const orderId = await resolveOrderId(notification);
      if (orderId) {
        openOrderFromNotification(orderId);
      }
      return;
    }

    setExpandedId((prev) => (prev === notification.id ? null : notification.id));
  };

  const handleMarkRead = async (notification = null) => {
    const target = notification || selectedNotification;
    if (!target || target.isRead) return;

    try {
      await markAsRead(target.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === target.id ? { ...n, isRead: true } : n)),
      );
      setSelectedNotification((prev) =>
        prev && prev.id === target.id ? { ...prev, isRead: true } : prev,
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasNextPage) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const result = await getMyNotifications({ limit, page: nextPage });
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

      setNotifications((prev) => [...prev, ...mapped]);
      setPage(nextPage);
      setHasNextPage(Boolean(result?.pagination?.hasNextPage));
    } catch (error) {
      console.error("Failed to load more notifications", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadAllNotifications = async () => {
    if (loadingAll) return;
    try {
      setLoadingAll(true);
      const result = await getMyNotifications({ limit: 200, page: 1 });
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
      setPage(1);
      setHasNextPage(false);
      setShowAllNotifications(true);
      setExpandedId(null);
    } catch (error) {
      console.error("Failed to load all notifications", error);
    } finally {
      setLoadingAll(false);
    }
  };

  const handleOpenChange = (nextOpen) => {
    setDropdownOpen(nextOpen);
    if (!nextOpen) {
      setExpandedId(null);
    }
  };

  const handleToastClick = async (notification) => {
    if (notification.type === "order") {
      const orderId = await resolveOrderId(notification);
      if (orderId) {
        openOrderFromNotification(orderId);
      }
      return;
    }

    setDropdownOpen(true);
    setExpandedId(notification.id);
  };

  const resolveOrderId = async (notification) => {
    if (notification?.metadata?.orderId) return notification.metadata.orderId;
    if (!notification?.id) return null;
    const full = await getNotificationById(notification.id);
    return full?.metadata?.orderId || null;
  };

  return (
    <NotificationDropdown
      notifications={notifications}
      badge={unreadCount}
      onItemClick={handleOpenNotification}
      onMarkAllRead={handleMarkAllRead}
      onLoadMore={handleLoadMore}
      hasMore={hasNextPage && !showAllNotifications}
      loadingMore={loadingMore}
      onViewAll={handleLoadAllNotifications}
      open={dropdownOpen}
      onOpenChange={handleOpenChange}
      loadingAll={loadingAll}
      onCopyCode={copyToClipboard}
      expandedId={expandedId}
    />
  );
}

function NotificationToast({ item, config, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[360px] rounded-xl bg-white shadow-[0_8px_20px_rgba(15,23,42,0.08)] ring-1 ring-black/5"
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
