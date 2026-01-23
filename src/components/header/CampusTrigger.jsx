import clsx from "clsx";
import MaterialIcon from "@/components/MaterialIcon.jsx";

export default function CampusTrigger({ campus, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5",
        "text-sm font-medium text-text shadow-card transition",
        "hover:bg-white hover:shadow-lift"
      )}
    >
      <MaterialIcon name="location_on" className="text-[18px] text-primary" />
      <span className="hidden sm:block">{campus}</span>
      <MaterialIcon name="expand_more" className="text-[18px] text-muted" />
    </button>
  );
}
