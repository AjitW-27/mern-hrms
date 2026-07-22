const express = require("express");
const router = express.Router();
const { protect, permit } = require("../middleware/authMiddleware");
const { getAll, createOne, updateOne, deleteOne } = require("../controllers/trainingController");

router.use(protect);
router.get("/", permit("training", "read"), getAll);
router.post("/", permit("training", "create"), createOne);
router.put("/:id", permit("training", "update"), updateOne);
router.delete("/:id", permit("training", "delete"), deleteOne);

module.exports = router;
