const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    type: { type: String, enum: ["OKR", "KRA", "Personal", "Team"], default: "OKR" },
    owner: { type: String, trim: true },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: ["Not Started", "In Progress", "Achieved", "Blocked"], default: "Not Started" },
    dueDate: { type: Date },
    description: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
