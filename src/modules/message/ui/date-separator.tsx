import type { ReactNode } from "react";

export function DateSeparator({ children }: { children: ReactNode }) {
  return (
    <div className="date-separator">
      <span>{children}</span>
    </div>
  );
}
