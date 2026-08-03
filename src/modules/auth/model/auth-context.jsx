import { createContext, useContext, useMemo, useState } from "react";
import { authApi } from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authApi.getCurrentUser());
  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    async login(credentials) { const nextUser = await authApi.login(credentials); setUser(nextUser); return nextUser; },
    async logout() { await authApi.logout(); setUser(null); },
  }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth AuthProvider ichida ishlatilishi kerak");
  return context;
}
