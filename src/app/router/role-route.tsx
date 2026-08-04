import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers";
import { hasRole } from "@/modules/permission";
import { ROUTES } from "./route-paths";

export function RoleRoute({ allowedRoles }) {
  const { user } = useAuth();
  return hasRole(user, allowedRoles)
    ? <Outlet />
    : <Navigate to={ROUTES.errors.forbidden} replace />;
}
