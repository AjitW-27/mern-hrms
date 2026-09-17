// const jwt = require("jsonwebtoken");
// const Role = require("../models/roleModel");
// const Settings = require("../models/settingModel");
// const { getDefaultRolePermissions } = require("../config/accessControl");
// const User = require("../models/userModel");

// const RBAC_CACHE_TTL = 1000;
// let rbacEnabledCache = { value: null, expiresAt: 0 };
// const rolePermissionCache = new Map();

// const clearRbacCache = (roleCode) => {
//   rbacEnabledCache = { value: null, expiresAt: 0 };
//   if (roleCode) rolePermissionCache.delete(normalizeRole(roleCode));
//   else rolePermissionCache.clear();
// };

// const normalizeRole = (role) => {
//   if (!role) return "employee";
//   if (typeof role === "string") return role.toLowerCase();
//   if (typeof role === "object") return String(role.code || role.name || role.roleName || "employee").toLowerCase();
//   return "employee";
// };

// const getUserRoleCode = (user) => normalizeRole(user?.roleName || user?.role || user?.roleCode || user?.role?.code || user?.role?.name);

// const isSuperAdmin = (roleCode) => ["superadmin", "super_admin"].includes(roleCode);

// const protect = async (req, res, next) => {
//   try {
//     const header = req.headers.authorization || "";
//     const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
//     if (!token) return res.status(401).json({ success: false, message: "Not authorized, no token" });
//     if (!process.env.JWT_SECRET) return res.status(500).json({ success: false, message: "JWT secret is not configured" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id || decoded._id || decoded.userId;
//     if (!userId) return res.status(401).json({ success: false, message: "Token payload is invalid" });

//     const user = await User.findById(userId).select("-password -refreshToken -resetPasswordToken -twoFactorSecret");
//     if (!user) return res.status(401).json({ success: false, message: "User no longer exists" });
//     if (user.isActive === false) return res.status(403).json({ success: false, message: "Your account has been deactivated" });

//     const roleCode = getUserRoleCode(user);
//     const roleDoc = await Role.findOne({ $or: [{ code: roleCode }, { name: roleCode }] }).select("isActive").lean();
//     if (roleDoc && roleDoc.isActive === false && !isSuperAdmin(roleCode)) {
//       return res.status(403).json({ success: false, message: "Your role has been deactivated. Contact an administrator." });
//     }

//     req.user = user;
//     req.userRole = roleCode;
//     next();
//   } catch (error) {
//     if (error.name === "TokenExpiredError") return res.status(401).json({ success: false, message: "Token expired. Please login again" });
//     if (error.name === "JsonWebTokenError") return res.status(401).json({ success: false, message: "Token invalid. Please login again" });
//     return res.status(401).json({ success: false, message: "Token invalid or expired" });
//   }
// };

// const getRolePermission = async (roleCode) => {
//   const normalizedRole = normalizeRole(roleCode);
//   const cached = rolePermissionCache.get(normalizedRole);
//   if (cached && cached.expiresAt > Date.now()) return cached.value;

//   const role = await Role.findOne({
//     $or: [{ code: normalizedRole }, { name: normalizedRole }]
//   }).lean({ flattenMaps: true });

//   rolePermissionCache.set(normalizedRole, {
//     value: role,
//     expiresAt: Date.now() + RBAC_CACHE_TTL
//   });
//   return role;
// };

// const getRbacEnabled = async () => {
//   if (rbacEnabledCache.expiresAt > Date.now() && rbacEnabledCache.value !== null) {
//     return rbacEnabledCache.value;
//   }

//   let settings = await Settings.findOne();
//   if (!settings) {
//     settings = await Settings.create({ rbacEnabled: false, rbacModeInitialized: true });
//   } else if (settings.rbacModeInitialized !== true) {
//     settings.rbacEnabled = false;
//     settings.rbacModeInitialized = true;
//     await settings.save();
//   }

//   const enabled = settings.rbacEnabled === true;
//   rbacEnabledCache = { value: enabled, expiresAt: Date.now() + RBAC_CACHE_TTL };
//   return enabled;
// };

