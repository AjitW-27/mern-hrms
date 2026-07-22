const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
    assetName: { type: String, required: true }, // e.g., MacBook Pro
    assetId: { type: String, required: true, unique: true }, // Serial Number / Tag

    // New Fields added based on requirement
    category: { type: String, enum: ["IT", "Non-IT"], default: "IT" },
    type: { type: String, enum: ["Serialized", "Consumable"], default: "Serialized" },
    brand: { type: String },
    model: { type: String },
    condition: { type: String, enum: ["New", "Good", "Fair", "Poor"], default: "New" },
    ownership: { type: String, enum: ["Company Owned", "Leased/Rented"], default: "Company Owned" },

    // Assignment tracking
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // Linked to Employee
    assignedDate: { type: Date },
    returnDate: { type: Date },
    status: { type: String, enum: ["Available", "Assigned", "Under Maintenance"], default: "Available" }
}, { timestamps: true });

module.exports = mongoose.model("Asset", assetSchema);