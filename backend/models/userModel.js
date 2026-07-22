const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
        select: false,
    },

    mobileNo: {
        type: String,
        required: true,
    },

    employeeId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        set: value => value === "" || value === null ? undefined : value,
    },

    designation: {
        type: String,
        required: false,
        trim: true,
    },

    joiningDate: {
        type: Date,
        required: false,
    },

    department: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ["superadmin", "admin", "hr", "manager", "employee"],
        default: "employee",
    },

    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        default: null,
    },

    employeeRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
    },

    avatar: {
        type: String,
        default: null,
    },

    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Proper duplicate error messages
function handleDuplicateKeyError(error, doc, next) {
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];

        if (field === "employeeId") {
            return next(new Error("Employee ID already exists"));
        }

        if (field === "email") {
            return next(new Error("Email already exists"));
        }
    }

    next(error);
}

userSchema.post("save", handleDuplicateKeyError);
userSchema.post("findOneAndUpdate", handleDuplicateKeyError);
userSchema.post("updateOne", handleDuplicateKeyError);

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    delete obj.resetPasswordToken;
    delete obj.emailVerificationToken;
    delete obj.twoFactorSecret;
    return obj;
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);