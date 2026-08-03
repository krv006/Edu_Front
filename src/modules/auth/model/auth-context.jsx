import { createContext, useContext, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { tokenStorage } from "@/shared/api";
import { configureAuthRefresh } from "../lib/auth-session";
import { useLoginMutation, useLogoutMutation } from "./auth.mutations";
import { useCurrentUserQuery } from "./auth.queries";
import { AUTH_STATUS, resolveAuthStatus } from "./auth.store";

configureAuthRefresh();
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const hasSession = tokenStorage.hasSession();
  const currentUser = useCurrentUserQuery({ enabled: hasSession });
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const user = hasSession ? currentUser.data ?? null : null;
  const status = resolveAuthStatus({
    hasSession,
    isPending: currentUser.isPending,
    user,
    error: currentUser.error,
  });

  useEffect(() => {
    const expireSession = () => {
      queryClient.clear();
    };
    globalThis.addEventListener?.("fokus:session-expired", expireSession);
    return () =>
      globalThis.removeEventListener?.("fokus:session-expired", expireSession);
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === AUTH_STATUS.AUTHENTICATED,
      isInitializing: status === AUTH_STATUS.INITIALIZING,
      initializationError:
        status === AUTH_STATUS.ERROR ? currentUser.error : null,
      async login(credentials) {
        return loginMutation.mutateAsync(credentials);
      },
      async logout() {
        await logoutMutation.mutateAsync();
      },
      retrySession: currentUser.refetch,
    }),
    [
      currentUser.error,
      currentUser.refetch,
      loginMutation,
      logoutMutation,
      status,
      user,
    ]
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
