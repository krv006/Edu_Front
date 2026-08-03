import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers";
import { resolveHomeRoute } from "./resolve-home-route";

export function PublicRoute() {
  const { user } = useAuth();
  return user ? <Navigate to={resolveHomeRoute(user)} replace /> : <Outlet />;
}
