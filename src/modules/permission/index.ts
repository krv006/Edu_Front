export { PERMISSIONS, ROLE_PERMISSIONS } from "./constants/permission-map";
export type { Permission } from "./constants/permission-map";
export { can } from "./lib/can";
export { hasRole, normalizeRole } from "./lib/has-role";
export { PermissionGuard } from "./ui/permission-guard";
