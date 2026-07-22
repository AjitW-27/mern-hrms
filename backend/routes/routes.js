const express = require("express");
const router = express.Router();

router.use("/departments", require("./departmentRoutes"));
router.use("/organizations", require("./organizationRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/enterprise", require("./enterpriseRoutes"));
router.use("/audit-logs", require("./auditRoutes"));
router.use("/reports", require("./reportRoutes"));
router.use("/projects", require("./projectRoutes"));
router.use("/attendance", require("./attendanceRoutes"));
router.use("/assets", require("./assetRoutes"));
router.use("/expenses", require("./expenseRoutes"));
router.use("/settings", require("./settingRoutes"));
router.use("/notifications", require("./notificationRoutes"));
router.use("/dashboard", require("./dashboardRoutes"));
router.use("/onboarding", require("./onboardingRoutes"));
router.use("/training", require("./trainingRoutes"));
router.use("/performance", require("./performanceRoutes"));
router.use("/goals", require("./goalsRoutes"));
router.use("/admin", require("./adminRoutes"));
router.use("/rbac/roles", require("./rbac/role.routes"));
router.use("/rbac/permissions", require("./rbac/permission.routes"));

module.exports = router;
