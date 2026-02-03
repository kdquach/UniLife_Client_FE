import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import clsx from "clsx";
import AppHeader from "@/components/header/AppHeader.jsx";
import AppSidebar from "@/components/AppSidebar.jsx";
import RightPanelShell from "@/components/RightPanelShell.jsx";
import { useRightPanel } from "@/store/rightPanel.store.js";

export default function MainLayout() {
  const location = useLocation();
  const panel = useRightPanel();

  const routeKey = (location.pathname.split("/")[1] || "home").toLowerCase();
  const isMenu = routeKey === "menu";
  const isShopping = isMenu || routeKey === "favorite" || routeKey === "orders";
  const mode = isMenu ? "menu" : isShopping ? "shopping" : "hidden";
  const showPanel = mode !== "hidden";

  const defaultExpanded = isMenu;
  const { applyRouteDefault, rememberExpanded } = panel;

  useLayoutEffect(() => {
    // Non-shopping flows: hide panel and force collapsed.
    if (mode === "hidden") {
      applyRouteDefault(routeKey, false);
      return;
    }

    // Shopping flows (including Menu): apply route default once; user can toggle freely.
    applyRouteDefault(routeKey, defaultExpanded);
  }, [routeKey, mode, defaultExpanded, applyRouteDefault]);

  useLayoutEffect(() => {
    if (mode === "hidden") return;
    rememberExpanded(routeKey, panel.expanded);
  }, [mode, routeKey, panel.expanded, rememberExpanded]);

  return (
    <div className="min-h-screen bg-appbg">
      <AppHeader />

      <div
        className={clsx(
          "app-container grid px-4 py-6 md:px-6",
          showPanel && panel.expanded &&
            "lg:pr-[calc(var(--right-panel-w)+var(--app-container-gap))]"
        )}
        style={{
          gridTemplateColumns: "88px minmax(0,1fr)",
        }}
        data-app-container
      >

        <AppSidebar />

        <main className="min-h-[calc(100vh-var(--header-h))] min-w-0 rounded-surface p-6 md:p-7">
          <Outlet />
        </main>
      </div>

      {showPanel ? <RightPanelShell mode={mode} /> : null}
    </div>
  );
}
