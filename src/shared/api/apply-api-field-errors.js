export function applyApiFieldErrors(error, setError, fieldMap = {}) {
  if (!error?.fields || typeof setError !== "function") return false;
  let applied = false;
  Object.entries(error.fields).forEach(([sourceField, value]) => {
    const targetField = fieldMap[sourceField] ?? sourceField;
    const message = Array.isArray(value) ? value.join(" ") : String(value);
    setError(targetField === "non_field_errors" ? "root" : targetField, {
      type: "server",
      message,
    });
    applied = true;
  });
  return applied;
}
