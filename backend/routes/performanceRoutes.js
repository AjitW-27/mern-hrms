const express = require("express");
const router = express.Router();
const { protect, permit } = require("../middleware/authMiddleware");
const { getAll, createOne, updateOne, deleteOne } = require("../controllers/performanceController");

router.use(protect);
router.get("/", permit("performance", "read"), getAll);
router.post("/", permit("performance", "create"), createOne);
router.put("/:id", permit("performance", "update"), updateOne);
router.delete("/:id", permit("performance", "delete"), deleteOne);

module.exports = router;
