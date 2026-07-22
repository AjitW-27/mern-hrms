const express = require("express");
const router = express.Router();
const { protect, permit } = require("../middleware/authMiddleware");
const { getAll, createOne, updateOne, deleteOne } = require("../controllers/employeeController");

router.use(protect);
router.get("/", permit("employees", "read"), getAll);
router.post("/", permit("employees", "create"), createOne);
router.put("/:id", permit("employees", "update"), updateOne);
router.delete("/:id", permit("employees", "delete"), deleteOne);

module.exports = router;
