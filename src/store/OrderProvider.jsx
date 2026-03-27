import { useCallback, useMemo, useState } from "react";
import { OrderContext } from "./order.context";
import { createOrder as apiCreateOrder } from "@/services/order.service";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart.store.js";

export function OrderProvider({ children }) {
  const cart = useCartStore();

  const [creating, setCreating] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const createOrder = useCallback(
    async ({ paymentMethod, note, voucherCode, campusId }) => {
      if (cart.lines.length === 0) {
        toast.error("Giỏ hàng trống");
        return null;
      }

      setCreating(true);
      try {
        const payload = {
          canteenId: cart.canteenId,
          items: cart.lines.map((l) => ({
            productId: l.productId._id,
            productName: l.productId.name ?? "",
            quantity: l.quantity ?? 1,
            price: l.productId.price ?? 0,
          })),
          payment: { method: paymentMethod },
          note,
          summary: {
            subtotal: cart.subtotal,
            tax: cart.tax,
            total: cart.total,
          },
        };

        // Add voucher data if present
        if (voucherCode) {
          payload.voucherCode = voucherCode;
        }
        if (campusId) {
          payload.campusId = campusId;
        }

        const res = await apiCreateOrder(payload);

        const order = res.data.order;

        setLastOrder(order);
        // For MoMo payment flow, the user is redirected to the payment gateway.
        // Do not show immediate "success" toast for pending MoMo orders —
        // only show success after payment confirmation.
        if (paymentMethod !== 'momo') {
          toast.success("Đặt hàng thành công");
        }
        return order;
      } catch (e) {
        toast.error("Đặt hàng thất bại");
        throw e;
      } finally {
        setCreating(false);
      }
    },
    [cart],
  );

  const value = useMemo(
    () => ({
      creating,
      lastOrder,
      createOrder,
    }),
    [creating, lastOrder, createOrder],
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}
