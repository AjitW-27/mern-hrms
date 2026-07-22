const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const Employee = require("../models/employeeModel");
const Role = require("../models/roleModel");
const { sendEmail } = require("../utils/emailService");
const { createNotification } = require("../utils/notificationHelper");

// ─── Generate Tokens ──────────────────────────────────────────────────────────
const generateAccessToken = (id, role) =>
    jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });

const generateRefreshToken = (id, version = 0) =>
    jwt.sign({ id, version }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
    });

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const sendVerificationEmail = async (user) => {
    const verifyToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = hashToken(verifyToken);
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
    await sendEmail({
        to: user.email,
        subject: "HRMS - Verify your email",
        html: `<p>Hi ${user.name},</p><p>Please verify your HRMS email.</p><a href="${verifyUrl}">Verify email</a>`
    }).catch(() => {});
};

// ─── REGISTER ────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
    try {
        const { name, email, password, mobileNo, department, role } = req.body;

        // ── Validate required fields ──
        if (!name || !email || !password || !mobileNo) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password, and mobile number are required",
            });
        }

        // ── Check duplicate email ──
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        // ── Normalize role to lowercase & validate ──
        const validRoles = ["admin", "hr", "manager", "employee"];
        const normalizedRole = role ? role.toLowerCase() : "employee";

        if (!validRoles.includes(normalizedRole)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Valid roles are: ${validRoles.join(", ")}`,
            });
        }

        // ── Create user ──
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            mobileNo,
            department: department ? department.trim() : null,
            role: normalizedRole,
        });

        await sendVerificationEmail(user);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── LOGIN ───────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // ── Find user with password ──
        const user = await User.findOne({ email: email.toLowerCase() }).select(
            "+password +refreshToken +refreshTokenVersion"
        );

        if (!user || !(await user.comparePassword(password))) {
            if (user) {
                user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
                if (user.failedLoginAttempts >= Number(process.env.MAX_LOGIN_ATTEMPTS || 5)) {
                    user.lockUntil = new Date(Date.now() + Number(process.env.ACCOUNT_LOCK_MINUTES || 15) * 60 * 1000);
                }
                await user.save({ validateBeforeSave: false });
            }
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (user.isLocked && user.isLocked()) {
            return res.status(423).json({
                success: false,
                message: "Account locked because of failed login attempts. Please try again later or reset your password.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Contact HR.",
            });
        }

        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id, user.refreshTokenVersion || 0);

        // ── Save refresh token & update login info ──
        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        user.loginCount = (user.loginCount || 0) + 1;
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save({ validateBeforeSave: false });

        // ── Get linked Employee & Role info if exists ──
        const employee = await Employee.findOne({ userId: user._id }).select(
            "employeeId department designation avatar"
        );

        const roleDoc = await Role.findOne({
            $or: [{ code: user.role }, { name: user.role }]
        }).lean();

        res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                mobileNo: user.mobileNo,
                department: employee?.department || user.department,
                organization: user.organization || null,
                avatar: employee?.avatar || user.avatar || null,
                employeeId: employee?.employeeId || null,
                designation: employee?.designation || null,
                rolePermissions: roleDoc?.permissions || null,
                roleMeta: roleDoc ? {
                    id: roleDoc._id,
                    code: roleDoc.code,
                    name: roleDoc.name,
                    level: roleDoc.level
                } : null
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── REFRESH TOKEN ───────────────────────────────────────────────────────────
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token)
            return res
                .status(401)
                .json({ success: false, message: "Refresh token required" });

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).select("+refreshToken +refreshTokenVersion");

        if (!user || user.refreshToken !== token || decoded.version !== (user.refreshTokenVersion || 0)) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid refresh token" });
        }

        const newAccessToken = generateAccessToken(user._id, user.role);
        user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
        const newRefreshToken = generateRefreshToken(user._id, user.refreshTokenVersion);

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        res
            .status(401)
            .json({ success: false, message: "Refresh token expired or invalid" });
    }
};

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET PROFILE ─────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const employee = await Employee.findOne({ userId: req.user._id })
            .populate("reportsTo", "fullName designation")
            .populate("department");

        res.json({ success: true, user, employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        const { name, mobileNo } = req.body;
        const updateData = {};

        if (name) updateData.name = name.trim();
        if (mobileNo) updateData.mobileNo = mobileNo;
        if (req.file) updateData.avatar = `/uploads/avatars/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(req.user._id, updateData, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, message: "Profile updated", user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── CHANGE PASSWORD ─────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select("+password");

        if (!(await user.comparePassword(currentPassword))) {
            return res
                .status(400)
                .json({ success: false, message: "Current password is incorrect" });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email?.toLowerCase() });

        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "No user found with this email" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        await sendEmail({
            to: user.email,
            subject: "HRMS - Password Reset Request",
            html: `<p>Hi ${user.name},</p>
             <p>You requested a password reset. Click the link below (valid for 15 minutes):</p>
             <a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Reset Password</a>
             <p>If you didn't request this, ignore this email.</p>`,
        });

        res.json({
            success: true,
            message: "Password reset link sent to your email",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user)
            return res
                .status(400)
                .json({ success: false, message: "Invalid or expired reset token" });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.refreshToken = null;
        user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        res.json({
            success: true,
            message: "Password reset successfully. Please login.",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET ALL USERS (Admin only) ───────────────────────────────────────────────
const getUsers = async (req, res) => {
    try {
        const { role, isActive, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (role) filter.role = role.toLowerCase();
        if (isActive !== undefined) filter.isActive = isActive === "true";

        const users = await User.find(filter)
            .select("-password -refreshToken -resetPasswordToken")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await User.countDocuments(filter);

        res.json({ success: true, total, page: Number(page), data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── TOGGLE USER STATUS ───────────────────────────────────────────────────────
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "User not found" });

        user.isActive = !user.isActive;
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
            isActive: user.isActive,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const hashedToken = hashToken(req.params.token);
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpire: { $gt: Date.now() },
        }).select("+emailVerificationToken");

        if (!user) return res.status(400).json({ success: false, message: "Invalid or expired verification token" });

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save({ validateBeforeSave: false });

        res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const resendVerificationEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email?.toLowerCase() });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        if (user.emailVerified) return res.json({ success: true, message: "Email is already verified" });
        await sendVerificationEmail(user);
        res.json({ success: true, message: "Verification email sent" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    getUsers,
    toggleUserStatus,
};
