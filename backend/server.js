// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const helmet = require("helmet");
// const morgan = require("morgan");
// const cookieParser = require("cookie-parser");
// const mongoSanitize = require("express-mongo-sanitize");
// const swaggerUi = require("swagger-ui-express");
// const http = require("http");
// const { Server } = require("socket.io");
// const jwt = require("jsonwebtoken");
// const User = require("./models/userModel");
// const { Conversation, CallLog } = require("./models/communicationModel");
// const rateLimit = require("express-rate-limit");
// const cron = require("node-cron");
// const path = require("path");

// const logger = require("./utils/logger");
// const { errorHandler, notFound } = require("./middleware/errorMiddleware");
// const auditMiddleware = require("./middleware/auditMiddleware");
// const swaggerSpec = require("./docs/swagger");
// const startBiometricListener = require("./biomatricListner/biometricListener");
// const { markAbsentEmployees } = require("./utils/cronJobs");

// // ─── Route Imports ─────────────────────────────────────────────────────────────
// const authRoutes = require("./routes/authRoutes");
// const employeeRoutes = require("./routes/employeeRoutes");
// const leaveRoutes = require("./routes/leaveRoutes");
// const payrollRoutes = require("./routes/payrollRoutes");
// const mainRoutes = require("./routes/routes");
// const meetingRoutes = require("./routes/meetingRoutes");
// const chatRoutes = require("./routes/chatRoutes");

// const app = express();
// const server = http.createServer(app);

// // Do not expose Express implementation details in response headers.
// app.disable("x-powered-by");

// // ─── Socket.io Setup ──────────────────────────────────────────────────────────
// const io = new Server(server, {
//     cors: { origin: process.env.CLIENT_URL || "*", methods: ["GET", "POST"] }
// });
// app.set("io", io);

// const setupSocketServer = require("./socketServer");
// setupSocketServer(io);

// // ─── Security Middleware ──────────────────────────────────────────────────────
// app.use(helmet());
// app.use(cors({
//     origin: process.env.CLIENT_URL || "*",
//     credentials: true
// }));

// // Rate Limiting
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 200,
//     message: "Too many requests from this IP, please try again later."
// });
// app.use("/api/auth", limiter);

// // General API abuse protection. Authentication/authorization still remains
// // mandatory on protected routes; this only limits request flooding.
// const apiLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 1000,
//     standardHeaders: true,
//     legacyHeaders: false,
//     message: "Too many API requests from this IP, please try again later."
// });
// app.use("/api", apiLimiter);

// // ─── General Middleware ───────────────────────────────────────────────────────
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(mongoSanitize());
// app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));
// app.use(auditMiddleware);

// // Static files for uploads
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// // ─── API Routes ───────────────────────────────────────────────────────────────
// app.use("/api/auth", authRoutes);
// app.use("/api/employees", employeeRoutes);
// app.use("/api/leaves", leaveRoutes);
// app.use("/api/payroll", payrollRoutes);
// app.use("/api/communication", require("./routes/communicationRoutes"));
// app.use("/api/meetings", meetingRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api", mainRoutes);  // departments, projects, attendance, assets, expenses, settings, dashboard

// app.get("/", (req, res) => res.json({ message: "HRMS API Running 🚀", version: "2.0.0" }));
// app.get("/health", (req, res) => res.json({ status: "OK", uptime: process.uptime() }));

// // ─── Error Handling ───────────────────────────────────────────────────────────
// app.use(notFound);
// app.use(errorHandler);

// // ─── Cron Jobs ────────────────────────────────────────────────────────────────
// cron.schedule("59 23 * * *", () => {
//     markAbsentEmployees();
//     logger.info("Cron: Absent marking job ran");
// }, { timezone: process.env.COMPANY_TIMEZONE || "Asia/Kolkata" });

// // ─── DB + Server Start ────────────────────────────────────────────────────────
// const PORT = process.env.PORT || 5000;

