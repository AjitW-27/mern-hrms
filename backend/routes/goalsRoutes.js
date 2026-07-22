const express = require("express");
const router = express.Router();
const { protect, permit } = require("../middleware/authMiddleware");
const { getAll, createOne, updateOne, deleteOne } = require("../controllers/goalController");

router.use(protect);
router.get("/", permit("goals", "read"), getAll);
router.post("/", permit("goals", "create"), createOne);
router.put("/:id", permit("goals", "update"), updateOne);
router.delete("/:id", permit("goals", "delete"), deleteOne);

module.exports = router;
