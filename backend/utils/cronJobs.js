const { markAbsentForToday } = require("../controllers/attendanceController");
const { Notification } = require("../models/otherModel");
const Employee = require("../models/employeeModel");
const logger = require("./logger");

// ─── Mark absent employees ────────────────────────────────────────────────────
const markAbsentEmployees = async () => {
    try {
        await markAbsentForToday();
        logger.info("✅ Cron: Absent marking completed");
    } catch (error) {
        logger.error("❌ Cron: Absent marking failed:", error.message);
    }
};

// ─── Birthday reminders ───────────────────────────────────────────────────────
const sendBirthdayNotifications = async () => {
    try {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        const employees = await Employee.find({
            isActive: true,
            $expr: {
                $and: [
                    { $eq: [{ $month: "$dateOfBirth" }, month] },
                    { $eq: [{ $dayOfMonth: "$dateOfBirth" }, day] }
                ]
            }
        });

        for (const emp of employees) {
            if (emp.userId) {
                const { createNotification } = require("./notificationHelper");
                await createNotification({
                    recipientId: emp.userId,
                    title: "🎂 Happy Birthday!",
                    message: `Wishing you a wonderful birthday, ${emp.fullName}! Have a great day!`,
                    type: "general"
                });
            }
        }

        logger.info(`🎂 Birthday notifications sent to ${employees.length} employees`);
    } catch (error) {
        logger.error("Birthday notification error:", error.message);
    }
};

// ─── Clean old notifications ──────────────────────────────────────────────────
const cleanOldNotifications = async () => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const result = await Notification.deleteMany({
            isRead: true,
            createdAt: { $lt: thirtyDaysAgo }
        });
        logger.info(`🧹 Cleaned ${result.deletedCount} old notifications`);
    } catch (error) {
        logger.error("Notification cleanup error:", error.message);
    }
};

module.exports = { markAbsentEmployees, sendBirthdayNotifications, cleanOldNotifications };
