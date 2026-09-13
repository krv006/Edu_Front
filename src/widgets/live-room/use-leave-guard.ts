import { useEffect } from "react";

export function useLeaveGuard(active: boolean): void {
  useEffect(() => {
    if (!active) return undefined;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);
}
