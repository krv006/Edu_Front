import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/modules/auth";
import { hasRole } from "@/modules/permission";
import type { Role } from "@/shared/constants";
import { ROUTES } from "@/shared/config";

export function RoleRoute({ allowedRoles }: { allowedRoles: Role[] }) {
  const { user } = useAuth();
  return hasRole(user, allowedRoles) ? <Outlet /> : <Navigate to={ROUTES.errors.forbidden} replace />;
}
