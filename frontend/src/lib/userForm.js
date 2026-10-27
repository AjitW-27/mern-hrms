export const referenceId = value => String(value?._id || value?.id || value || "");
export function roleValue(value, roles = []) {
  const candidates = typeof value === "object" && value ? [value.code, value.name, value._id, value.id] : [value];
  const normalize = value => String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
  const match = roles.find(role => candidates.some(value => [role._id, role.code, role.name].some(candidate => normalize(candidate) === normalize(value) && normalize(value))));
  return match ? String(match.code || match._id) : String(candidates.find(Boolean) || "");
}
export function userPayload(form, editing, _roles) {
  const payload = { ...form, isActive: form.status === "active" };
  delete payload.status;
  if (!payload.password) delete payload.password;
  for (const field of ["organization", "roleId", "employeeRef", "employee", "departmentId"]) {
    if (payload[field] === "" || payload[field] === undefined) delete payload[field];
    else if (payload[field] !== null) payload[field] = referenceId(payload[field]);
  }
  const storedRole = editing?.role && typeof editing.role === "object" ? editing.role.code : editing?.role;
  if (!payload.role || editing && storedRole === payload.role) delete payload.role;
  // Explicit null clears an existing organization; an omitted field preserves it.
  if (editing?.organization && !form.organization) payload.organization = null;
  return payload;
}
export function friendlyUserError(error, fallback = "Unable to save user.") {
  const message = error?.response?.data?.message || error?.message || fallback;
  return /BSON|Cast to ObjectId|CastError|ObjectId failed/i.test(message) ? "Please select valid organization and employee values, or leave optional fields unassigned." : message;
}
