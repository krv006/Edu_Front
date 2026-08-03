import { normalizeRole } from "@/modules/permission";
import { ROLES } from "@/shared/constants";
import { ROUTES } from "./route-paths";

const ROLE_HOME_ROUTES = Object.freeze({
  [ROLES.SUPER_ADMIN]: ROUTES.admin.dashboard,
  [ROLES.ADMIN]: ROUTES.admin.dashboard,
  [ROLES.TEACHER]: ROUTES.teacher.chats,
  [ROLES.STUDENT]: ROUTES.student.chats,
  [ROLES.PARENT]: ROUTES.parent.dashboard,
});

export function resolveHomeRoute(user) {
  return ROLE_HOME_ROUTES[normalizeRole(user?.role)] ?? ROUTES.auth.login;
}
