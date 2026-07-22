const { getDefaultRolePermissions, flattenPermissions } = require("../config/accessControl");

describe("access control defaults", () => {
  test("admin receives full access", () => {
    const permissions = getDefaultRolePermissions("admin");
    expect(permissions.users.create).toBe(true);
    expect(permissions.payroll.delete).toBe(true);
  });

  test("employee can read self-service modules without admin rights", () => {
    const permissions = getDefaultRolePermissions("employee");
    expect(permissions.leave.create).toBe(true);
    expect(permissions.users.delete).toBe(false);
  });

  test("permissions can be flattened for UI matrices", () => {
    const flat = flattenPermissions(getDefaultRolePermissions("hr"));
    expect(flat).toContain("employees:create");
    expect(flat).toContain("reports:export");
  });
});
