const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    // ─── Personal Info ──────────────────────────────────────────────────────────
    fullName: { type: String, required: [true, "Full name is required"], trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobileNo: { type: String, required: true },
    alternatePhone: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
    maritalStatus: { type: String, enum: ["Single", "Married", "Divorced", "Widowed"] },
    nationality: { type: String, default: "Indian" },
    avatar: { type: String },

    // ─── Address ─────────────────────────────────────────────────────────────────
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" }
    },
    permanentAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" }
    },

    // ─── Employment Info ──────────────────────────────────────────────────────────
    employeeId: { type: String, unique: true }, // Auto-generated e.g. EMP-0001
    department: { type: String, required: true },
    designation: { type: String, required: true }, // e.g. "Software Engineer"
    role: { type: String, required: true },        // system role: employee, manager etc
    reportsTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // Manager
    joiningDate: { type: Date, default: Date.now },
    confirmationDate: { type: Date },
    employmentType: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract", "Intern", "Probation"],
        default: "Full-time"
    },
    employmentStatus: {
        type: String,
        enum: ["Active", "On Notice", "Resigned", "Terminated", "On Leave"],
        default: "Active"
    },
    workLocation: { type: String, enum: ["Office", "Remote", "Hybrid"], default: "Office" },
    shiftTiming: {
        start: { type: String, default: "09:00" }, // "09:00"
        end: { type: String, default: "18:00" }    // "18:00"
    },
    weeklyOffDays: { type: [String], default: ["Saturday", "Sunday"] },

    // ─── Salary ──────────────────────────────────────────────────────────────────
    salary: {
        basic: { type: Number, default: 0 },
        hra: { type: Number, default: 0 },
        da: { type: Number, default: 0 },
        ta: { type: Number, default: 0 },
        otherAllowances: { type: Number, default: 0 },
        pf: { type: Number, default: 0 },
        esi: { type: Number, default: 0 },
        tds: { type: Number, default: 0 }
    },

    // ─── Bank Details ─────────────────────────────────────────────────────────────
    bankDetails: {
        accountHolderName: String,
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        branchName: String,
        accountType: { type: String, enum: ["Savings", "Current"] }
    },

    // ─── Emergency Contact ────────────────────────────────────────────────────────
    emergencyContact: {
        name: String,
        relation: String,
        phone: String
    },

    // ─── Documents & IDs ──────────────────────────────────────────────────────────
    documents: {
        aadhar: String,
        pan: String,
        passport: String,
        drivingLicense: String
    },

    // ─── Biometric ────────────────────────────────────────────────────────────────
    biometricId: { type: String, unique: true, sparse: true },

    // ─── Leave Balance ────────────────────────────────────────────────────────────
    leaveBalance: {
        sick: { type: Number, default: 12 },
        casual: { type: Number, default: 12 },
        earned: { type: Number, default: 15 },
        unpaid: { type: Number, default: 0 }
    },

    // ─── Skills & Education ───────────────────────────────────────────────────────
    skills: [{ type: String }],
    education: [{
        degree: String,
        institution: String,
        year: Number,
        percentage: String
    }],
    experience: [{
        company: String,
        designation: String,
        from: Date,
        to: Date,
        isCurrent: Boolean
    }],

    // ─── System link ─────────────────────────────────────────────────────────────
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    isActive: { type: Boolean, default: true },
    exitDate: { type: Date },
    exitReason: { type: String }
}, { timestamps: true });

// Auto-generate Employee ID before save
employeeSchema.pre("save", async function (next) {
    if (!this.employeeId) {
        const count = await mongoose.model("Employee").countDocuments();
        this.employeeId = `EMP-${String(count + 1).padStart(4, "0")}`;
    }
    next();
});

// Virtual: Full CTC
employeeSchema.virtual("grossSalary").get(function () {
    const s = this.salary;
    return (s.basic || 0) + (s.hra || 0) + (s.da || 0) + (s.ta || 0) + (s.otherAllowances || 0);
});

// Virtual: Net Salary (after deductions)
employeeSchema.virtual("netSalary").get(function () {
    const gross = this.grossSalary;
    const s = this.salary;
    return gross - (s.pf || 0) - (s.esi || 0) - (s.tds || 0);
});

employeeSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Employee", employeeSchema);