// const normalizePath = (value = "") => String(value).replace(/\/+/g, "/").replace(/^\//, "").toLowerCase();

// const resolveModule = (req) => {
//   const base = normalizePath(req.baseUrl || "");
//   const path = normalizePath(req.path || "");
//   const first = base.split("/").filter(Boolean).pop() || path.split("/").filter(Boolean)[0] || "";
//   const aliases = {
//     employees: "employees", employee: "employees", departments: "departments", department: "departments",
//     projects: "projects", project: "projects", attendance: "attendance", leaves: "leave", leave: "leave",
//     payroll: "payroll", assets: "assets", expenses: "expenses", onboarding: "onboarding", training: "training",
//     performance: "performance", goals: "goals", reports: "reports", audit: "audit", "audit-logs": "audit",
//     users: "users", roles: "roles", organization: "organizations", organizations: "organizations",
//     notifications: "notifications", settings: "settings", enterprise: "enterprise",
//     rbac: "roles", admin: "users", dashboard: "dashboard"
//   };
//   if (base.includes("/enterprise")) {
//     const segment = path.split("/").filter(Boolean)[0] || "";
//     if (segment === "branches") return "organizations";
//     if (segment === "shifts") return "attendance";
//     if (segment === "leave-policies") return "leave";
//   }
//   if (base.includes("/rbac/permissions")) return "roles";
//   if (base.includes("/rbac/roles")) return "roles";
//   if (base.includes("/admin/roles")) return "roles";
//   if (base.includes("/admin/organization")) return "organizations";
//   if (base.includes("/admin/departments")) return "departments";
//   if (base.includes("/admin/users")) return "users";
//   if (base.includes("/admin")) {
//     const segment = path.split("/").filter(Boolean)[0] || "";
//     return aliases[segment] || "users";
//   }
//   return aliases[first] || first;
// };

// const resolveAction = (req) => {
//   const method = String(req.method || "GET").toUpperCase();
//   const path = normalizePath(req.path || "");
//   if (path.includes("/approve") || path.includes("approve")) return "approve";
//   if (path.includes("/export") || path.includes("export")) return "export";
//   if (path.includes("/manage") || path.includes("manage")) return "manage";
//   if (method === "GET" || method === "HEAD") return "read";
//   if (method === "POST") return "create";
//   if (method === "PUT" || method === "PATCH") return "update";
//   if (method === "DELETE") return "delete";
//   return "read";
// };

// const hasPermission = async (roleCode, moduleName, action) => {
//   const normalizedRole = normalizeRole(roleCode);
//   const role = await getRolePermission(normalizedRole);

//   // Mongoose Map fields must be converted to plain objects before dynamic
//   // module access (role.permissions[moduleName]) is reliable.
//   const configuredPermissions = role?.permissions instanceof Map
//     ? Object.fromEntries(role.permissions.entries())
//     : (role?.permissions || {});

//   const configuredModule = configuredPermissions?.[moduleName];
//   if (configuredModule && configuredModule[action] === true) return true;

//   // A role with an explicitly configured permission matrix is deny-by-default.
//   // This is important for RBAC: only permissions selected in Access are allowed.
//   if (role) {
//     const hasConfiguredPermissions = Object.keys(configuredPermissions).length > 0;
//     if (hasConfiguredPermissions) return false;

//     // System roles retain their safe built-in defaults if no matrix exists.
//     if (["superadmin", "super_admin", "admin", "hr", "manager", "employee"].includes(normalizedRole)) {
//       const fallback = getDefaultRolePermissions(normalizedRole);
//       return Boolean(fallback?.[moduleName]?.[action]);
//     }

//     return false;
//   }

//   // Legacy users without a Role document retain the existing built-in defaults.
//   const fallback = getDefaultRolePermissions(normalizedRole);
//   return Boolean(fallback?.[moduleName]?.[action]);
// };

// const authorize = (...roles) => {
//   const normalized = roles.map((role) => String(role).toLowerCase());
//   return async (req, res, next) => {
//     try {
//       const current = getUserRoleCode(req.user);
//       if (isSuperAdmin(current)) return next();
//       if (!(await getRbacEnabled())) return next();

