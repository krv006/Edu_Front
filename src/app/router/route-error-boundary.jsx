import { Component } from "react";
import { useLocation } from "react-router-dom";
import { env } from "@/shared/config";
import { RouteState } from "@/shared/ui";

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    if (!env.isProduction) console.error("Route render error", error, errorInfo);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <RouteState
        eyebrow="XATOLIK"
        title="Sahifani ochib bo‘lmadi"
        description="Kutilmagan xatolik yuz berdi. Sahifani yangilab qayta urinib ko‘ring."
        action={<button className="button button--primary" onClick={() => window.location.reload()}>Qayta yuklash</button>}
      />
    );
  }
}

export function RouteErrorBoundary({ children }) {
  const location = useLocation();
  return <ErrorBoundary key={location.key}>{children}</ErrorBoundary>;
}
