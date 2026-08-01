import { createContext, useContext, useMemo, useState } from "react";
import { authService } from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());

  const value = useMemo(
    () => ({
      user,
      async login(credentials) {
        const nextUser = await authService.login(credentials);
        setUser(nextUser);
        return nextUser;
      },
      async logout() {
        await authService.logout();
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth AuthProvider ichida ishlatilishi kerak");
  return context;
}
