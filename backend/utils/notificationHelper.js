const { Notification } = require("../models/otherModel");
const User = require("../models/userModel");
const logger = require("./logger");

/**
 * Create notification(s)
 * @param {Object} options
 * @param {string} [options.recipientId] - Single user ID
 * @param {string[]} [options.recipientRole] - Create for all users with these roles
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} options.type
 * @param {ObjectId} [options.relatedId]
 * @param {string} [options.relatedModel]
 * @param {string} [options.priority]
 */
const createNotification = async ({ recipientId, recipientRole, title, message, type, relatedId, relatedModel, priority = "normal" }) => {
    try {
        let recipientIds = [];

        if (recipientId) {
            recipientIds = [recipientId];
        } else if (recipientRole && recipientRole.length > 0) {
            const users = await User.find({ role: { $in: recipientRole }, isActive: true }).select("_id");
            recipientIds = users.map(u => u._id);
        }

        if (recipientIds.length === 0) return;

        const notifications = recipientIds.map(recipient => ({
            recipient,
            title,
            message,
            type,
            relatedId,
            relatedModel,
            priority
        }));

        const created = await Notification.insertMany(notifications);
        logger.info(`${created.length} notifications created`);
        return created;
    } catch (error) {
        logger.error(`Notification creation failed: ${error.message}`);
    }
};

module.exports = { createNotification };
