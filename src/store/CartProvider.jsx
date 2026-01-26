import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CartContext } from "./cart.context";
import { MENU_ITEMS } from "@/pages/Menu/menu.data";
import { useCampusStore } from "@/store/useCampusStore";
// Import API cart
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  deleteCartItem,
  clearCart as apiClearCart,
} from "@/services/cart.service";

export function CartProvider({ children }) {
  const { selectedCanteen } = useCampusStore();

  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canteenId, setCanteenId] = useState('')

  /**
 * ===============================
 * 1️ LOAD CART KHI APP START
 * ===============================
 */

  useEffect(() => {
    let mounted = true // tránh setState khi component unmount
    async function loadCart() {
      setLoading(true)
      try {
        const res = await getCart(selectedCanteen?.id || canteenId)
        if (mounted) {
          setCanteenId(res.data.cart?.canteenId?._id || selectedCanteen?.id || '')
          setLines(res.data.cart?.items || [])
        }

      } catch (error) {
        setError(error)
        setLines([])
      } finally {
        setLoading(false)
      }
    }
    loadCart()
    return () => {
      mounted = false
    }
  }, [selectedCanteen?.id])


  /**
   * Hàm reload cart (dùng khi rollback)
   */

  const reloadCart = useCallback(async () => {
    try {
      const res = await getCart(selectedCanteen?.id || canteenId);
      setCanteenId(res.data.cart?.canteenId?._id || selectedCanteen?.id || '')
      setLines(res.data.cart?.items || []);
    } catch (err) {
      console.error("Reload cart failed", err);
    }
  }, [selectedCanteen?.id, canteenId]);

  /**
 * ===============================
 * 2️ TÍNH TOÁN TỪ CART
 * ===============================
 */
  // Tổng số lượng sản phẩm trong giỏ
  const count = useMemo(() => {
    return lines.reduce((sum, l) => sum + Number(l?.quantity || 0), 0);
  }, [lines]);

  // Tạm tính (chưa tax)
  const subtotal = useMemo(() => {
    return lines.reduce(
      (sum, l) => sum + l.productId.price * l.quantity,
      0
    );
  }, [lines]);

  // Thuế 8%
  const tax = useMemo(() => subtotal * 0.08, [subtotal]);

  // Tổng tiền
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  /**
 * ===============================
 * 3️ ADD ITEM – OPTIMISTIC UI
 * ===============================
 */

  const addItem = useCallback(async (productId, qty = 1) => {
    //  1. Cập nhật UI ngay (KHÔNG CHỜ API)
    setLines((prev) => {
      const found = prev.find((l) => l.productId._id === productId)

      if (found) {
        return prev.map((l) => (
          l.productId === productId ? { ...l, quantity: l.quantity + qty } : l
        ))
      }
      return [
        {
          productId,
          quantity: qty,
          product: {}
        },
        ...prev
      ]
    })
    //  2. Gọi API để sync backend
    try {
      const res = await addToCart(productId, qty);
      // đồng bộ lại cho chắc
      setCanteenId(res.data.cart.canteenId._id)
      setLines(res.data.cart.items);
      toast.success("Đã thêm vào giỏ hàng", {
        description: "Món ăn đã được thêm thành công.",
      });
    } catch (err) {
      // 3. Nếu lỗi → rollback
      reloadCart();
      const message = err?.response?.data?.message || err?.message || "Thêm vào giỏ thất bại";
      // Trường hợp khác canteen từ BE
      if (message.toLowerCase().includes("different canteens")) {
        toast.error("Không thể thêm vào giỏ", {
          description: "Sản phẩm thuộc căng tin khác. Vui lòng xóa giỏ hiện tại trước khi thêm.",
        });
      } else {
        toast.error("Thêm vào giỏ thất bại", { description: message });
      }
    }
  }, [reloadCart])

  /**
 * ===============================
 * 4️ TĂNG SỐ LƯỢNG
 * ===============================
 */
  const incLine = useCallback(async (productId) => {
    setLines((prev) =>
      prev.map((l) =>
        l.productId._id === productId
          ? { ...l, quantity: l.quantity + 1 }
          : l
      )
    );

    try {
      const current = lines.find((l) => l.productId._id === productId);
      await updateCartItemQuantity(productId, current.quantity + 1, canteenId);
    } catch {
      reloadCart();
    }
  }, [lines, reloadCart, canteenId]);

  /**
   * ===============================
   * 5️ GIẢM SỐ LƯỢNG
   * ===============================
   */
  const decLine = useCallback(async (productId) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.productId._id === productId
            ? { ...l, quantity: l.quantity - 1 }
            : l
        )
        .filter((l) => l.quantity > 0) // nếu =0 thì xóa
    );

    try {
      const current = lines.find((l) => l.productId._id === productId);
      await updateCartItemQuantity(productId, current.quantity - 1, canteenId);
    } catch {
      reloadCart();
    }
  }, [lines, reloadCart, canteenId]);

  /**
   * ===============================
   * 6️ XÓA ITEM
   * ===============================
   */
  const removeLine = useCallback(async (productId) => {
    const backup = lines; // backup để rollback

    setLines((prev) =>
      prev.filter((l) => l.productId._id !== productId)
    );

    try {
      await deleteCartItem(productId, canteenId);
    } catch {
      setLines(backup);
    }
  }, [lines, canteenId]);

  const clearCart = useCallback(async () => {
    try {
      await apiClearCart(canteenId);   // clear backend
      setLines([]);           // clear UI
      setCanteenId("");
    } catch (e) {
      console.error("Clear cart failed", e);
    }
  }, [canteenId]);

  /**
    * ===============================
    * 7️ CONTEXT VALUE
    * ===============================
    */
  const value = useMemo(() => ({
    lines,
    loading,
    error,
    count,
    subtotal,
    tax,
    total,
    canteenId,
    addItem,
    incLine,
    decLine,
    removeLine,
    clearCart
  }), [
    lines,
    loading,
    error,
    count,
    subtotal,
    tax,
    total,
    canteenId,
    addItem,
    incLine,
    decLine,
    removeLine,
    clearCart
  ]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
