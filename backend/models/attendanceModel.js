const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    status: {
        type: String,
        enum: ["Present", "Absent", "Late", "Half Day", "On Leave", "Holiday", "Weekend"],
        required: true
    },
    checkIn: { type: String, default: "-" },    // "09:00 AM"
    checkOut: { type: String, default: "-" },   // "06:00 PM"
    totalHours: { type: String, default: "0h 0m" },
    overtimeHours: { type: String, default: "0h 0m" },
    punchSource: {
        type: String,
        enum: ["Biometric", "Manual", "Web", "Mobile"],
        default: "Biometric"
    },
    // Manual override by HR
    isManualOverride: { type: Boolean, default: false },
    overrideBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    overrideReason: { type: String },
    remarks: { type: String },
    // Shift reference
    shift: {
        start: String,
        end: String
    },
    // Work from home flag
    isWFH: { type: Boolean, default: false },
    location: { type: String }  // GPS location if mobile punch
}, { timestamps: true });

// Compound index to prevent duplicate records per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
