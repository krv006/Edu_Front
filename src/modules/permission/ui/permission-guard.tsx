import type { ReactNode } from "react";
import { can } from "../lib/can";
import type { Permission } from "../constants/permission-map";

export interface PermissionGuardProps {
  user: { role?: string } | null | undefined;
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({ user, permission, fallback = null, children }: PermissionGuardProps) {
  return can(user, permission) ? children : fallback;
}
