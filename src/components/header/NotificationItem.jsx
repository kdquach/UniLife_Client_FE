import MaterialIcon from "@/components/MaterialIcon.jsx";

function resolveNotificationPath(item) {
  if (!item) return null;
  const type = item.type;
  const orderId = item?.metadata?.orderId || item?.metadata?.order?._id || null;

  if (type === "order") {
    return orderId ? `/orders/${orderId}` : "/orders";
  }
  if (type === "shift") {
    return "/shifts";
  }
  if (type === "feedback") {
    return "/feedback";
  }
  if (type === "system" || type === "promotion") {
    return item?.id ? `/notifications/${item.id}` : "/notifications";
  }

  return item?.id ? `/notifications/${item.id}` : "/notifications";
}

export default function NotificationItem({
  item,
  config,
  onClick,
  onCopyCode,
  isCopying = false,
  isCopied = false,
}) {
  const showCopy = item?.type === "promotion";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(item, { path: resolveNotificationPath(item) })}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.(item, { path: resolveNotificationPath(item) });
        }
      }}
      className={`w-full rounded-xl px-3 py-3 text-left transition ${item?.isRead ? "bg-slate-50 hover:bg-slate-100" : "bg-orange-50/60 hover:bg-orange-50"}`}
    >
      <div className="flex gap-3">
        <div className={`mt-0.5 grid h-9 w-9 place-items-center rounded-full ${config.color}`}>
          <MaterialIcon name={config.icon} className="text-[18px]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-5 text-text">
            {item?.title || "Thông báo"}
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">{item?.time}</p>

          {showCopy && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCopyCode?.(item);
              }}
              disabled={isCopying}
              className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${isCopied ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
            >
              <MaterialIcon name={isCopied ? "check" : "content_copy"} className="text-[13px]" />
              <span>{isCopied ? "Copied" : "Copy code"}</span>
            </button>
          )}
        </div>

        {!item?.isRead && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />}
      </div>
    </div>
  );
}
