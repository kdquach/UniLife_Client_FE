import { useContext } from "react";
import { OrderContext } from "./order.context";

export function useOrderStore() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrderStore must be used inside OrderProvider");
  return ctx;
}
