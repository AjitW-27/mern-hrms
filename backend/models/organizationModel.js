const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    legalName: { type: String, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    industry: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    address: { type: String, trim: true },
    timezone: { type: String, default: "Asia/Kolkata" },
    logo: { type: String, default: null },
    settings: {
      payrollCycle: { type: String, default: "Monthly" },
      currency: { type: String, default: "INR" },
      attendanceMode: { type: String, default: "Biometric + Manual" }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
