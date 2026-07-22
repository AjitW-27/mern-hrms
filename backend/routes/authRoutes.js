// ─── routes/authRoutes.js ─────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const {
    registerUser, loginUser, refreshToken, logout,
    getProfile, updateProfile, changePassword,
    forgotPassword, resetPassword, verifyEmail, resendVerificationEmail,
    getUsers, toggleUserStatus
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Protected
router.use(protect);
router.post("/logout", logout);
router.get("/profile", getProfile);
router.put("/profile", (req, res, next) => { req.uploadFolder = "avatars"; next(); }, upload.single("avatar"), updateProfile);
router.put("/change-password", changePassword);

// Admin only
router.get("/users", authorize("admin", "hr"), getUsers);
router.put("/users/:id/toggle-status", authorize("admin"), toggleUserStatus);

module.exports = router;
