const express = require("express");
const router = express.Router()
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Import Controller Functions
const {
    addEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    updateLeaveBalance,
    getEmployeeStats,
    bulkImportEmployees
} = require("../controllers/employeeController");


// GET Employee Stats (Admin & HR only)
router.get("/stats", protect, authorize("admin", "hr"), getEmployeeStats);

// POST Bulk Import Employees (Admin & HR only)
router.post("/bulk-import", protect, authorize("admin", "hr"), bulkImportEmployees);


router.route("/")
    // GET /api/employees -> Everyone can see the employee directory
    .get(protect, getEmployees)

    // POST /api/employees -> Only Admin/HR can add. Expects 'avatar' file upload
    .post(protect, authorize("admin", "hr"), upload.single("avatar"), addEmployee);


router.route("/:id")
    // GET /api/employees/:id -> Everyone can view a specific employee's profile
    .get(protect, getEmployeeById)

    // PUT /api/employees/:id -> Only Admin/HR can edit. Expects 'avatar' file upload
    .put(protect, authorize("admin", "hr"), upload.single("avatar"), updateEmployee)

    // DELETE /api/employees/:id -> Only Admin/HR can soft delete (deactivate)
    .delete(protect, authorize("admin", "hr"), deleteEmployee);



// PATCH /api/employees/:id/leave-balance -> Update leave balance
router.patch("/:id/leave-balance", protect, authorize("admin", "hr"), updateLeaveBalance);


module.exports = router;