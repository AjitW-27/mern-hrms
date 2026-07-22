const express = require("express");
const router = express.Router();
const { protect, authorize, permit } = require("../middleware/authMiddleware");
const controller = require("../controllers/enterpriseController");

const adminHr = authorize("superadmin", "admin", "hr");

const mountCrud = (path, resource, permissionName) => {
  router
    .route(path)
    .get(protect, permit(permissionName, "read"), controller.list(resource))
    .post(protect, adminHr, permit(permissionName, "create"), controller.create(resource));

  router
    .route(`${path}/:id`)
    .get(protect, permit(permissionName, "read"), controller.getById(resource))
    .put(protect, adminHr, permit(permissionName, "update"), controller.update(resource))
    .delete(protect, adminHr, permit(permissionName, "delete"), controller.remove(resource));
};

mountCrud("/branches", "branches", "organization");
mountCrud("/designations", "designations", "designation");
mountCrud("/recruitment/jobs", "jobs", "recruitment");
mountCrud("/recruitment/candidates", "candidates", "recruitment");
mountCrud("/recruitment/interviews", "interviews", "recruitment");
mountCrud("/onboarding/tasks", "onboardingTasks", "onboarding");
mountCrud("/leave-policies", "leavePolicies", "leave");
mountCrud("/shifts", "shifts", "attendance");
mountCrud("/attendance/regularizations", "regularizations", "attendance");
mountCrud("/salary-structures", "salaryStructures", "payroll");
mountCrud("/payslips", "payslips", "payroll");
mountCrud("/report-exports", "reportExports", "reports");

router.patch("/attendance/regularizations/:id/review", protect, adminHr, controller.approveRegularization);
router.post("/payslips/generate", protect, adminHr, controller.generatePayslip);
router.get("/reports/hr-summary", protect, adminHr, controller.hrSummaryReport);

module.exports = router;
