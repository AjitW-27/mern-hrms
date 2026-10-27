const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["sick", "casual", "earned", "unpaid"],
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comment: String,
    approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    isHalfDay: { type: Boolean, default: false },
    halfDayPeriod: String,
    supportingDocument: String,
    // Total days for the requested leave (including half‑day handling)
    totalDays: { type: Number },
    // Tracks whether balance has already been deducted for this leave
    balanceDeducted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);
