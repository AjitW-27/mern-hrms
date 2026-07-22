const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    timezone: { type: String, default: "Asia/Kolkata" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);