import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers";
import { LoadingFallback, RouteState } from "@/shared/ui";
import { ROUTES } from "./route-paths";

export function ProtectedRoute() {
  const { user, isInitializing, initializationError, retrySession } = useAuth();
  const location = useLocation();
  if (isInitializing) return <LoadingFallback />;
  if (initializationError) {
    return (
      <RouteState
        eyebrow="ALOQA XATOSI"
        title="Sessiyani tekshirib bo‘lmadi"
        description={initializationError.message}
        actionLabel="Qayta urinish"
        onAction={retrySession}
      />
    );
  }
  return user ? (
    <Outlet />
  ) : (
    <Navigate
      to={ROUTES.auth.login}
      replace
      state={{ from: location.pathname }}
    />
  );
}
