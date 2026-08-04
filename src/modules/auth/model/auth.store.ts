import type { AuthStatus, AuthUser } from "@/shared/types";

export const AUTH_STATUS = Object.freeze({
  ANONYMOUS: "anonymous",
  INITIALIZING: "initializing",
  AUTHENTICATED: "authenticated",
  ERROR: "error",
}) satisfies Record<string, AuthStatus>;

export interface ResolveAuthStatusInput {
  hasSession: boolean;
  isPending: boolean;
  user: AuthUser | null;
  error: unknown;
}

export function resolveAuthStatus({
  hasSession,
  isPending,
  user,
  error,
}: ResolveAuthStatusInput): AuthStatus {
  if (!hasSession) return AUTH_STATUS.ANONYMOUS;
  if (isPending) return AUTH_STATUS.INITIALIZING;
  if (error) return AUTH_STATUS.ERROR;
  return user ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.ANONYMOUS;
}
