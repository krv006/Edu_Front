import { normalizeRole } from "@/modules/permission";
import { ROLES } from "@/shared/constants";

const HOME_ROUTES = Object.freeze({
  [ROLES.SUPER_ADMIN]: "/admin/dashboard",
  [ROLES.ADMIN]: "/admin/dashboard",
  [ROLES.TEACHER]: "/teacher/dashboard",
  [ROLES.STUDENT]: "/student/dashboard",
  [ROLES.PARENT]: "/parent/dashboard",
});

export function resolveHomeRoute(user) {
  return HOME_ROUTES[normalizeRole(user?.role)] ?? "/login";
}
