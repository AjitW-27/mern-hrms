const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    cycle: { type: String, required: true },
    reviewer: { type: String, trim: true }, // <--- Changed to String
    score: { type: Number, min: 0, max: 5, default: 0 }, // <--- Max 5
    rating: { type: String, trim: true }, // <--- Changed to String
    summary: { type: String, trim: true },
    feedback: { type: String, trim: true },
    status: { type: String, enum: ["Draft", "Pending Review", "Reviewed", "Closed"], default: "Draft" } // <--- "Pending Review" added to enum
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Performance ||
  mongoose.model("Performance", performanceSchema);


const model = mongoose.models.Performance || mongoose.model("Performance", performanceSchema);
console.log("REVIEWER TYPE:", model.schema.path("reviewer").instance);
console.log("RATING TYPE:", model.schema.path("rating").instance);
console.log("STATUS ENUM:", model.schema.path("status").enumValues);
module.exports = model;