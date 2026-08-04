import type { ReactNode } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";
import { ToastProvider } from "./toast-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <Tooltip.Provider delayDuration={250}>
          {children}
          <ToastProvider />
        </Tooltip.Provider>
      </AuthProvider>
    </QueryProvider>
  );
}