//       const moduleName = resolveModule(req);
//       const action = resolveAction(req);
//       if (await hasPermission(current, moduleName, action)) return next();

//       return res.status(403).json({
//         success: false,
//         message: `Access denied. Role '${current}' is not authorized for this action.`,
//         module: moduleName,
//         action
//       });
//     } catch (error) {
//       return next(error);
//     }
//   };
// };

// const authorizeRoles = (...roles) => authorize(...roles);

// const permit = (moduleName, action = "read") => async (req, res, next) => {
//   try {
//     if (isSuperAdmin(getUserRoleCode(req.user))) return next();
//     if (!(await getRbacEnabled())) return next();
//     if (await hasPermission(getUserRoleCode(req.user), moduleName, action)) return next();
//     return res.status(403).json({ success: false, message: `Access denied for ${moduleName}:${action}` });
//   } catch (error) {
//     return next(error);
//   }
// };

// const selfOrAdmin = (paramField = "id") => (req, res, next) => {
//   const targetId = req.params[paramField];
//   const currentUserId = String(req.user?._id || "");
//   const roleCode = getUserRoleCode(req.user);
//   if (currentUserId === String(targetId) || isSuperAdmin(roleCode)) return next();
//   return res.status(403).json({ success: false, message: "Access denied. You can only access your own data." });
// };

// module.exports = protect;
// module.exports.protect = protect;
// module.exports.authorize = authorize;
// module.exports.authorizeRoles = authorizeRoles;
// module.exports.permit = permit;
// module.exports.selfOrAdmin = selfOrAdmin;
// module.exports.getUserRoleCode = getUserRoleCode;
// module.exports.clearRbacCache = clearRbacCache;
const jwt = require("jsonwebtoken");
const Role = require("../models/roleModel");
const Settings = require("../models/settingModel");
const { getDefaultRolePermissions } = require("../config/accessControl");
const User = require("../models/userModel");

const RBAC_CACHE_TTL = 1000;

let rbacEnabledCache = {
  value: null,
  expiresAt: 0,
};

const rolePermissionCache = new Map();

const clearRbacCache = (roleCode) => {
  rbacEnabledCache = {
    value: null,
    expiresAt: 0,
  };

  if (roleCode) {
    rolePermissionCache.delete(normalizeRole(roleCode));
  } else {
    rolePermissionCache.clear();
  }
};

const normalizeRole = (role) => {
  if (!role) return "employee";

  if (typeof role === "string") {
    return role.trim().toLowerCase();
  }

  if (typeof role === "object") {
    return String(
      role.code ||
      role.name ||
      role.roleName ||
      role.roleCode ||
      "employee"
    )
      .trim()
      .toLowerCase();
  }

  return "employee";
};

const getUserRoleCode = (user) => {
  return normalizeRole(
    user?.roleName ||
    user?.roleCode ||
    user?.role ||
    user?.role?.code ||
    user?.role?.name
  );
};

const isSuperAdmin = (roleCode) => {
  return ["superadmin", "super_admin"].includes(
    normalizeRole(roleCode)
  );
};

/* =========================
   AUTHENTICATION
========================= */

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";

    const token = header.startsWith("Bearer ")
      ? header.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT secret is not configured",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId =
      decoded.id ||
      decoded._id ||
      decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Token payload is invalid",
      });
    }

    const user = await User.findById(userId).select(
      "-password -refreshToken -resetPasswordToken -twoFactorSecret"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    const roleCode = getUserRoleCode(user);

    const roleDoc = await Role.findOne({
      $or: [
        { code: roleCode },
        { name: roleCode },
      ],
    })
      .select("isActive")
      .lean();

    /*
     * IMPORTANT:
     * RBAC role status applies to every role,
     * including super_admin.
     */
    if (roleDoc && roleDoc.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your role has been deactivated. Contact an administrator.",
      });
    }

    req.user = user;
    req.userRole = roleCode;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token invalid. Please login again",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token invalid or expired",
    });
  }
};

/* =========================
   ROLE PERMISSIONS
========================= */

