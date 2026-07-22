const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, trim: true },
    mode: { type: String, enum: ["Online", "Offline", "Hybrid"], default: "Online" },
    instructor: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ["Planned", "Ongoing", "Completed"], default: "Planned" },
    completion: { type: Number, min: 0, max: 100, default: 0 },
    participants: [{ type: String }],
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Training", trainingSchema);
