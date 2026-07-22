const express = require("express");
const router = express.Router();
const { protect, permit } = require("../middleware/authMiddleware");
const { getAll, createOne, updateOne, deleteOne } = require("../controllers/departmentController");

router.use(protect);
router.get("/", permit("departments", "read"), getAll);
router.post("/", permit("departments", "create"), createOne);
router.put("/:id", permit("departments", "update"), updateOne);
router.delete("/:id", permit("departments", "delete"), deleteOne);

module.exports = router;
