import clsx from "clsx";
import MaterialIcon from "@/components/MaterialIcon.jsx";

export default function CampusTrigger({ campus, onClick, hasOffToday = false, offTodayCount = 0 }) {
  const badgeTitle = offTodayCount > 0
    ? `Campus hiện tại có ${offTodayCount} canteen nghỉ hôm nay`
    : "Campus hiện tại có canteen nghỉ hôm nay";

  return (
    <button
      type="button"
      onClick={onClick}
      title={hasOffToday ? badgeTitle : "Chọn campus"}
      className={clsx(
        "relative flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5",
        "text-sm font-medium text-text shadow-card transition",
        "hover:bg-white hover:shadow-lift"
      )}
    >
      {hasOffToday && (
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-warning ring-2 ring-white" />
      )}
      <MaterialIcon name="location_on" className="text-[18px] text-primary" />
      <span className="hidden sm:block">{campus}</span>
      <MaterialIcon name="expand_more" className="text-[18px] text-muted" />
    </button>
  );
}