const getRolePermission = async (roleCode) => {
  const normalizedRole = normalizeRole(roleCode);

  const cached = rolePermissionCache.get(normalizedRole);

  if (
    cached &&
    cached.expiresAt > Date.now()
  ) {
    return cached.value;
  }

  const role = await Role.findOne({
    $or: [
      { code: normalizedRole },
      { name: normalizedRole },
    ],
  }).lean({ flattenMaps: true });

  rolePermissionCache.set(normalizedRole, {
    value: role,
    expiresAt: Date.now() + RBAC_CACHE_TTL,
  });

  return role;
};

/* =========================
   RBAC ENABLE / DISABLE
========================= */

const getRbacEnabled = async () => {
  if (
    rbacEnabledCache.expiresAt > Date.now() &&
    rbacEnabledCache.value !== null
  ) {
    return rbacEnabledCache.value;
  }

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      rbacEnabled: false,
      rbacModeInitialized: false,
    });
  } else if (settings.rbacModeInitialized !== true) {
    settings.rbacEnabled = false;
    settings.rbacModeInitialized = true;

    await settings.save();
  }

  const enabled = settings.rbacEnabled === true;

  rbacEnabledCache = {
    value: enabled,
    expiresAt: Date.now() + RBAC_CACHE_TTL,
  };

  return enabled;
};

/* =========================
   MODULE RESOLUTION
========================= */

const normalizePath = (value = "") => {
  return String(value)
    .replace(/\/+/g, "/")
    .replace(/^\//, "")
    .toLowerCase();
};

const resolveModule = (req) => {
  const base = normalizePath(req.baseUrl || "");
  const path = normalizePath(req.path || "");

  const first =
    base.split("/").filter(Boolean).pop() ||
    path.split("/").filter(Boolean)[0] ||
    "";

  const aliases = {
    dashboard: "dashboard",

    employees: "employees",
    employee: "employees",

    departments: "departments",
    department: "departments",

    projects: "projects",
    project: "projects",

    attendance: "attendance",

    leaves: "leave",
    leave: "leave",

    payroll: "payroll",

    assets: "assets",

    expenses: "expenses",

    onboarding: "onboarding",

    training: "training",

    performance: "performance",

    goals: "goals",

    reports: "reports",

    audit: "audit",
    "audit-logs": "audit",

    users: "users",

    roles: "roles",

    organization: "organizations",
    organizations: "organizations",

    notifications: "notifications",

    settings: "settings",

    enterprise: "enterprise",

    rbac: "roles",

    admin: "users",
  };

  if (base.includes("/enterprise")) {
    const segment =
      path.split("/").filter(Boolean)[0] || "";

    if (segment === "branches") {
      return "organizations";
    }

    if (segment === "shifts") {
      return "attendance";
    }

    if (segment === "leave-policies") {
      return "leave";
    }
  }

  if (base.includes("/rbac/permissions")) {
    return "roles";
  }

  if (base.includes("/rbac/roles")) {
    return "roles";
  }

  if (base.includes("/admin/roles")) {
    return "roles";
  }

  if (base.includes("/admin/organization")) {
    return "organizations";
  }

  if (base.includes("/admin/departments")) {
    return "departments";
  }

  if (base.includes("/admin/users")) {
    return "users";
  }

  if (base.includes("/admin")) {
    const segment =
      path.split("/").filter(Boolean)[0] || "";

    return aliases[segment] || "users";
  }

  return aliases[first] || first;
};

/* =========================
   ACTION RESOLUTION
========================= */

const resolveAction = (req) => {
  const method = String(req.method || "").toUpperCase();

  const path = normalizePath(req.path || "");

  if (
    path.includes("/approve") ||
    path.includes("approve")
  ) {
    return "approve";
  }

  if (
    path.includes("/export") ||
    path.includes("export")
  ) {
    return "export";
  }

  if (
    path.includes("/manage") ||
    path.includes("manage")
  ) {
    return "manage";
  }

  if (
    method === "GET" ||
    method === "HEAD"
  ) {
    return "read";
  }

  if (method === "POST") {
    return "create";
  }

  if (
    method === "PUT" ||
    method === "PATCH"
  ) {
    return "update";
  }

  if (method === "DELETE") {
    return "delete";
  }

  return "read";
};

/* =========================
   PERMISSION CHECK
========================= */

const hasPermission = async (
  roleCode,
  moduleName,
  action
) => {
  const normalizedRole = normalizeRole(roleCode);

  const role = await getRolePermission(
    normalizedRole
  );

  if (!role) {
    const fallback =
      getDefaultRolePermissions(normalizedRole);

    return Boolean(
      fallback?.[moduleName]?.[action]
    );
  }

  const configuredPermissions =
    role.permissions &&
      typeof role.permissions === "object" &&
      !Array.isArray(role.permissions)
      ? role.permissions
      : {};

  /*
   * Explicit Access matrix is authoritative.
   *
   * Example:
   * dashboard: {
   *   read: false
   * }
   *
   * means DENY.
   */

  const configuredModule =
    configuredPermissions[moduleName];

  if (
    configuredModule &&
    configuredModule[action] === true
  ) {
    return true;
  }

  /*
   * If the role has an explicit permission matrix,
   * anything not selected is DENIED.
   */
  if (
    Object.keys(configuredPermissions).length > 0
  ) {
    return false;
  }

  /*
   * Only use old defaults when no permission matrix
   * exists at all.
   */
  const fallback =
    getDefaultRolePermissions(normalizedRole);

  return Boolean(
    fallback?.[moduleName]?.[action]
  );
};

/* =========================
   RBAC AUTHORIZATION
========================= */

const authorize = (...roles) => {
  const normalizedRoles = roles.map((role) =>
    String(role).toLowerCase()
  );

  return async (req, res, next) => {
    try {
      const current = getUserRoleCode(req.user);

      /*
       * DO NOT bypass RBAC for super_admin.
       *
       * Access matrix controls every role.
       */

      if (!(await getRbacEnabled())) {
        return next();
      }

      /*
       * If a route specifically requires certain roles,
       * keep that restriction.
       *
       * Empty roles means permission matrix decides.
       */
      if (
        normalizedRoles.length > 0 &&
        !normalizedRoles.includes(current)
      ) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Role '${current}' is not authorized for this action.`,
        });
      }

      const moduleName = resolveModule(req);
      const action = resolveAction(req);

      const allowed = await hasPermission(
        current,
        moduleName,
        action
      );

      if (allowed) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${current}' is not authorized for this action.`,
        module: moduleName,
        action,
      });
    } catch (error) {
      return next(error);
    }
  };
};

