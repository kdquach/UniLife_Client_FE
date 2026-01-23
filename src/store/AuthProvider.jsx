import { useMemo, useState } from "react";
import { AuthContext } from "./auth.context";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/utils/storage";

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getAccessToken());

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      setToken: (t) => {
        setAccessToken(t);
        setTokenState(t || "");
      },
      logout: () => {
        clearAccessToken();
        setTokenState("");
      },
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
