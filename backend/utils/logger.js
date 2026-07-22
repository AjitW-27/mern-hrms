const winston = require('winston');
const path = require('path');

// Define your custom format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
    })
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'hrms-backend' },
    transports: [
        // 1. Write all ERROR logs to 'logs/error.log'
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error'
        }),

        // 2. Write ALL logs (info, debug, error) to 'logs/combined.log'
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/combined.log')
        }),
    ],
});

// 3. If we're not in production, also log to the Console with colors
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, stack }) => {
                return `[${timestamp}] ${level}: ${stack || message}`;
            })
        )
    }));
}

module.exports = logger;