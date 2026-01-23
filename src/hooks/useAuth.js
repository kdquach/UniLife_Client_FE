import { useAuthStore } from "@/store/auth.store.js";

export function useAuth() {
  return useAuthStore();
}
