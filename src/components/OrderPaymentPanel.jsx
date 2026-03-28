import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useSearchParams } from "react-router-dom";
import { useCartStore } from "@/store/cart.store.js";
import { useRightPanel } from "@/store/rightPanel.store.js";
import { useOrderStore } from "@/store/order.store.js";
import { money } from "@/utils/currency.js";
import { paymentMomo } from "@/services/payment.service.js";
import {
  cleanupFailedPaymentOrder,
  getOrderById,
} from "@/services/order.service.js";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import CartItemCard from "@/components/cart/CartItemCard.jsx";
import OrderSuccessModal from "@/components/order/OrderSuccessModal.jsx";

// Images
import momoLogo from "@/assets/images/momo.png";
import sepayLogo from "@/assets/images/sepay.png";
import momoActiveLogo from "@/assets/images/momo-active.png";
import sepayActiveLogo from "@/assets/images/sepay-active.png";

function normalizeLines(lines = []) {
  const items = Array.isArray(lines) ? lines : [];
  return items.map((it, idx) => {
    const unit = Number(it?.productId?.price) || 0;
    const qty = Number(it?.quantity) || 1;
    return {
      lineId: `pay-${idx}`,
      itemId: it?.productId?._id,
      qty,
      item: {
        name: it?.productId?.name || "Sản phẩm",
        image: it?.productId?.image,
      },
      unit,
      lineTotal: unit * qty,
    };
  });
}

