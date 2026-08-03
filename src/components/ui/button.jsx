import { forwardRef } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/shared/lib";

export const Button = forwardRef(function Button(
  {
    className,
    variant = "primary",
    size = "default",
    loading = false,
    children,
    disabled,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "button",
        `button--${variant}`,
        `button--${size}`,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoaderCircle className="spin" size={17} aria-hidden="true" />
      )}
      {children}
    </button>
  );
});
