const jwt = require("jsonwebtoken");
const Role = require("../models/roleModel");
const { getDefaultRolePermissions } = require("../config/accessControl");
const User = require("../models/userModel");

const normalizeRole = (role) => {
  if (!role) return "employee";
  if (typeof role === "string") return role.toLowerCase();
  if (typeof role === "object") {
    return String(role.code || role.name || role.roleName || "employee").toLowerCase();
  }
  return "employee";
};

const getUserRoleCode = (user) =>
  normalizeRole(user?.roleName || user?.role || user?.roleCode || user?.role?.code || user?.role?.name);

const isPrivileged = (roleCode) =>
  ["superadmin", "super_admin", "admin", "hr"].includes(roleCode);

const protect = async (req, res, next) => {
  try {
    let token;
    const header = req.headers.authorization || "";

    if (header.startsWith("Bearer ")) {
      token = header.split(" ")[1];
    }

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
    const userId = decoded.id || decoded._id || decoded.userId;

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

    req.user = user;
    req.userRole = getUserRoleCode(user);

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

const authorize = (...roles) => {
  const normalized = roles.map((role) => String(role).toLowerCase());

  return (req, res, next) => {
    const current = getUserRoleCode(req.user);

    if (current === "superadmin" || current === "super_admin") return next();

    if (!normalized.includes(current)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${current}' is not authorized for this action.`,
      });
    }

    next();
  };
};

const authorizeRoles = (...roles) => authorize(...roles);

const getRolePermission = async (roleCode) => {
  const role = await Role.findOne({
    $or: [{ code: roleCode }, { name: roleCode }],
  });

  return role;
};

const permit = (moduleName, action = "read") => {
  return async (req, res, next) => {
    try {
      const roleCode = getUserRoleCode(req.user);

      if (isPrivileged(roleCode)) return next();

      const roleDoc = await getRolePermission(roleCode);
      const permissions = roleDoc?.permissions;

      const modulePermissions = permissions?.get
        ? permissions.get(moduleName)
        : permissions?.[moduleName];

      if (modulePermissions?.[action]) return next();

      const fallback = getDefaultRolePermissions(roleCode);

      if (fallback?.[moduleName]?.[action]) return next();

      return res.status(403).json({
        success: false,
        message: `Access denied for ${moduleName}:${action}`,
      });
    } catch (error) {
      return next(error);
    }
  };
};

const selfOrAdmin = (paramField = "id") => {
  return (req, res, next) => {
    const targetId = req.params[paramField];
    const currentUserId = String(req.user?._id || "");
    const roleCode = getUserRoleCode(req.user);

    if (currentUserId === String(targetId) || isPrivileged(roleCode)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied. You can only access your own data.",
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