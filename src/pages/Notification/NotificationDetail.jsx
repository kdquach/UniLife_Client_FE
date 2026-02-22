import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import { getNotificationById } from "@/services/notification.service";
import { formatDate } from "@/utils/formatDate";

export default function NotificationDetail() {
  const { id } = useParams();
  const location = useLocation();
  const preloaded = location.state?.notification || null;
  const [notification, setNotification] = useState(preloaded);
  const [loading, setLoading] = useState(!preloaded);

  useEffect(() => {
    let active = true;

    const loadDetail = async () => {
      if (!id) return;
      if (preloaded?.id === id) return;

      try {
        setLoading(true);
        const full = await getNotificationById(id);
        if (!active) return;

        if (!full) {
          setNotification(null);
          return;
        }

        setNotification({
          id: full._id,
          title: full.title,
          content: full.content || "",
          type: full.type || "system",
          time: formatDate(full.createdAt, "HH:mm DD/MM"),
          createdAt: full.createdAt,
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDetail();

    return () => {
      active = false;
    };
  }, [id, preloaded]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl rounded-card border border-divider bg-surface p-6">
        <p className="text-sm text-muted">Đang tải thông báo...</p>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="mx-auto max-w-3xl rounded-card border border-divider bg-surface p-6">
        <p className="text-sm text-muted">Không tìm thấy thông báo.</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl rounded-card border border-divider bg-surface p-6 md:p-7">
      <header className="mb-5 border-b border-divider pb-4">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-surfaceMuted px-3 py-1 text-xs font-medium text-muted">
          <MaterialIcon name="campaign" className="text-[14px]" />
          <span>Thông báo</span>
        </div>
        <h1 className="text-xl font-bold text-text md:text-2xl">
          {notification.title || "Thông báo"}
        </h1>
        <p className="mt-2 text-xs font-medium text-muted">{notification.time}</p>
      </header>

      <article className="whitespace-pre-line text-sm leading-7 text-text md:text-base">
        {notification.content || "(Không có nội dung)"}
      </article>
    </section>
  );
}
