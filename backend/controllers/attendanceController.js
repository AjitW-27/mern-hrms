const Attendance = require("../models/attendanceModel");
const Employee = require("../models/employeeModel");
const { Holiday } = require("../models/otherModel");
const { createNotification } = require("../utils/notificationHelper");
const asyncHandler = require("../utils/asyncHandler");

const getAttendance = asyncHandler(async (req, res) => {
    const { date, month, year, employeeId, status, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;

    if (date) {
        filter.date = date;
    } else if (month && year) {
        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const endDate = `${year}-${String(month).padStart(2, "0")}-31`;
        filter.date = { $gte: startDate, $lte: endDate };
    }

    const [records, total] = await Promise.all([
        Attendance.find(filter)
            .populate("employeeId", "fullName employeeId department designation avatar")
            .populate("overrideBy", "name")
            .sort({ date: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit)),
        Attendance.countDocuments(filter)
    ]);

    res.json({ success: true, total, page: Number(page), data: records });
});

const getMyAttendance = asyncHandler(async (req, res) => {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return res.status(404).json({ success: false, message: "Employee profile not found" });

    const { month, year } = req.query;
    const filter = { employeeId: employee._id };

    if (month && year) {
        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const endDate = `${year}-${String(month).padStart(2, "0")}-31`;
        filter.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });

    const summary = {
        present: records.filter(r => r.status === "Present").length,
        absent: records.filter(r => r.status === "Absent").length,
        late: records.filter(r => r.status === "Late").length,
        halfDay: records.filter(r => r.status === "Half Day").length,
        onLeave: records.filter(r => r.status === "On Leave").length,
    };

    res.json({ success: true, summary, data: records });
});

const biometricPunch = asyncHandler(async (req, res) => {
    const deviceKey = req.headers["x-biometric-key"] || req.headers["x-device-key"];
    if (process.env.BIOMETRIC_API_KEY && deviceKey !== process.env.BIOMETRIC_API_KEY) {
        return res.status(401).json({ success: false, message: "Unauthorized biometric device" });
    }

    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ success: false, message: "employeeId is required" });

    const today = new Date().toISOString().split("T")[0];
    const timeNow = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    let record = await Attendance.findOne({ employeeId, date: today });

    if (!record) {
        record = new Attendance({
            employeeId,
            date: today,
            status: "Present",
            checkIn: timeNow,
            punchSource: "Biometric"
        });
    } else if (record.checkOut === "-") {
        record.checkOut = timeNow;
        record.totalHours = calculateHours(record.checkIn, timeNow);
    }

    await record.save();
    await record.populate("employeeId", "fullName designation department avatar");

    const io = req.app.get("io");
    if (io) io.emit("attendance_updated", record);

    res.status(200).json({ success: true, message: "Punch recorded", data: record });
});

const manualAttendance = asyncHandler(async (req, res) => {
    const { employeeId, date, status, checkIn, checkOut, remarks } = req.body;
    let record = await Attendance.findOne({ employeeId, date });
    const totalHours = checkIn && checkOut ? calculateHours(checkIn, checkOut) : "0h 0m";

    if (record) {
        record.status = status;
        record.checkIn = checkIn || record.checkIn;
        record.checkOut = checkOut || record.checkOut;
        record.totalHours = totalHours;
        record.isManualOverride = true;
        record.overrideBy = req.user._id;
        record.overrideReason = remarks;
        record.punchSource = "Manual";
    } else {
        record = new Attendance({
            employeeId, date, status,
            checkIn: checkIn || "-",
            checkOut: checkOut || "-",
            totalHours,
            punchSource: "Manual",
            isManualOverride: true,
            overrideBy: req.user._id,
            overrideReason: remarks
        });
    }

    await record.save();
    await record.populate("employeeId", "fullName designation department");

    const io = req.app.get("io");
    if (io) io.emit("attendance_updated", record);

    res.json({ success: true, message: "Attendance updated manually", data: record });
});

const markAbsentForToday = async () => {
    const today = new Date().toISOString().split("T")[0];
    const holiday = await Holiday.findOne({ date: new Date(today) });
    const dayName = new Date(today).toLocaleDateString("en-IN", { weekday: "long" });
    const weekends = ["Saturday", "Sunday"];

    if (holiday || weekends.includes(dayName)) return;

    const employees = await Employee.find({ isActive: true }).select("_id");
    const existingRecords = await Attendance.find({ date: today }).select("employeeId");
    const presentIds = existingRecords.map(r => r.employeeId.toString());
    const absentEmployees = employees.filter(e => !presentIds.includes(e._id.toString()));

    const absentRecords = absentEmployees.map(e => ({
        employeeId: e._id,
        date: today,
        status: "Absent",
        checkIn: "-",
        checkOut: "-"
    }));

    if (absentRecords.length > 0) {
        await Attendance.insertMany(absentRecords, { ordered: false });
        console.log(`Marked ${absentRecords.length} employees as absent for ${today}`);
    }
};

const getAttendanceSummary = asyncHandler(async (req, res) => {
    const { month, year } = req.query;
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

    const summary = await Attendance.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate } } },
        {
            $group: {
                _id: { employeeId: "$employeeId", status: "$status" },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: "$_id.employeeId",
                statusBreakdown: {
                    $push: { status: "$_id.status", count: "$count" }
                }
            }
        },
        {
            $lookup: {
                from: "employees",
                localField: "_id",
                foreignField: "_id",
                as: "employee"
            }
        },
        { $unwind: "$employee" },
        {
            $project: {
                "employee.fullName": 1,
                "employee.employeeId": 1,
                "employee.department": 1,
                statusBreakdown: 1
            }
        }
    ]);

    res.json({ success: true, data: summary });
});

const calculateHours = (checkIn, checkOut) => {
    try {
        const toMinutes = (timeStr) => {
            const [time, period] = timeStr.split(" ");
            let [hours, minutes] = time.split(":").map(Number);
            if (period === "PM" && hours !== 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };
        const totalMin = toMinutes(checkOut) - toMinutes(checkIn);
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        return totalMin > 0 ? `${h}h ${m}m` : "0h 0m";
    } catch {
        return "0h 0m";
    }
};

module.exports = {
  getAttendance,
  getMyAttendance,
  biometricPunch,
  manualAttendance,
  markAbsentForToday,
  getAttendanceSummary,
  getAll: getAttendance,
  createOne: manualAttendance,
  updateOne: manualAttendance,
  deleteOne: asyncHandler(async (req, res) => {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Attendance not found" });
    res.json({ success: true, message: "Attendance deleted" });
  }),
  punchBiometric: biometricPunch
};
