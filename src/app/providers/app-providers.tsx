import { useEffect, type ReactNode } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useAuthStore } from "@/modules/auth";
import { QueryProvider } from "./query-provider";
import { ToastProvider } from "./toast-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <QueryProvider>
      <Tooltip.Provider delayDuration={250}>
        {children}
        <ToastProvider />
      </Tooltip.Provider>
    </QueryProvider>
  );
}
