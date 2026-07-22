const asyncHandler = require("../../utils/asyncHandler");
const { MODULES, ACTIONS, buildAccess, getDefaultRolePermissions } = require("../../config/accessControl");

const getAll = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      modules: MODULES,
      actions: ACTIONS
    }
  });
});

const getModules = asyncHandler(async (req, res) => {
  res.json({ success: true, data: MODULES });
});

const getMatrixTemplate = asyncHandler(async (req, res) => {
  const roleCode = String(req.query.role || "employee").toLowerCase();
  res.json({
    success: true,
    data: getDefaultRolePermissions(roleCode)
  });
});

module.exports = {
  getAll,
  getModules,
  getMatrixTemplate
};
