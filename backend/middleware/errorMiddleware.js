const logger = require("../utils/logger");

const notFound = (req, res, next) => {
    const error = new Error(`Route Not Found: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Mongoose CastError (invalid ObjectId)
    if (err.name === "CastError") {
        message = "Resource not found";
        statusCode = 404;
    }

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        message = Object.values(err.errors).map(e => e.message).join(", ");
        statusCode = 400;
    }

    // Mongoose Duplicate Key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        statusCode = 400;
    }

    // JWT Errors
    if (err.name === "JsonWebTokenError") {
        message = "Invalid token";
        statusCode = 401;
    }
    if (err.name === "TokenExpiredError") {
        message = "Token expired";
        statusCode = 401;
    }

    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
};

module.exports = { notFound, errorHandler };
