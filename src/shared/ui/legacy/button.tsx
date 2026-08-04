import { forwardRef, type ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/shared/lib";

export type LegacyButtonVariant = "primary" | "secondary" | "ghost";
export type LegacyButtonSize = "default" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: LegacyButtonVariant;
  size?: LegacyButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "default", loading = false, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn("button", `button--${variant}`, `button--${size}`, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle className="spin" size={17} aria-hidden="true" />}
      {children}
    </button>
  );
});
