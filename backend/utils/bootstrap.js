const Organization = require("../models/organizationModel");
const Role = require("../models/roleModel");
const User = require("../models/userModel");
const Settings = require("../models/settingModel");
const { buildAccess, getDefaultRolePermissions } = require("../config/accessControl");

const defaultRoles = [
  { name: "superadmin", code: "superadmin", description: "Full system control", permissions: buildAccess({ full: true }), level: 1, isSystemRole: true },
  { name: "admin", code: "admin", description: "Company administrator", permissions: buildAccess({ full: true }), level: 2, isSystemRole: true },
  { name: "hr", code: "hr", description: "Human resources operations", permissions: buildAccess({ hr: true }), level: 10, isSystemRole: true },
  { name: "manager", code: "manager", description: "Team manager", permissions: buildAccess({ manager: true }), level: 20, isSystemRole: true },
  { name: "employee", code: "employee", description: "Standard employee", permissions: buildAccess({ employee: true }), level: 30, isSystemRole: true },
  { name: "system", code: "system", description: "System account; permissions assigned explicitly", permissions: buildAccess({}), level: 40, isSystemRole: true }
];

const ensureDefaultRoles = async () => {
  for (const role of defaultRoles) {
    await Role.findOneAndUpdate(
      { code: role.code },
      {
        $setOnInsert: {
          name: role.name,
          code: role.code,
          description: role.description,
          permissions: role.permissions,
          level: role.level,
          isSystemRole: true,
          isActive: true
        }
      },
      { upsert: true, new: true }
    );
  }
};

const bootstrap = async () => {
  const orgCount = await Organization.countDocuments();
  if (!orgCount) {
    await Organization.create({
      name: "Enterprise HRMS",
      legalName: "Enterprise HRMS Private Limited",
      code: "ENT-HRMS",
      industry: "Technology",
      email: "hr@example.com",
      phone: "+91-0000000000",
      website: "https://example.com",
      address: "Corporate Office",
      timezone: "Asia/Kolkata",
      settings: { payrollCycle: "Monthly", currency: "INR", attendanceMode: "Biometric + Manual" }
    });
  }

  await ensureDefaultRoles();

  let settings = await Settings.findOne();
  if (!settings) {
    await Settings.create({ rbacEnabled: false, rbacModeInitialized: true });
  } else if (settings.rbacModeInitialized !== true) {
    settings.rbacEnabled = false;
    settings.rbacModeInitialized = true;
    await settings.save();
  }

  const adminRole = await Role.findOne({ code: "superadmin" });
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@hrms.local";
  const existingUser = await User.findOne({ email: adminEmail });

  if (!existingUser) {
    await User.create({
      name: process.env.SEED_ADMIN_NAME || "System Admin",
      email: adminEmail,
      password: process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
      mobileNo: process.env.SEED_ADMIN_MOBILE || "9999999999",
      role: "superadmin",
      isActive: true
    });
  }

  return { adminRole };
};

module.exports = bootstrap;

module.exports.ensureDefaultRoles = ensureDefaultRoles;