const authorizeRoles = (...roles) => {
  return authorize(...roles);
};

/* =========================
   DIRECT PERMISSION CHECK
========================= */

const permit = (
  moduleName,
  action = "read"
) => {
  return async (req, res, next) => {
    try {
      /*
       * IMPORTANT:
       * No super_admin bypass here.
       */
      if (!(await getRbacEnabled())) {
        return next();
      }

      const roleCode =
        getUserRoleCode(req.user);

      const allowed = await hasPermission(
        roleCode,
        moduleName,
        action
      );

      if (allowed) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Access denied for ${moduleName}:${action}`,
        module: moduleName,
        action,
      });
    } catch (error) {
      return next(error);
    }
  };
};

/* =========================
   SELF / ADMIN
========================= */

const selfOrAdmin = (
  paramField = "id"
) => {
  return (req, res, next) => {
    const targetId =
      req.params[paramField];

    const currentUserId = String(
      req.user?._id || ""
    );

    const roleCode =
      getUserRoleCode(req.user);

    /*
     * Keep existing self-access behavior.
     */
    if (
      currentUserId === String(targetId) ||
      isSuperAdmin(roleCode)
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message:
        "Access denied. You can only access your own data.",
    });
  };
};

module.exports = protect;
module.exports.protect = protect;
module.exports.authorize = authorize;
module.exports.authorizeRoles = authorizeRoles;
module.exports.permit = permit;
module.exports.selfOrAdmin = selfOrAdmin;
module.exports.getUserRoleCode = getUserRoleCode;
module.exports.clearRbacCache = clearRbacCache;