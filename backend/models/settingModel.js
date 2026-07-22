const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    companyName: { type: String, default: "Acme Corp" },
    supportEmail: { type: String, default: "admin@acme.com" },
    emailNotifications: { type: Boolean, default: true },
    payrollAlerts: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);