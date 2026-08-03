import { can } from "../lib/can";

export function PermissionGuard({ user, permission, fallback = null, children }) {
  return can(user, permission) ? children : fallback;
}
