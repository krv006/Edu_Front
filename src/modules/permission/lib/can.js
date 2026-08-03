import { ROLE_PERMISSIONS } from "../constants/permission-map";
import { normalizeRole } from "./has-role";

// Frontend permission faqat UI/UX guard hisoblanadi. Haqiqiy ruxsat backendda ham tekshirilishi shart.
export function can(user, permission) {
  if (!user || !permission) return false;
  const permissions = ROLE_PERMISSIONS[normalizeRole(user.role)] ?? [];
  return permissions.includes("*") || permissions.includes(permission);
}
