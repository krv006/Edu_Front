import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers";
import { ROUTES } from "./route-paths";

export function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  return user
    ? <Outlet />
    : <Navigate to={ROUTES.auth.login} replace state={{ from: location.pathname }} />;
}
