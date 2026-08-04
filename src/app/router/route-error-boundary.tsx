import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { env } from "@/shared/config";
import { RouteState } from "@/shared/ui/legacy";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (!env.isProduction) console.error("Route render error", error, errorInfo);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <RouteState
        eyebrow="XATOLIK"
        title="Sahifani ochib bo‘lmadi"
        description="Kutilmagan xatolik yuz berdi. Sahifani yangilab qayta urinib ko‘ring."
        action={
          <button className="button button--primary" onClick={() => window.location.reload()}>
            Qayta yuklash
          </button>
        }
      />
    );
  }
}

/** `key={location.key}` — yangi marshrutga o'tganda xato holati tozalanadi. */
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  return <ErrorBoundary key={location.key}>{children}</ErrorBoundary>;
}
