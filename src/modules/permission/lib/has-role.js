export function normalizeRole(role) {
  return typeof role === "string" ? role.trim().toUpperCase() : "";
}

export function hasRole(user, allowedRoles) {
  if (!user || !Array.isArray(allowedRoles) || allowedRoles.length === 0) return false;
  const currentRole = normalizeRole(user.role);
  return allowedRoles.some((role) => normalizeRole(role) === currentRole);
}
