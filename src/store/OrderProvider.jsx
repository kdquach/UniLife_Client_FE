import { useCallback, useMemo, useState } from "react";
import { OrderContext } from "./order.context";
import { createOrder as apiCreateOrder } from "@/services/order.service";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart.store.js";

export function OrderProvider({ children }) {
  const cart = useCartStore();

  const [creating, setCreating] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const createOrder = useCallback(async ({ paymentMethod, note }) => {
    if (cart.lines.length === 0) {
      toast.error("Giỏ hàng trống");
      return null;
    }

    setCreating(true);
    try {
      const payload = {
        canteenId: cart.canteenId,
        items: cart.lines.map(l => ({
          productId: l.productId._id,
          productName: l.productId.name ?? '',
          quantity: l.quantity ?? 1,
          price: l.productId.price ?? 0
        })),
        payment: { method: paymentMethod },
        note,
        summary: {
          subtotal: cart.subtotal,
          tax: cart.tax,
          total: cart.total,
        },
      };

      const res = await apiCreateOrder(payload);
      const order = res.data.order;

      setLastOrder(order);

      // 🔥 Quan trọng: clear cart SAU khi order thành công
      await cart.clearCart();

      toast.success("Đặt hàng thành công");
      return order;
    } catch (e) {
      toast.error("Đặt hàng thất bại");
      throw e;
    } finally {
      setCreating(false);
    }
  }, [cart]);

  const value = useMemo(() => ({
    creating,
    lastOrder,
    createOrder,
  }), [creating, lastOrder, createOrder]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}
