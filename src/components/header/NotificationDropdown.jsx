import { useMemo, useState } from "react";
import { Dropdown, Empty, Select } from "antd";
import dayjs from "dayjs";
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
   selectedType = "",
   selectedStatus = "all",
   onFilterChange,
   typeOptions = [],
}) {
   const [copiedId, setCopiedId] = useState(null);
   const [copyingId, setCopyingId] = useState(null);

   const badgeCount = typeof badge === "number" ? badge : notifications.filter((n) => !n.isRead).length;

   const filteredNotifications = useMemo(() => notifications, [notifications]);

   const groupedNotifications = useMemo(() => {
      const groups = {
         recent: [],
         earlier: [],
      };

      const now = dayjs();
      filteredNotifications.forEach((item) => {
         const createdAt = item?.createdAt ? dayjs(item.createdAt) : null;
         const isRecent = createdAt?.isValid?.() ? now.diff(createdAt, "hour") < 24 : false;
         if (isRecent) groups.recent.push(item);
         else groups.earlier.push(item);
      });

      return groups;
   }, [filteredNotifications]);

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
   const hasItems = filteredNotifications.length > 0;

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
            <div className="client-notification-dropdown w-97.5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
               <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-text">Thông báo</p>
                  <button type="button" onClick={onViewAll} className="text-xs font-semibold text-primary hover:underline">
                     {viewAllLabel}
                  </button>
               </div>

               <div className="border-b border-slate-100 px-3 py-2">
                  <div className="grid grid-cols-2 gap-2">
                     <div className="rounded-lg bg-[#f5f5f5] px-1">
                        <Select
                           value={selectedType}
                           onChange={(value) => onFilterChange?.({ type: value })}
                           options={typeOptions.map((option) => ({
                              value: option.value,
                              label: option.label,
                           }))}
                           variant="borderless"
                           size="small"
                           className="client-notification-select w-full"
                        />
                     </div>

                     <div className="rounded-lg bg-[#f5f5f5] px-1">
                        <Select
                           value={selectedStatus}
                           onChange={(value) => onFilterChange?.({ status: value })}
                           options={[
                              { value: "all", label: "Tất cả trạng thái" },
                              { value: "read", label: "Đã đọc" },
                              { value: "unread", label: "Chưa đọc" },
                           ]}
                           variant="borderless"
                           size="small"
                           className="client-notification-select w-full"
                        />
                     </div>
                  </div>

                  <div className="mt-2 flex justify-end">
                     <button type="button" onClick={onMarkAllRead} className="text-xs font-medium text-slate-600 hover:text-primary">
                        Đánh dấu đã đọc
                     </button>
                  </div>
               </div>

               <div className="max-h-105 overflow-y-auto px-2 py-2">
                  {!hasItems && (
                     <div className="py-6">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo" />
                     </div>
                  )}

                  {!!groupedNotifications.recent.length && (
                     <div className="mb-2">
                        <p className="px-1 pb-1 text-xs font-bold uppercase tracking-wide text-slate-700">Mới</p>
                        {groupedNotifications.recent.map((item) => {
                           const config = getTypeConfig(item.type);
                           return (
                              <div key={item.id} className="mb-1.5 last:mb-0">
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
                     </div>
                  )}

                  {!!groupedNotifications.earlier.length && (
                     <div className="mb-1">
                        <p className="px-1 pb-1 text-xs font-bold uppercase tracking-wide text-slate-700">Trước đó</p>
                        {groupedNotifications.earlier.map((item) => {
                           const config = getTypeConfig(item.type);
                           return (
                              <div key={item.id} className="mb-1.5 last:mb-0">
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
                     </div>
                  )}

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
