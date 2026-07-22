const mongoose = require("mongoose");

const checklistSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    owner: { type: String },
    dueDate: { type: Date },
    status: { type: String, enum: ["Pending", "In Progress", "Done"], default: "Pending" }
  },
  { _id: false }
);

const onboardingSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    templateName: { type: String, required: true },
    stage: { type: String, enum: ["Offer", "Documentation", "IT Setup", "Orientation", "Probation", "Completed"], default: "Offer" },
    owner: { type: String },
    checklist: { type: [checklistSchema], default: [] },
    notes: { type: String, trim: true },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Onboarding", onboardingSchema);
