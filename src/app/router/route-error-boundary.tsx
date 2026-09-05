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

/**
 * Yangi deploy chiqqach, ochiq turgan eski tab endi serverda yo'q JS
 * chunkini so'raydi — server SPA fallback (HTML) qaytaradi, brauzer buni
 * "module script" sifatida rad etadi. Foydalanuvchi buni tushunmaydi va
 * qo'lda "Qayta yuklash"ni bosishi shart emas — bir marta o'zimiz
 * yangilaymiz. `sessionStorage` bayrog'i cheksiz reload siklidan saqlaydi
 * (masalan haqiqiy tarmoq uzilishi bo'lsa).
 */
const CHUNK_LOAD_ERROR =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Failed to load module script|Importing a module script failed/i;
const CHUNK_RELOAD_FLAG = "chunk-reload-attempted";

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidMount(): void {
    // Xatosiz sahifa muvaffaqiyatli ochildi — keyingi safar yangi eskirish bo'lsa yana avtomatik urinamiz.
    if (!this.state.error) sessionStorage.removeItem(CHUNK_RELOAD_FLAG);
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (!env.isProduction) console.error("Route render error", error, errorInfo);

    if (CHUNK_LOAD_ERROR.test(error.message) && !sessionStorage.getItem(CHUNK_RELOAD_FLAG)) {
      sessionStorage.setItem(CHUNK_RELOAD_FLAG, "1");
      window.location.reload();
    }
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
