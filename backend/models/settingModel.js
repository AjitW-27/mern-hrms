const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    companyName: { type: String, default: "Acme Corp" },
    supportEmail: { type: String, default: "admin@acme.com" },
    emailNotifications: { type: Boolean, default: true },
    payrollAlerts: { type: Boolean, default: true },
    rbacEnabled: { type: Boolean, default: false },
    // Tracks the one-time migration to the safe initial mode (disabled).
    rbacModeInitialized: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);