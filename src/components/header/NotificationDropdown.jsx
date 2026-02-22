import { useMemo, useState } from "react";
import { Dropdown, Empty } from "antd";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import NotificationItem from "@/components/header/NotificationItem.jsx";

function NotificationButton({ badge }) {
   return (
      <button
         type="button"
         aria-label="Notifications"
         className="relative grid h-9 w-9 place-items-center rounded-full bg-white/80 text-muted shadow-card transition-colors hover:bg-white hover:text-primary"
      >
         <MaterialIcon name="notifications" className="text-[18px]" />

         {badge > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-inverse">
               {badge}
            </span>
         )}
      </button>
   );
}

export default function NotificationDropdown({
   notifications = [],
   badge,
   onItemClick,
   onCopyCode,
   onMarkAllRead,
   onLoadMore,
   hasMore,
   loadingMore,
   onViewAll,
   open,
   onOpenChange,
   loadingAll,
}) {
   const [activeTab, setActiveTab] = useState("all");
   const [copiedId, setCopiedId] = useState(null);
   const [copyingId, setCopyingId] = useState(null);

   const badgeCount = typeof badge === "number" ? badge : notifications.filter((n) => !n.isRead).length;

   const filteredNotifications = useMemo(() => {
      if (activeTab === "unread") {
         return notifications.filter((item) => !item.isRead);
      }
      return notifications;
   }, [activeTab, notifications]);

   const typeConfig = {
      promotion: { icon: "local_offer", color: "bg-amber-50 text-amber-600" },
      order: { icon: "receipt_long", color: "bg-emerald-50 text-emerald-600" },
      shift: { icon: "event", color: "bg-violet-50 text-violet-600" },
      salary: { icon: "payments", color: "bg-teal-50 text-teal-600" },
      feedback: { icon: "chat_bubble", color: "bg-orange-50 text-orange-600" },
      system: { icon: "campaign", color: "bg-sky-50 text-sky-600" },
   };

   const getTypeConfig = (type) => typeConfig[type] || typeConfig.system;

   const viewAllLabel = loadingAll ? "Đang tải..." : "Xem tất cả";

   const handleCopyCode = async (item) => {
      if (!onCopyCode || !item?.id) return;
      try {
         setCopyingId(item.id);
         const success = await onCopyCode(item);
         if (!success) return;
         setCopiedId(item.id);
         window.setTimeout(() => {
            setCopiedId((prev) => (prev === item.id ? null : prev));
         }, 2500);
      } finally {
         setCopyingId(null);
      }
   };

   return (
      <Dropdown
         trigger={["click"]}
         placement="bottomRight"
         open={open}
         onOpenChange={onOpenChange}
         popupRender={() => (
            <div className="w-97.5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
               <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-text">Thông báo</p>
                  <button type="button" onClick={onViewAll} className="text-xs font-semibold text-primary hover:underline">
                     {viewAllLabel}
                  </button>
               </div>

               <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
                  <button
                     type="button"
                     onClick={() => setActiveTab("all")}
                     className={`rounded-full px-3 py-1 text-xs font-semibold transition ${activeTab === "all" ? "bg-primary text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                     Tất cả
                  </button>
                  <button
                     type="button"
                     onClick={() => setActiveTab("unread")}
                     className={`rounded-full px-3 py-1 text-xs font-semibold transition ${activeTab === "unread" ? "bg-primary text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                     Chưa đọc
                  </button>
                  <button type="button" onClick={onMarkAllRead} className="ml-auto text-xs font-medium text-slate-500 hover:text-primary">
                     Đánh dấu đã đọc
                  </button>
               </div>

               <div className="max-h-105 overflow-y-auto px-2 py-2">
                  {!filteredNotifications.length && (
                     <div className="py-6">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo" />
                     </div>
                  )}

                  {filteredNotifications.map((item) => {
                     const config = getTypeConfig(item.type);
                     return (
                        <div key={item.id} className="mb-1.5">
                           <NotificationItem
                              item={item}
                              config={config}
                              onClick={() => onItemClick?.(item)}
                              onCopyCode={handleCopyCode}
                              isCopying={copyingId === item.id}
                              isCopied={copiedId === item.id}
                           />
                        </div>
                     );
                  })}

                  {hasMore && (
                     <div className="px-2 pb-1 pt-2">
                        <button
                           type="button"
                           onClick={() => !loadingMore && onLoadMore?.()}
                           className="w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                           {loadingMore ? "Đang tải..." : "Xem thêm"}
                        </button>
                     </div>
                  )}
               </div>
            </div>
         )}
      >
         <span className="inline-flex">
            <NotificationButton badge={badgeCount} />
         </span>
      </Dropdown>
   );
}
