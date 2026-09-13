import { Navigate, Outlet } from "react-router-dom";
import { resolveHomeRoute, useAuth } from "@/modules/auth";
import { hasRole } from "@/modules/permission";
import type { Role } from "@/shared/constants";
import { ROUTES } from "@/shared/config";

export function RoleRoute({ allowedRoles }: { allowedRoles: Role[] }) {
  const { user } = useAuth();
  if (hasRole(user, allowedRoles)) return <Outlet />;

  const home = user ? resolveHomeRoute(user) : null;

  if (!home || home === ROUTES.auth.login) {
    return <Navigate to={ROUTES.errors.forbidden} replace />;
  }
  return <Navigate to={home} replace />;
}
