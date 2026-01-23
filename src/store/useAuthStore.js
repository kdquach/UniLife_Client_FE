import { useContext } from "react";
import { AuthContext } from "./auth.context";

export function useAuthStore() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthStore must be used inside AuthProvider");
  return ctx;
}
