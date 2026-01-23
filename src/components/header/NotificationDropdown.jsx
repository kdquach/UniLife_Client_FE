import { Dropdown, Empty } from "antd";
import MaterialIcon from "@/components/MaterialIcon.jsx";

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

export default function NotificationDropdown({ notifications = [] }) {
   const items =
      notifications.length > 0
         ? notifications.map((n) => ({
            key: n.id,
            label: (
               <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-text">{n.title}</span>
                  <span className="text-xs text-muted">{n.time}</span>
               </div>
            ),
         }))
         : [
            {
               key: "empty",
               label: (
                  <div className="py-4">
                     <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có thông báo"
                     />
                  </div>
               ),
               disabled: true,
            },
         ];

   return (
      <Dropdown
         trigger={["click"]}
         placement="bottomRight"
         menu={{
            items,
            className: "min-w-[280px]",
         }}
      >
         <span className="inline-flex">
            <NotificationButton badge={notifications.length} />
         </span>
      </Dropdown>
   );
}
