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

const app = express();
const server = http.createServer(app);

// ─── Socket.io Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "*", methods: ["GET", "POST"] }
});

app.set("io", io);

io.on("connection", (socket) => {
    logger.info(`Frontend connected: ${socket.id}`);

    socket.on("join_room", (userId) => {
        socket.join(`user_${userId}`);
        logger.info(`User ${userId} joined their room`);
    });

    socket.on("disconnect", () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: "Too many requests from this IP, please try again later."
});
app.use("/api/auth", limiter);

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(auditMiddleware);

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api", mainRoutes);  // departments, projects, attendance, assets, expenses, settings, dashboard

app.get("/", (req, res) => res.json({ message: "HRMS API Running 🚀", version: "2.0.0" }));
app.get("/health", (req, res) => res.json({ status: "OK", uptime: process.uptime() }));

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Cron Jobs ────────────────────────────────────────────────────────────────
cron.schedule("59 23 * * *", () => {
    markAbsentEmployees();
    logger.info("Cron: Absent marking job ran");
}, { timezone: process.env.COMPANY_TIMEZONE || "Asia/Kolkata" });

// ─── DB + Server Start ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        logger.info("MongoDB Connected ✅");
        server.listen(PORT, () => {
            logger.info(`Server running on port ${PORT} 🚀`);
            if (process.env.NODE_ENV !== "test") {
                startBiometricListener(io);
            }
        });
    })
    .catch(err => {
        logger.error("DB Connection Error:", err);
        process.exit(1);
    });

process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");
    server.close(() => process.exit(0));
});

module.exports = { app, server };
