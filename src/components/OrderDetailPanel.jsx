import { useMemo } from "react";
import clsx from "clsx";
import { useCartStore } from "@/store/cart.store.js";
import { useRightPanel } from "@/store/rightPanel.store.js";
import CartItemCard from "@/components/cart/CartItemCard.jsx";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import { money } from "@/utils/currency.js";
import { ORDER_STATUS, ORDER_STATUS_BADGE, ORDER_STATUS_LABEL, ORDER_TIMELINE_STEPS, getTimelineIndex } from "@/constants/order.constant.js";

function normalizeLines(order) {
  const items = Array.isArray(order?.items) ? order.items : [];

  const subtotalFromModel = typeof order?.subTotal === "number" ? order.subTotal : null;
  const totalFromModel = typeof order?.totalAmount === "number" ? order.totalAmount : null;
  const discount = typeof order?.discount === "number" ? order.discount : 0;

  const inferredSubtotal = items.reduce((sum, it) => {
    const unit = Number(
      it.price ?? it?.productId?.price ?? 0
    );
    const qty = Number(it.quantity ?? it.qty ?? 1);
    return sum + unit * qty;
  }, 0);

  const subtotal = subtotalFromModel ?? order?.summary?.subtotal ?? inferredSubtotal;
  const total = totalFromModel ?? order?.summary?.total ?? subtotal; // if model doesn't include tax
  const tax = typeof order?.summary?.tax === "number" ? order.summary.tax : Math.max(total - (subtotal - discount), 0);

  const lines = items.map((it, idx) => {
    const unit = Number(it.price ?? it?.productId?.price ?? 0);
    const qty = Number(it.quantity ?? it.qty ?? 1);
    const name = it.productName ?? it.name ?? it?.productId?.name ?? "";
    const image = it.image ?? it?.productId?.image ?? "";
    return {
      lineId: `od-${order?._id || order?.id || "x"}-${idx}`,
      itemId: it.itemId ?? it.id ?? it?.productId?._id,
      qty,
      item: { name, image },
      unit,
      lineTotal: unit * qty,
    };
  });

  return { lines, subtotal, tax, total };
}

function StatusBadge({ status }) {
  const label = ORDER_STATUS_LABEL[status] || "—";
  const cls = ORDER_STATUS_BADGE[status]?.className || "bg-surfaceMuted text-muted";
  return <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", cls)}>{label}</span>;
}

function Timeline({ status }) {
  const idx = getTimelineIndex(status);
  const cancelled = status === ORDER_STATUS.cancelled;

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Timeline</h3>
        <span
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-semibold",
            cancelled ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"
          )}
        >
          {cancelled ? "Cancelled" : idx === 3 ? "Completed" : "In Progress"}
        </span>
      </div>

      <div className="rounded-3xl bg-surfaceMuted p-4">
        <div className="relative grid gap-6">
          <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />
          {ORDER_TIMELINE_STEPS.map((s, i) => {
            const active = i <= idx;
            const done = i < idx;

            const ring = cancelled
              ? active
                ? "bg-danger text-inverse"
                : "bg-surface text-muted"
              : done
                ? "bg-success text-inverse"
                : active
                  ? "bg-primary text-inverse"
                  : "bg-surface text-muted";

            const titleCls = cancelled
              ? active
                ? "text-danger"
                : "text-text"
              : done
                ? "text-success"
                : active
                  ? "text-primary"
                  : "text-text";

            return (
              <div key={s.key} className="grid grid-cols-[40px_1fr_auto] items-start gap-3">
                <div className={clsx("grid h-10 w-10 place-items-center rounded-full", ring)}>
                  <MaterialIcon name={s.icon} className="text-[18px]" />
                </div>

                <div className="grid">
                  <p className={clsx("text-sm font-semibold", titleCls)}>{s.title}</p>
                  <p className="text-xs text-muted">{s.subtitle}</p>
                </div>

                <span className="text-xs text-muted">—</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPanel({ className, allowCollapse = true }) {
  const cart = useCartStore();
  const panel = useRightPanel();

  const order = panel.order || null;
  const { lines, subtotal, tax, total } = useMemo(() => normalizeLines(order), [order]);

  if (!order) {
    return (
      <div className={clsx("flex h-full flex-col", className)}>
        <div className="flex items-center justify-between bg-white/70 backdrop-blur px-5 py-6">
          <h1 className="text-lg font-semibold text-text">Order</h1>
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
        <div className="flex-1 grid place-items-center p-8 text-center">
          <p className="text-sm font-semibold text-text">Chưa chọn đơn hàng</p>
        </div>
      </div>
    );
  }

  const status = order.status || ORDER_STATUS.pending;
  const canReorder = status === ORDER_STATUS.completed || status === ORDER_STATUS.cancelled;

  return (
    <div className={clsx("flex h-full flex-col", className)}>
      <div className="flex items-center justify-between bg-white/70 backdrop-blur px-5 py-6">
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-text">Order #{order.orderNumber || order.code || String(order?._id || "").slice(-6)}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-xs text-muted">Total: {money(total)}</p>
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

      <div className="flex-1 min-h-0 overflow-auto px-5 pt-5 grid gap-4">
        <div className="rounded-3xl bg-surfaceMuted p-3">
          <div className="grid gap-2">
            {lines.map((l) => (
              <CartItemCard key={l.lineId} line={l} readonly />
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-app-bg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-semibold text-text">{money(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted">Tax (8%)</span>
            <span className="font-semibold text-text">{money(tax)}</span>
          </div>
          <div className="my-4 h-px w-full border-b border-dashed border-divider" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text">Total</span>
            <span className="text-lg font-extrabold text-primary">{money(total)}</span>
          </div>
        </div>

        <Timeline status={status} />
      </div>

      {canReorder ? (
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
              cart.replaceFromOrder(order);
              panel.openCart();
            }}
          >
            <MaterialIcon name="replay" className="text-[18px]" />
            Re-order
          </button>
        </div>
      ) : null}
    </div>
  );
}
