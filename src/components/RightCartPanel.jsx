import { useMemo, useState } from "react";
import clsx from "clsx";
import { useCartStore } from "@/store/cart.store.js";
import { useRightPanel } from "@/store/rightPanel.store.js";
import { useCampusStore } from "@/store/useCampusStore.js";
import MaterialIcon from "@/components/MaterialIcon.jsx";
import momoLogo from "@/assets/images/momo.png";
import sepayLogo from "@/assets/images/sepay.png";
import momoActiveLogo from "@/assets/images/momo-active.png";
import sepayActiveLogo from "@/assets/images/sepay-active.png";
import CartItemCard from "@/components/cart/CartItemCard.jsx";
import OrderSummaryCard from "@/components/cart/OrderSummaryCard.jsx";
import VoucherInput from "@/components/cart/VoucherInput.jsx";

export default function RightCartPanel({ className, allowCollapse = true }) {
  const cart = useCartStore();
  const panel = useRightPanel();
  const { selectedCampus } = useCampusStore();
  const hasItems = cart.count > 0;

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const itemCountLabel = useMemo(() => {
    const n = cart.count || 0;
    return `${n} item${n === 1 ? "" : "s"}`;
  }, [cart.count]);

  const deliveryFee = 0;

  // Calculate final total after discount
  const finalTotal = useMemo(() => {
    return Math.max(0, cart.total - discountAmount);
  }, [cart.total, discountAmount]);

  return (
    <div className={clsx("flex h-full flex-col", className)}>
      <div className="flex items-center justify-between bg-white/70 backdrop-blur px-5 py-6">
        <div className="grid">
          <h1 className="text-lg   font-semibold text-text">
            Your Order Summary
          </h1>
          <p className="text-xs text-muted">
            {hasItems ? itemCountLabel : "No items yet"}
          </p>
        </div>

        {allowCollapse ? (
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-muted transition duration-200 hover:text-primary"
            onClick={() => {
              panel.backToCart();
              panel.collapse();
            }}
            aria-label="Collapse panel"
          >
            <MaterialIcon name="chevron_left" className="text-[22px]" />
          </button>
        ) : null}
      </div>

      {/* Content area: items scroll; detail + payment pinned to bottom */}
      <div className="flex-1 min-h-0 flex flex-col">
        {!hasItems ? (
          <div className="flex-1 overflow-auto p-5">
            <div className="grid h-full place-items-center p-8 text-center">
              <div className="grid gap-3">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-slate-500">
                  <MaterialIcon name="shopping_cart" className="text-[54px]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">
                    Giỏ hàng chưa có món ăn
                  </p>
                  <p className="text-sm text-muted">Bạn chọn đi nhé.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Items (scroll) */}
            <div className="flex-1 min-h-0 overflow-auto px-5 pt-5">
              {/* <div chứa các item card - bg màu app-bg border-radius> */}
              <div className="rounded-3xl bg-surfaceMuted p-3">
                <div className="grid gap-2">
                  {cart.lines.map((l) => {
                    const id = l?.productId?._id ?? l?.productId;
                    const unit = l?.productId?.price ?? 0;
                    const qty = l?.quantity ?? 1;
                    const cardLine = {
                      lineId: id,
                      itemId: id,
                      qty,
                      unit,
                      lineTotal: unit * qty,
                      item: {
                        name: l?.productId?.name,
                        image: l?.productId?.image,
                      },
                    };
                    return (
                      <CartItemCard
                        key={id}
                        line={cardLine}
                        readonly={false}
                        onDec={() => cart.decLine(id)}
                        onInc={() => cart.incLine(id)}
                        onRemove={() => cart.removeLine(id)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom blocks */}
            <div className="mt-auto px-5 pb-5 pt-4 grid gap-4">
              {/* Voucher Input */}
              <div className="grid gap-2">
                <h3 className="text-sm font-semibold text-text">Mã giảm giá</h3>
                <VoucherInput
                  subtotal={cart.subtotal}
                  items={cart.lines}
                  campusId={selectedCampus}
                  appliedVoucher={appliedVoucher}
                  discountAmount={discountAmount}
                  onApply={(voucher, amount) => {
                    setAppliedVoucher(voucher);
                    setDiscountAmount(amount);
                  }}
                  onRemove={() => {
                    setAppliedVoucher(null);
                    setDiscountAmount(0);
                  }}
                />
              </div>

              <OrderSummaryCard
                subtotal={cart.subtotal}
                tax={cart.tax}
                discount={discountAmount}
                deliveryFee={deliveryFee}
                total={finalTotal}
              />
            </div>
          </>
        )}
      </div>

      {hasItems ? (
        <div className="bg-white/70 backdrop-blur px-5 py-4">
          <button
            type="button"
            className={clsx(
              "flex h-12 w-full items-center justify-center cursor-pointer",
              "rounded-2xl text-sm font-semibold text-inverse",
              "bg-[linear-gradient(135deg,var(--primary),var(--primary-hover))]",
              "shadow-card transition duration-200",
              "hover:shadow-lift hover:scale-[1.02] hover:ring-2 hover:ring-primary/20 active:scale-[0.99]",
            )}
            onClick={() => {
              const draft = {
                id: `draft-${Date.now()}`,
                code: "DRAFT",
                status: "pending",
                createdAt: new Date().toISOString(),
                items: (cart.lines || []).map((l) => ({
                  itemId: l?.productId?._id ?? l?.productId,
                  qty: l?.quantity ?? 1,
                  name: l?.productId?.name ?? "",
                  price: l?.productId?.price ?? 0,
                  image: l?.productId?.image ?? "",
                })),
                summary: {
                  subtotal: cart.subtotal,
                  tax: cart.tax,
                  discount: discountAmount,
                  total: finalTotal,
                },
                // Voucher data for checkout
                voucherCode: appliedVoucher?.code || null,
                campusId: selectedCampus || null,
              };

              panel.openPayment?.(draft);
            }}
          >
            Continue to order
          </button>
        </div>
      ) : null}
    </div>
  );
}
