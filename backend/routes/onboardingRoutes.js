const express = require("express");
const router = express.Router();
const { protect, permit } = require("../middleware/authMiddleware");
const { getAll, createOne, updateOne, deleteOne } = require("../controllers/onboardingController");

router.use(protect);
router.get("/", permit("onboarding", "read"), getAll);
router.post("/", permit("onboarding", "create"), createOne);
router.put("/:id", permit("onboarding", "update"), updateOne);
router.delete("/:id", permit("onboarding", "delete"), deleteOne);

module.exports = router;
