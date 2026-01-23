import { useContext } from "react";
import { CartContext } from "./cart.context";

export function useCartStore() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartStore must be used inside CartProvider");
  return ctx;
}