// const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hrms_db";

// mongoose.connect(MONGO_URI)
//     .then(() => {
//         logger.info("MongoDB Connected ✅");
//         server.listen(PORT, () => {
//             logger.info(`Server running on port ${PORT} 🚀`);
//             if (process.env.NODE_ENV !== "test") {
//                 startBiometricListener(io);
//             }
//         });
//     })
//     .catch(err => {
//         logger.error("DB Connection Error:", err);
//         process.exit(1);
//     });

// process.on("SIGTERM", () => {
//     logger.info("SIGTERM received, shutting down gracefully");
//     server.close(() => process.exit(0));
// });

// module.exports = { app, server };


require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const swaggerUi = require("swagger-ui-express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const { Conversation, CallLog } = require("./models/communicationModel");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
const path = require("path");
const logger = require("./utils/logger");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const auditMiddleware = require("./middleware/auditMiddleware");
const swaggerSpec = require("./docs/swagger");
const startBiometricListener = require("./biomatricListner/biometricListener");
const { markAbsentEmployees } = require("./utils/cronJobs");

// ─── Route Imports ─────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const mainRoutes = require("./routes/routes");
const meetingRoutes = require("./routes/meetingRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);

// ─── CORS Origins ──────────────────────────────────────────────────────────────
// Supports both localhost development and LAN access.
// CLIENT_URL can contain one or more comma-separated origins.
const envOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://10.28.64.135:5173",
    ...envOrigins,
].filter((origin, index, origins) => origins.indexOf(origin) === index);

const corsOptions = {
    origin: function (origin, callback) {
        // Requests such as Postman/server-to-server requests may have no Origin.
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin.replace(/\/$/, ""))) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
    ],
};

// Do not expose Express implementation details in response headers.
app.disable("x-powered-by");

// ─── Socket.io Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: corsOptions,
});

app.set("io", io);

const setupSocketServer = require("./socketServer");
setupSocketServer(io);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));

// Handle CORS preflight requests explicitly.
app.options("*", cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: "Too many requests from this IP, please try again later.",
});

app.use("/api/auth", limiter);

// General API abuse protection. Authentication/authorization still remains
// mandatory on protected routes; this only limits request flooding.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many API requests from this IP, please try again later.",
});

app.use("/api", apiLimiter);

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(
    morgan("combined", {
        stream: {
            write: (msg) => logger.info(msg.trim()),
        },
    })
);
app.use(auditMiddleware);

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/communication", require("./routes/communicationRoutes"));
app.use("/api/meetings", meetingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", mainRoutes); // departments, projects, attendance, assets, expenses, settings, dashboard

app.get("/", (req, res) =>
    res.json({
        message: "HRMS API Running 🚀",
        version: "2.0.0",
    })
);

app.get("/health", (req, res) =>
    res.json({
        status: "OK",
        uptime: process.uptime(),
    })
);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Cron Jobs ────────────────────────────────────────────────────────────────
cron.schedule(
    "59 23 * * *",
    () => {
        markAbsentEmployees();
        logger.info("Cron: Absent marking job ran");
    },
    {
        timezone: process.env.COMPANY_TIMEZONE || "Asia/Kolkata",
    }
);

// ─── DB + Server Start ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";
const MONGO_URI =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hrms_db";

mongoose
    .connect(MONGO_URI)
    .then(() => {
        logger.info("MongoDB Connected ✅");

        server.listen(PORT, HOST, () => {
            logger.info(`Server running on http://${HOST}:${PORT} 🚀`);

            if (HOST === "0.0.0.0") {
                logger.info(`LAN API: http://10.28.64.135:${PORT}/api`);
            }

            if (process.env.NODE_ENV !== "test") {
                startBiometricListener(io);
            }
        });
    })
    .catch((err) => {
        logger.error("DB Connection Error:", err);
        process.exit(1);
    });

process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");
    server.close(() => process.exit(0));
});

module.exports = { app, server };