export default function OrderPaymentPanel({ className, allowCollapse = true }) {
  const cart = useCartStore();
  const panel = useRightPanel();
  const orderStore = useOrderStore();

  const [searchParams, setSearchParams] = useSearchParams();

  /* ---------- MoMo Callback result ---------- */
  const paymentResult = useMemo(() => {
    return {
      orderId: searchParams.get("orderId"),
      status: searchParams.get("status"), // completed | failed
    };
  }, [searchParams]);

  /* ---------- state ---------- */
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [successOpen, setSuccessOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  /* ---------- data ---------- */
  const draft = panel.order;
  const lines = useMemo(() => normalizeLines(cart.lines), [cart.lines]);
  // Use discounted total from draft if available
  const total = draft?.summary?.total ?? cart.total;

  useEffect(() => {
    const id = paymentResult.orderId;
    if (!id) return;

    (async () => {
      if (paymentResult.status === "completed") {
        cart.clearCart();
        setSuccessOrder(
          (prev) =>
            prev ||
            orderStore.lastOrder || { _id: id, payment: { method: "momo" } },
        );
        setSuccessOpen(true);
      } else if (paymentResult.status === "failed") {
        try {
          await cleanupFailedPaymentOrder(id);
        } catch (err) {
          console.error("Failed to cleanup unpaid order after MoMo failure:", err);
        }
      }

      try {
        localStorage.removeItem("momoPendingOrderId");
        localStorage.removeItem("momoPendingOrderAt");
      } catch {
        // ignore
      }

      setSearchParams({});
    })();
  }, [paymentResult.orderId, paymentResult.status, cart, orderStore, setSearchParams]);

  /* ---------- handle MoMo ---------- */
  const handlePaymentMomo = async () => {
    try {
      // 1. Create pending order
      const created = await orderStore.createOrder({
        paymentMethod: "momo",
        voucherCode: draft?.voucherCode,
        campusId: draft?.campusId,
        summary: draft?.summary,
      });

      if (!created || !created._id) {
        console.error("Order creation failed for MoMo");
        return;
      }

      try {
        localStorage.setItem("momoPendingOrderId", String(created._id));
        localStorage.setItem("momoPendingOrderAt", String(Date.now()));
      } catch {
        // ignore
      }

      // 2. Init MoMo Transaction
      // Ensure we use the correct total amount (priority to summary.total)
      const payAmount = created.totalAmount ?? created.summary?.total ?? total;
      const resp = await paymentMomo({
        orderId: created._id,
        amount: payAmount,
      });

      const payUrl = resp?.result?.payUrl || resp?.payUrl;
      if (payUrl) {
        window.location.href = payUrl;
      } else {
        console.error("No payUrl received from MoMo", resp);
        try {
          await cleanupFailedPaymentOrder(created._id);
        } catch (err) {
          console.error("Cleanup failed after MoMo init failure:", err);
        }
      }
    } catch (err) {
      console.error("MoMo payment process failed:", err);
    }
  };

  if (!draft) {
    return (
      <div className={clsx("flex h-full flex-col", className)}>
        <div className="flex items-center justify-between bg-white/70 backdrop-blur px-5 py-6">
          <div className="grid">
            <h1 className="text-lg font-semibold text-text">Thanh toán</h1>
            <p className="text-xs text-muted">Chưa có đơn nháp</p>
          </div>
          {allowCollapse && (
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full text-muted hover:text-primary transition"
              onClick={() => panel.collapse()}
            >
              <MaterialIcon name="chevron_left" className="text-[22px]" />
            </button>
          )}
        </div>
        <div className="flex-1 grid place-items-center p-8 text-center">
          <div className="grid gap-2">
            <p className="text-sm font-semibold text-text">
              Chưa có đơn để thanh toán
            </p>
            <button
              type="button"
              className="mt-2 h-10 rounded-2xl bg-primary px-4 text-sm font-semibold text-inverse"
              onClick={() => panel.openCart()}
            >
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
        <OrderSuccessModal
          open={successOpen}
          order={successOrder || orderStore.lastOrder}
          onClose={() => setSuccessOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className={clsx("flex h-full flex-col", className)}>
      <div className="flex items-center justify-between bg-white/70 backdrop-blur px-5 py-6">
        <div className="grid">
          <h1 className="text-lg font-semibold text-text">
            Thanh toán đơn hàng
          </h1>
          <p className="text-xs text-muted">Tổng tiền: {money(total)}</p>
        </div>
        {allowCollapse && (
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-muted hover:text-primary transition"
            onClick={() => panel.collapse()}
          >
            <MaterialIcon name="chevron_left" className="text-[22px]" />
          </button>
        )}
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
              <span className="text-lg font-extrabold text-primary">
                {money(total)}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <h3 className="text-sm font-semibold text-text">
              Phương thức thanh toán
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "cash", label: "Tiền mặt", icon: "payments" },
                {
                  key: "momo",
                  label: "MoMo",
                  logo: momoLogo,
                  activeLogo: momoActiveLogo,
                },
                {
                  key: "sepay",
                  label: "Sepay",
                  logo: sepayLogo,
                  activeLogo: sepayActiveLogo,
                },
              ].map((m) => {
                const active = paymentMethod === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setPaymentMethod(m.key)}
                    className={clsx(
                      "grid h-14 place-items-center rounded-xl px-2 transition",
                      active
                        ? "bg-primary text-inverse shadow-sm"
                        : "bg-surfaceMuted text-text hover:bg-surfaceMuted/80",
                    )}
                  >
                    <span className="grid place-items-center">
                      <span className="grid h-8 w-8 place-items-center rounded-md">
                        {m.logo ? (
                          <img
                            src={active ? m.activeLogo : m.logo}
                            alt={m.label}
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          <MaterialIcon
                            name={m.icon}
                            className={clsx(
                              "text-[18px]",
                              active ? "text-inverse" : "text-muted",
                            )}
                          />
                        )}
                      </span>
                      <span
                        className={clsx(
                          "text-[11px] font-semibold",
                          active ? "text-inverse" : "text-text",
                        )}
                      >
                        {m.label}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-3xl bg-surfaceMuted p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Mã QR</h3>
              <span className="text-xs text-muted">Chế độ phát triển</span>
            </div>
            <div className="mt-3 grid place-items-center rounded-2xl bg-white p-5 shadow-sm">
              <div className="grid h-44 w-44 place-items-center rounded-2xl border border-dashed border-border bg-surface">
                <span className="text-xs font-semibold text-muted">
                  QR tạm thời
                </span>
              </div>
              <p className="mt-2 text-[10px] text-muted uppercase tracking-wider">
                Sẽ hiển thị sau khi hoàn tất thanh toán
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur px-5 py-4">
        <button
          type="button"
          className={clsx(
            "flex h-12 w-full items-center justify-center",
            "rounded-2xl text-sm font-semibold text-inverse",
            "bg-[linear-gradient(135deg,var(--primary),var(--primary-hover))]",
            "shadow-card transition duration-200",
            "hover:shadow-lift active:scale-[0.98]",
          )}
          onClick={async () => {
            try {
              if (paymentMethod === "momo") {
                await handlePaymentMomo();
                return;
              }

              const created = await orderStore.createOrder({
                paymentMethod,
                voucherCode: draft?.voucherCode,
                campusId: draft?.campusId,
                summary: draft?.summary,
              });

              if (created) {
                let full = created;
                try {
                  const resp = await getOrderById(created._id);
                  full = resp?.data?.order || created;
                } catch (e) {
                  console.warn("Fallback to created data:", e);
                }
                setSuccessOrder(full);
                setSuccessOpen(true);
                cart.clearCart();
              }
            } catch (err) {
              console.error("Order completion failed:", err);
            }
          }}
        >
          Tôi đã thanh toán
        </button>
      </div>

      <OrderSuccessModal
        open={successOpen}
        order={successOrder || orderStore.lastOrder}
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
