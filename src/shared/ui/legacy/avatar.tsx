import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn, initials } from "@/shared/lib";

export type AvatarTone = "violet" | "blue" | "emerald" | "amber" | "rose";
export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  name?: string;
  tone?: AvatarTone | string;
  size?: AvatarSize;
  status?: "online" | "offline";
  className?: string;
}

export function Avatar({ name, tone = "violet", size = "md", status, className }: AvatarProps) {
  return (
    <span className={cn("avatar-wrap", className)}>
      <AvatarPrimitive.Root className={cn("avatar", `avatar--${size}`, `avatar--${tone}`)}>
        <AvatarPrimitive.Fallback>{initials(name)}</AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {status === "online" && <span className="avatar-status" aria-label="Onlayn" />}
    </span>
  );
}
