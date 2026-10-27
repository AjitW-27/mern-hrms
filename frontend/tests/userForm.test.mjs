import test from "node:test";
import assert from "node:assert/strict";
import { referenceId, roleValue, userPayload, friendlyUserError } from "../src/lib/userForm.js";
const roles = [{ _id: "first", code: "employee", name: "employee" }, { _id: "custom", code: "project_reviewer", name: "Project Reviewer" }, { _id: "service", code: "system", name: "system" }];
test("role selections normalize code, ID and populated references without excluding custom or system roles", () => {
  for (const value of ["project_reviewer", "custom", { _id: "custom" }, { code: "project_reviewer" }, { name: "Project Reviewer" }]) assert.equal(roleValue(value, roles), "project_reviewer");
  assert.equal(roleValue("system", roles), "system"); assert.equal(referenceId({ _id: "org" }), "org");
});
test("user payloads never send empty optional IDs and preserve unchanged roles", () => {
  const form = { role: "employee", organization: "", employeeRef: "", roleId: "", employee: "", departmentId: "", password: "", status: "active" };
  const payload = userPayload(form, { role: "employee" }, roles);
  for (const field of ["role", "organization", "employeeRef", "roleId", "employee", "departmentId", "password"]) assert.equal(Object.hasOwn(payload, field), false);
  assert.equal(payload.isActive, true); assert.equal(userPayload(form, { organization: { _id: "org" } }, roles).organization, null);
});
test("BSON details are replaced with friendly reference guidance", () => {
  assert.doesNotMatch(friendlyUserError({ response: { data: { message: 'Cast to ObjectId failed for value "" because of BSONError' } } }), /BSON|ObjectId/);
});

test("legacy role IDs are saved as canonical codes instead of preserving a broken role reference", () => { const payload = userPayload({ role: "employee", status: "active" }, { role: "first" }, roles); assert.equal(payload.role, "employee"); });
