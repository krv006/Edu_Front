import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers";
import { LoadingFallback, RouteState } from "@/shared/ui/legacy";
import { resolveHomeRoute } from "./resolve-home-route";

export function PublicRoute() {
  const { user, isInitializing, initializationError, retrySession } = useAuth();
  if (isInitializing) return <LoadingFallback />;
  if (initializationError) {
    return (
      <RouteState
        eyebrow="ALOQA XATOSI"
        title="Sessiyani tiklab bo‘lmadi"
        description={initializationError.message}
        actionLabel="Qayta urinish"
        onAction={retrySession}
      />
    );
  }
  return user ? <Navigate to={resolveHomeRoute(user)} replace /> : <Outlet />;
}
