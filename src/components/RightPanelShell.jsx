import { useEffect, useState } from "react";
import clsx from "clsx";
import RightCartPanel from "@/components/RightCartPanel.jsx";
import RightMenuDetailPanel from "@/components/RightMenuDetailPanel.jsx";
import OrderPaymentPanel from "@/components/OrderPaymentPanel.jsx";
import OrderDetailPanel from "@/components/OrderDetailPanel.jsx";
import { useCartStore } from "@/store/cart.store.js";
import { useRightPanel } from "@/store/rightPanel.store.js";
import { money } from "@/utils/currency.js";
import MaterialIcon from "@/components/MaterialIcon.jsx";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    onChange(mql);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [query]);

  return matches;
}

export default function RightPanelShell({ mode = "shopping" }) {
  const cart = useCartStore();
  const panel = useRightPanel();

  const { expanded, view, collapse, openCart } = panel;

  const isMobile = useMediaQuery("(max-width: 639px)");

  const width = 380;
  const pillWidth = 240;
  const pillHeight = 40;
  const [rightOffset, setRightOffset] = useState(24);

  const hidden = mode === "hidden";

  // Align fixed panel to the same centered container as the main grid.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const readNumber = (name, fallback) => {
      try {
        const raw = getComputedStyle(document.documentElement).getPropertyValue(name)?.trim();
        if (!raw) return fallback;
        const n = Number.parseFloat(raw);
        return Number.isFinite(n) ? n : fallback;
      } catch {
        return fallback;
      }
    };

    const GAP = readNumber("--app-container-gap", 24); // px
    const CONTAINER_VW = readNumber("--app-container-vw", 0.9); // 0..1

    const compute = () => {
      const vw = window.innerWidth;
      const containerWidth = vw * CONTAINER_VW;
      const offset = Math.max(GAP, Math.round((vw - containerWidth) / 2 + GAP));
      setRightOffset(offset);
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const allowCollapse = true;
  const showPill = isMobile && !expanded;

  if (hidden) return null;

  return (
    <>
      {/* Desktop/tablet: morph panel <-> pill */}
      {isMobile ? null : (
        <div
          className={clsx(
            "fixed z-40 overflow-hidden bg-surface transform-gpu",
            "transition-[top,right,width,height,border-radius,transform,opacity] duration-450 ease-[cubic-bezier(0.16,1,0.3,1)]"
          )}
          style={{
            right: rightOffset,
            top: expanded ? "calc(var(--header-h) + 24px)" : `calc(100vh - ${24 + pillHeight}px)`,
            width: expanded ? width : pillWidth,
            height: expanded ? "calc(100vh - var(--header-h) - 48px)" : pillHeight,
            borderRadius: expanded ? "var(--radius-surface)" : "9999px",
            willChange: "top,right,width,height,border-radius,box-shadow,transform,opacity",
          }}
        >
          {/* Expanded content (crossfade) */}
          <div
            className={clsx(
              "h-full transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              expanded ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-1"
            )}
          >
            {view === "detail" ? (
              <RightMenuDetailPanel allowCollapse={allowCollapse} />
            ) : view === "payment" ? (
              <OrderPaymentPanel allowCollapse={allowCollapse} />
            ) : view === "order" ? (
              <OrderDetailPanel allowCollapse={allowCollapse} />
            ) : (
              <RightCartPanel allowCollapse={allowCollapse} />
            )}
          </div>

          {/* Collapsed pill content (crossfade) */}
          <button
            type="button"
            onClick={openCart}
            className={clsx(
              "group",
              "absolute inset-0 flex items-center justify-between gap-2 px-4 text-[12px] font-semibold",
              "transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]",
              expanded ? "pointer-events-none opacity-0 translate-y-1" : "opacity-100 translate-y-0",
              "text-slate-700"
            )}
            aria-label="Open cart panel"
          >
            <span className="relative grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary">
              <MaterialIcon name="shopping_cart" className="text-[16px]" />
              {cart.count ? (
                <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-inverse">
                  {cart.count}
                </span>
              ) : null}
            </span>

            <span className="min-w-0 flex-1 truncate text-center">{money(cart.total)}</span>

            <span className="text-slate-400 transition duration-200 group-hover:text-primary">
              <MaterialIcon name="chevron_right" className="text-[18px]" />
            </span>
          </button>
        </div>
      )}

      {/* Mobile: bottom sheet */}
      {isMobile && expanded ? (
        <>
          <button
            type="button"
            aria-label="Close cart"
            onClick={collapse}
            className="fixed inset-0 z-40 bg-black/10"
          />
          <div className="fixed inset-x-3 bottom-3 z-50 max-h-[75vh] overflow-hidden rounded-3xl bg-surface/95 backdrop-blur">
            {view === "detail" ? (
              <RightMenuDetailPanel allowCollapse={allowCollapse} />
            ) : view === "payment" ? (
              <OrderPaymentPanel allowCollapse={allowCollapse} />
            ) : view === "order" ? (
              <OrderDetailPanel allowCollapse={allowCollapse} />
            ) : (
              <RightCartPanel allowCollapse={allowCollapse} />
            )}
          </div>
        </>
      ) : null}

      {/* Mobile-only pill button (collapsed state) */}
      {showPill ? (
        <button
          type="button"
          onClick={openCart}
          className={clsx(
            "group",
            "fixed bottom-6 z-40",
            "flex h-11 items-center justify-between gap-3",
            "rounded-full bg-surface px-5",
            "text-sm font-medium text-text",
            "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "left-1/2 w-72 -translate-x-1/2"
          )}
        >
          <span className="relative grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">
            <MaterialIcon name="shopping_cart" className="text-[18px]" />
            {cart.count ? (
              <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-inverse">
                {cart.count}
              </span>
            ) : null}
          </span>

          <span className="flex-1 truncate text-center font-semibold">
            {money(cart.total)}
          </span>

          <MaterialIcon name="chevron_right" className="text-[20px] text-muted/60 transition duration-200 group-hover:text-primary" />
        </button>

      ) : null}
    </>
  );
}
