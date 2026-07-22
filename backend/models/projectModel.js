const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    status: { type: String, enum: ["Todo", "In Progress", "Done", "Blocked"], default: "Todo" },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    dueDate: Date,
    completedAt: Date
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true },
    client: { type: String },
    description: { type: String },
    startDate: { type: Date },
    deadline: { type: Date },
    completedDate: { type: Date },
    status: {
        type: String,
        enum: ["Not Started", "In Progress", "Completed", "Delayed", "On Hold", "Cancelled"],
        default: "Not Started"
    },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    budget: { type: Number, default: 0 },
    budgetUsed: { type: Number, default: 0 },

    // Team
    projectManager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],

    // Tasks
    tasks: [taskSchema],

    // Attachments
    attachments: [{ name: String, path: String, uploadedAt: Date }],

    tags: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-generate project code
projectSchema.pre("save", async function (next) {
    if (!this.code) {
        const count = await mongoose.model("Project").countDocuments();
        this.code = `PRJ-${String(count + 1).padStart(4, "0")}`;
    }
    next();
});

module.exports = mongoose.model("Project", projectSchema);
