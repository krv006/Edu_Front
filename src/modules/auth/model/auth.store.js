export const AUTH_STATUS = Object.freeze({
  ANONYMOUS: "anonymous",
  INITIALIZING: "initializing",
  AUTHENTICATED: "authenticated",
  ERROR: "error",
});

export function resolveAuthStatus({ hasSession, isPending, user, error }) {
  if (!hasSession) return AUTH_STATUS.ANONYMOUS;
  if (isPending) return AUTH_STATUS.INITIALIZING;
  if (error) return AUTH_STATUS.ERROR;
  return user ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.ANONYMOUS;
}
