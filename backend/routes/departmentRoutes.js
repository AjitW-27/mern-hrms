const express = require("express");
const router = express.Router();
const { addDepartment, getDepartments, updateDepartment, deleteDepartment } = require("../controllers/departmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Routes will now be mounted at /api/departments
router.post("/", protect, authorize("admin", "hr"), addDepartment);
router.get("/", protect, getDepartments);
router.put("/:id", protect, authorize("admin", "hr"), updateDepartment);
router.delete("/:id", protect, authorize("admin", "hr"), deleteDepartment);

module.exports = router;
