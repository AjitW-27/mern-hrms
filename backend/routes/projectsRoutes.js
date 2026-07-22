const express = require("express");
const router = express.Router();
const { protect, permit } = require("../middleware/authMiddleware");
const { getAll, createOne, updateOne, deleteOne } = require("../controllers/projectController");

router.use(protect);
router.get("/", permit("projects", "read"), getAll);
router.post("/", permit("projects", "create"), createOne);
router.put("/:id", permit("projects", "update"), updateOne);
router.delete("/:id", permit("projects", "delete"), deleteOne);

module.exports = router;
