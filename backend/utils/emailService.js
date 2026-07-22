const nodemailer = require("nodemailer");
const logger = require("./logger");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.FROM_NAME || "HRMS"}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text
        });
        logger.info(`Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error(`Email failed to ${to}: ${error.message}`);
        throw error;
    }
};

module.exports = { sendEmail };
