import { NavLink } from "react-router-dom";
import clsx from "clsx";
import Tooltip from "@/components/Tooltip.jsx";
import MaterialIcon from "@/components/MaterialIcon.jsx";

function SideItem({ to, icon, label }) {
  return (
    <Tooltip title={label} placement="right">
      <NavLink
        to={to}
        className={({ isActive }) =>
          clsx(
            "grid h-11 w-11 place-items-center rounded-xl text-slate-700 shadow-card transition duration-200 hover:bg-slate-100/80 hover:shadow-lift",
            isActive && "bg-primary text-inverse shadow-lift"
          )
        }
        aria-label={label}
      >
        {icon}
      </NavLink>
    </Tooltip>
  );
}

export default function AppSidebar() {
  return (
    <aside className="sticky top-[calc(var(--header-h)+24px)] flex h-[calc(100vh-var(--header-h)-48px)] flex-col items-center py-0">
      <div className="flex flex-col items-center gap-3 rounded-surface bg-white p-3 shadow-surface">
        <SideItem
          to="/"
          label="Home"
          icon={<MaterialIcon name="home" className="text-[20px]" />}
        />
        <SideItem
          to="/menu"
          label="Menu Food"
          icon={<MaterialIcon name="restaurant_menu" className="text-[20px]" />}
        />
        <SideItem
          to="/favorite"
          label="Favorite Food"
          icon={<MaterialIcon name="favorite" className="text-[20px]" />}
        />
        <SideItem
          to="/orders"
          label="Order History"
          icon={<MaterialIcon name="receipt_long" className="text-[20px]" />}
        />
      </div>
    </aside>
  );
}
