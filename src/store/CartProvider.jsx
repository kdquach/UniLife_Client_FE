import { useMemo, useState } from "react";
import { CartContext } from "./cart.context";
import { MENU_ITEMS } from "@/pages/Menu/menu.data";

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]);

  const cartLines = useMemo(() => {
    return lines.map((l) => {
      const item = MENU_ITEMS.find((x) => x.id === l.itemId);
      const unit = item?.price || 0;
      return {
        ...l,
        item,
        unit,
        lineTotal: unit * l.qty,
      };
    });
  }, [lines]);

  const count = useMemo(() => cartLines.reduce((sum, l) => sum + l.qty, 0), [cartLines]);
  const subtotal = useMemo(() => cartLines.reduce((sum, l) => sum + l.lineTotal, 0), [cartLines]);
  const tax = useMemo(() => subtotal * 0.08, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const value = useMemo(
    () => ({
      lines,
      cartLines,
      count,
      subtotal,
      tax,
      total,
      addItem: (itemId, qty = 1) => {
        const lineId = `line-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setLines((prev) => [{ lineId, itemId, qty }, ...prev]);
      },
      incLine: (lineId) => setLines((prev) => prev.map((l) => (l.lineId === lineId ? { ...l, qty: l.qty + 1 } : l))),
      decLine: (lineId) =>
        setLines((prev) =>
          prev
            .map((l) => (l.lineId === lineId ? { ...l, qty: Math.max(1, l.qty - 1) } : l))
            .filter((l) => l.qty > 0)
        ),
      removeLine: (lineId) => setLines((prev) => prev.filter((l) => l.lineId !== lineId)),
      clear: () => setLines([]),
      replaceFromOrder: (order) => {
        const raw = order?.items || order?.lines || [];
        if (!Array.isArray(raw)) {
          setLines([]);
          return;
        }

        const next = raw
          .map((it) => {
            const itemId = it?.itemId ?? it?.id ?? it?.productId ?? it?.menuItemId;
            const qty = it?.qty ?? it?.quantity ?? it?.count ?? 1;
            if (!itemId) return null;
            const lineId = `line-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            return { lineId, itemId, qty: Number(qty) || 1 };
          })
          .filter(Boolean);

        setLines(next);
      },
    }),
    [lines, cartLines, count, subtotal, tax, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
