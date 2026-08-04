import { useEffect } from "react";

/** Jonli darsda ekan sahifani yopishdan oldin brauzer tasdiq so‘raydi. */
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
