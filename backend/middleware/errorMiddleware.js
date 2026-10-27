const logger = require("../utils/logger");

const notFound = (req, res, next) => {
    const error = new Error("Route not found");
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    let message = "Internal Server Error";

    // Mongoose CastError
    if (err.name === "CastError") {
        message = "Resource not found";
        statusCode = 404;
    }

    // Mongoose Validation Error
    else if (err.name === "ValidationError") {
        message = Object.values(err.errors)
            .map((e) => e.name === "CastError" || e.kind === "ObjectId" ? `Select a valid ${e.path || "record"}.` : e.message)
            .join(", ");

        statusCode = 400;
    }

    // Mongoose Duplicate Key
    else if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];

        message = field
            ? `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
            : "Duplicate value";

        statusCode = 400;
    }

    // JWT Errors
    else if (err.name === "JsonWebTokenError") {
        message = "Invalid token";
        statusCode = 401;
    }

    else if (err.name === "TokenExpiredError") {
        message = "Token expired";
        statusCode = 401;
    }

    else if (Number(err.statusCode) >= 400 && Number(err.statusCode) < 500) {
        statusCode = Number(err.statusCode);
        message = err.message;
    }

    // 404 route
    else if (statusCode === 404) {
        message = "Route not found";
    }

    // Log complete error internally
    logger.error(
        `${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );

    // NEVER send stack trace to client
    res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = {
    notFound,
    errorHandler,
};