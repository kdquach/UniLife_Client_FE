import { useMemo } from "react";
import clsx from "clsx";
import { MENU_ITEMS } from "@/pages/Menu/menu.data";
import { useCartStore } from "@/store/cart.store.js";
import { useRightPanel } from "@/store/rightPanel.store.js";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import CartItemCard from "@/components/cart/CartItemCard.jsx";
import OrderSummaryCard from "@/components/cart/OrderSummaryCard.jsx";

function normalizeOrderItems(order) {
  const raw = order;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((it, index) => {
      const itemId = it?.itemId ?? it?.id ?? it?.productId ?? it?.menuItemId;
      const qty = it?.qty ?? it?.quantity ?? it?.count ?? 1;
      if (!itemId) return null;
      const item = MENU_ITEMS.find((x) => x.id === itemId) || null;
      const unit = it?.unit ?? item?.price ?? 0;
      const lineTotal = unit * (Number(qty) || 0);
      return {
        lineId: `order-${order?.id ?? order?.code ?? "x"}-${index}`,
        itemId,
        qty: Number(qty) || 1,
        item,
        unit,
        lineTotal,
      };
    })
    .filter(Boolean);
}

export default function RightOrderDetailPanel({ className, allowCollapse = true }) {
  const cart = useCartStore();
  const panel = useRightPanel();

  const order = panel.order || null;

  const lines = useMemo(() => normalizeOrderItems(order), [order]);

  const subtotal = typeof order?.subtotal === "number" ? order.subtotal : lines.reduce((sum, l) => sum + (l.lineTotal || 0), 0);
  const tax = typeof order?.tax === "number" ? order.tax : subtotal * 0.08;
  const total = typeof order?.total === "number" ? order.total : subtotal + tax;

  const discount = 0;
  const deliveryFee = 0;

  const title = order?.code ? `Order #${order.code}` : "Order";

  return (
    <div className={clsx("flex h-full flex-col", className)}>
      <div className="flex items-center justify-between bg-white/70 backdrop-blur px-5 py-6">
        <div className="grid">
          <h1 className="text-lg font-semibold text-text">{title}</h1>
          <p className="text-xs text-muted">{lines.length ? `${lines.length} item(s)` : "No items"}</p>
        </div>

        {allowCollapse ? (
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-muted transition duration-200 hover:text-primary"
            onClick={() => panel.collapse()}
            aria-label="Collapse panel"
          >
            <MaterialIcon name="chevron_left" className="text-[22px]" />
          </button>
        ) : null}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-auto px-5 pt-5">
          <div className="rounded-3xl bg-surfaceMuted p-3">
            <div className="grid gap-2">
              {lines.map((l) => (
                <CartItemCard key={l.lineId} line={l} readonly />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto px-5 pb-5 pt-4 grid gap-4">
          <OrderSummaryCard
            subtotal={subtotal}
            tax={tax}
            discount={discount}
            deliveryFee={deliveryFee}
            total={total}
          />
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur px-5 py-4">
        <button
          type="button"
          className={clsx(
            "flex h-12 w-full items-center justify-center gap-2",
            "rounded-2xl text-sm font-semibold text-inverse",
            "bg-[linear-gradient(135deg,var(--primary),var(--primary-hover))]",
            "shadow-card transition duration-200",
            "hover:shadow-lift active:scale-[0.99]"
          )}
          onClick={() => {
            if (!order) return;
            cart.replaceFromOrder?.(order);
            panel.openCart();
          }}
          disabled={!order || lines.length === 0}
        >
          <MaterialIcon name="replay" className="text-[18px]" />
          Re-order
        </button>
      </div>
    </div>
  );
}
