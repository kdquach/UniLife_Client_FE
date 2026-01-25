// import { useMemo, useState } from "react";
// import { AuthContext } from "./auth.context";
// import { clearAccessToken, getAccessToken, setAccessToken } from "@/utils/storage";

// export function AuthProvider({ children }) {
//   const [token, setTokenState] = useState(getAccessToken());

//   const value = useMemo(
//     () => ({
//       token,
//       isAuthenticated: Boolean(token),
//       setToken: (t) => {
//         setAccessToken(t);
//         setTokenState(t || "");
//       },
//       logout: () => {
//         clearAccessToken();
//         setTokenState("");
//       },
//     }),
//     [token]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }
import { useMemo, useState, useEffect } from 'react';
import { AuthContext } from './auth.context';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/utils/storage';

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getAccessToken());
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('unilife_user');
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      setToken: (t, u) => {
        setAccessToken(t);
        setTokenState(t || '');
        if (u) {
          localStorage.setItem('unilife_user', JSON.stringify(u));
          setUser(u);
        }
      },
      logout: () => {
        clearAccessToken();
        localStorage.removeItem('unilife_user');
        setTokenState('');
        setUser(null);
      },
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
