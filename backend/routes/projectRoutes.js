// routes/projectRoutes.js
const express = require("express");
const router = express.Router();

const {
    addProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require("../controllers/projectController");

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
// Base route is /api/projects (configured in server.js)

router.post("/", protect, authorize("admin", "manager"), addProject);
router.get("/", protect, getProjects);

// ---- NEW ROUTES BELOW ----
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, authorize("admin", "manager"), updateProject);
router.delete("/:id", protect, authorize("admin"), deleteProject);

module.exports = router;