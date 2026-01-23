import { useMemo, useState } from "react";
import clsx from "clsx";
import { useCartStore } from "@/store/cart.store.js";
import { useRightPanel } from "@/store/rightPanel.store.js";
import { money } from "@/utils/currency.js";
import { addOrder } from "@/utils/ordersStorage.js";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import CartItemCard from "@/components/cart/CartItemCard.jsx";
import OrderSuccessModal from "@/components/order/OrderSuccessModal.jsx";
import { ORDER_STATUS } from "@/constants/order.constant.js";

function buildFinalOrderFromDraft(draft, paymentMethod) {
  const now = new Date();
  const ts = now.getTime();
  const code = `ORD-${String(ts).slice(-6)}`;

  const items = Array.isArray(draft?.items) ? draft.items : [];
  const subtotal = draft?.summary?.subtotal ?? items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);
  const tax = draft?.summary?.tax ?? subtotal * 0.08;
  const total = draft?.summary?.total ?? subtotal + tax;

  return {
    id: `order-${ts}`,
    code,
    status: ORDER_STATUS.confirmed,
    createdAt: now.toISOString(),
    paymentMethod,
    items: items.map((it) => ({
      itemId: it.itemId ?? it.id,
      qty: it.qty ?? 1,
      name: it.name,
      price: it.price ?? 0,
      image: it.image ?? "",
    })),
    summary: { subtotal, tax, total },
  };
}

function normalizeLines(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  return items.map((it, idx) => {
    const unit = Number(it.price) || 0;
    const qty = Number(it.qty) || 1;
    return {
      lineId: `pay-${order?.id || "x"}-${idx}`,
      itemId: it.itemId ?? it.id,
      qty,
      item: { name: it.name, image: it.image },
      unit,
      lineTotal: unit * qty,
    };
  });
}

export default function OrderPaymentPanel({ className, allowCollapse = true }) {
  const cart = useCartStore();
  const panel = useRightPanel();

  const draft = panel.order;
  const lines = useMemo(() => normalizeLines(draft), [draft]);

  const total = draft?.summary?.total ?? draft?.total ?? 0;

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [successOpen, setSuccessOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  if (!draft) {
    return (
      <div className={clsx("flex h-full flex-col", className)}>
        <div className="flex items-center justify-between bg-white/70 backdrop-blur px-5 py-6">
          <div className="grid">
            <h1 className="text-lg font-semibold text-text">Payment</h1>
            <p className="text-xs text-muted">No order draft</p>
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
        <div className="flex-1 grid place-items-center p-8 text-center">
          <div className="grid gap-2">
            <p className="text-sm font-semibold text-text">Chưa có đơn để thanh toán</p>
            <button
              type="button"
              className="mt-2 h-10 rounded-2xl bg-primary px-4 text-sm font-semibold text-inverse"
              onClick={() => panel.openCart()}
            >
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("flex h-full flex-col", className)}>
      <div className="flex items-center justify-between bg-white/70 backdrop-blur px-5 py-6">
        <div className="grid">
          <h1 className="text-lg font-semibold text-text">Order Payment</h1>
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

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-auto px-5 pt-5">
          <div className="rounded-3xl bg-surfaceMuted p-3">
            <div className="grid gap-2">
              {lines.map((l) => (
                <CartItemCard key={l.lineId} line={l} readonly />
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-3xl bg-app-bg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Tổng tiền</span>
              <span className="text-lg font-extrabold text-primary">{money(total)}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <h3 className="text-sm font-semibold text-text">Payment method</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "COD", label: "COD", icon: "payments" },
                { key: "QR", label: "QR", icon: "qr_code" },
                { key: "Sepay", label: "Sepay", icon: "account_balance_wallet" },
              ].map((m) => {
                const active = paymentMethod === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setPaymentMethod(m.key)}
                    className={clsx(
                      "grid h-14 place-items-center rounded-xl px-2 transition",
                      active ? "bg-primary text-inverse" : "bg-surfaceMuted text-text hover:bg-surfaceMuted/80"
                    )}
                  >
                    <span className="grid place-items-center">
                      <MaterialIcon name={m.icon} className={clsx("text-[18px]", active ? "text-inverse" : "text-muted")} />
                      <span className={clsx("text-[11px] font-semibold", active ? "text-inverse" : "text-text")}>{m.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-3xl bg-surfaceMuted p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">QR Code</h3>
              <span className="text-xs text-muted">DEV mode</span>
            </div>
            <div className="mt-3 grid place-items-center rounded-2xl bg-white p-5">
              <div className="grid h-44 w-44 place-items-center rounded-2xl border border-border bg-surface">
                <span className="text-xs font-semibold text-muted">QR placeholder</span>
              </div>
              <p className="mt-2 text-xs text-muted">TODO(api): generate QR from orderId</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur px-5 py-4 grid gap-2">
        <button
          type="button"
          className={clsx(
            "flex h-12 w-full items-center justify-center",
            "rounded-2xl text-sm font-semibold text-inverse",
            "bg-[linear-gradient(135deg,var(--primary),var(--primary-hover))]",
            "shadow-card transition duration-200",
            "hover:shadow-lift active:scale-[0.99]"
          )}
          onClick={() => {
            const finalOrder = buildFinalOrderFromDraft(draft, paymentMethod);

            // DEV: mark paid -> confirmed + save to local storage.
            addOrder(finalOrder);

            // clear cart after successful payment
            cart.clear();

            setSuccessOrder(finalOrder);
            setSuccessOpen(true);
          }}
        >
          Tôi đã thanh toán
        </button>
      </div>

      <OrderSuccessModal
        open={successOpen}
        order={successOrder}
        onClose={() => setSuccessOpen(false)}
        onViewOrder={() => {
          if (!successOrder) return;
          setSuccessOpen(false);
          panel.openOrderDetail(successOrder);
        }}
      />
    </div>
  );
}
