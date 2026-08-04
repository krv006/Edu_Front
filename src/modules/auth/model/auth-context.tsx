import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppError, SESSION_EXPIRED_EVENT, tokenStorage } from "@/shared/api";
import type { AuthContextValue, LoginCredentials } from "@/shared/types";
import { configureAuthRefresh } from "../lib/auth-session";
import { useLoginMutation, useLogoutMutation } from "./auth.mutations";
import { useCurrentUserQuery } from "./auth.queries";
import { AUTH_STATUS, resolveAuthStatus } from "./auth.store";

configureAuthRefresh();

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const hasSession = tokenStorage.hasSession();
  const currentUser = useCurrentUserQuery({ enabled: hasSession });
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const user = hasSession ? (currentUser.data ?? null) : null;
  const status = resolveAuthStatus({
    hasSession,
    isPending: currentUser.isPending,
    user,
    error: currentUser.error,
  });

  // Refresh muvaffaqiyatsiz bo'lganda API qatlami shu hodisani yuboradi.
  useEffect(() => {
    const expireSession = () => {
      queryClient.clear();
    };
    globalThis.addEventListener?.(SESSION_EXPIRED_EVENT, expireSession);
    return () => globalThis.removeEventListener?.(SESSION_EXPIRED_EVENT, expireSession);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === AUTH_STATUS.AUTHENTICATED,
      isInitializing: status === AUTH_STATUS.INITIALIZING,
      initializationError:
        status === AUTH_STATUS.ERROR && currentUser.error instanceof AppError
          ? currentUser.error
          : null,
      async login(credentials: LoginCredentials) {
        return loginMutation.mutateAsync(credentials);
      },
      async logout() {
        await logoutMutation.mutateAsync();
      },
      retrySession: () => {
        void currentUser.refetch();
      },
    }),
    [currentUser, loginMutation, logoutMutation, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth AuthProvider ichida ishlatilishi kerak");
  return context;
}
