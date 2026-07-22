const logger = require("../utils/logger");

const startBiometricListener = async (io) => {
    const { BIOMETRIC_IP, BIOMETRIC_PORT } = process.env;

    if (!BIOMETRIC_IP) {
        logger.warn("⚠️  Biometric IP not configured. Biometric listener not started.");
        return;
    }

    try {
        const ZKLib = require("node-zklib");
        const zkInstance = new ZKLib(BIOMETRIC_IP, parseInt(BIOMETRIC_PORT) || 4370, 10000, 4000);

        await zkInstance.createSocket();
        logger.info(`✅ Connected to Biometric Machine at ${BIOMETRIC_IP}:${BIOMETRIC_PORT}`);

        zkInstance.getRealTimeLogs(async (data) => {
            logger.info(`👆 Fingerprint scanned: UserID ${data.userId}`);
            await processBiometricPunch(data.userId, io);
        });

    } catch (err) {
        logger.error("❌ Biometric connection failed:", err.message);
        // Retry after 30s
        logger.info("🔁 Retrying biometric connection in 30 seconds...");
        setTimeout(() => startBiometricListener(io), 30000);
    }
};

const processBiometricPunch = async (machineUserId, io) => {
    const Attendance = require("../models/attendanceModel");
    const Employee = require("../models/employeeModel");

    try {
        const employee = await Employee.findOne({ biometricId: String(machineUserId) });

        if (!employee) {
            logger.warn(`⚠️  Unregistered biometric ID scanned: ${machineUserId}`);
            return;
        }

        const today = new Date().toISOString().split("T")[0];
        const timeNow = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

        let record = await Attendance.findOne({ employeeId: employee._id, date: today });

        if (!record) {
            // First punch = Check In
            record = new Attendance({
                employeeId: employee._id,
                date: today,
                status: "Present",
                checkIn: timeNow,
                checkOut: "-",
                punchSource: "Biometric"
            });
        } else if (record.checkOut === "-") {
            // Second punch = Check Out
            record.checkOut = timeNow;

            // Calculate total hours
            const calcHours = (cin, cout) => {
                try {
                    const toMin = (t) => {
                        const [time, period] = t.split(" ");
                        let [h, m] = time.split(":").map(Number);
                        if (period === "PM" && h !== 12) h += 12;
                        if (period === "AM" && h === 12) h = 0;
                        return h * 60 + m;
                    };
                    const diff = toMin(cout) - toMin(cin);
                    return diff > 0 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : "0h 0m";
                } catch { return "0h 0m"; }
            };
            record.totalHours = calcHours(record.checkIn, timeNow);
        }

        await record.save();
        await record.populate("employeeId", "fullName designation department avatar");

        // Real-time update to all connected frontends
        io.emit("attendance_updated", record);

        logger.info(`✅ Punch saved: ${employee.fullName} at ${timeNow}`);
    } catch (error) {
        logger.error("Biometric punch error:", error.message);
    }
};

module.exports = startBiometricListener;
