const mongoose = require("mongoose");
const Settings = require("./settingModel");
const Performance = require("./performanceModel");

// ANNOUNCEMENT
const announcementSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        audience: {
            type: String,
            enum: ["All", "Department", "Role"],
            default: "All",
        },
        targetDepartment: String,
        targetRole: String,
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// PERFORMANCE
const performanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        feedback: String,
        reviewPeriod: String,
        status: {
            type: String,
            enum: ["Pending", "Completed", "Acknowledged"],
            default: "Pending",
        },
        employeeComments: String,
        acknowledgedAt: Date,
    },
    { timestamps: true }
);

// DOCUMENT
const documentSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
        },
        documentType: {
            type: String,
            required: true,
        },
        fileName: String,
        filePath: String,
        fileSize: Number,
        mimeType: String,
        description: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

// HOLIDAY
const holidaySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        date: { type: Date, required: true },
        year: { type: Number, required: true },
        type: {
            type: String,
            enum: ["Public", "Optional"],
            default: "Public",
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// NOTIFICATION
const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: { type: String, trim: true },
        message: { type: String, trim: true },
        type: {
            type: String,
            enum: ["leave", "payroll", "task", "announcement", "system", "attendance", "expense"],
            default: "system",
        },
        priority: {
            type: String,
            enum: ["low", "normal", "high", "urgent"],
            default: "normal",
        },
        relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
        relatedModel: { type: String, default: null },
        isRead: { type: Boolean, default: false },
        readAt: Date
    },
    { timestamps: true }
);

const Announcement = mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);
// const Performance = mongoose.models.Performance || mongoose.model("Performance", performanceSchema);
const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);
const Holiday = mongoose.models.Holiday || mongoose.model("Holiday", holidaySchema);
const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

module.exports = {
    Announcement,
    Performance,
    Document,
    Holiday,
    Notification,
    Settings
};
