import MaterialIcon from "@/components/MaterialIcon.jsx";

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
      onClick={() => onClick?.(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.(item);
        }
      }}
      className={`w-full rounded-xl border border-slate-200 px-3 py-3 text-left transition ${item?.isRead ? "bg-white hover:bg-slate-50" : "bg-orange-50/35 hover:bg-orange-50/55"}`}
    >
      <div className="flex gap-3">
        <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${config.color}`}>
          <MaterialIcon name={config.icon} className="text-[16px]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-5 text-text">
            {item?.title || "Thông báo"}
          </p>
          <p className="mt-0.5 truncate text-[13px] leading-5 text-text">{item?.content || ""}</p>
          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{item?.time}</p>

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
