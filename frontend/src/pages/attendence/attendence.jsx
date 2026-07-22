import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  AccessTime as LateIcon,
} from "@mui/icons-material";
import { io } from "socket.io-client";

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0], // Defaults to today: YYYY-MM-DD
  );
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Dynamic Stats State
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0 });

  // 1. Calculate Stats function
  const calculateStats = (records) => {
    let present = 0,
      absent = 0,
      late = 0;
    records.forEach((record) => {
      if (record.status === "Present" || record.status === "Half Day")
        present++;
      if (record.status === "Absent") absent++;
      if (record.status === "Late") late++;
    });
    setStats({ present, absent, late });
  };

  useEffect(() => {
    // 2. Fetch records for the selected date
    const fetchAttendance = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/attendance?date=${filterDate}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setAttendanceRecords(result.data);
          calculateStats(result.data);
        } else {
          setAttendanceRecords([]);
          calculateStats([]);
        }
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        setAttendanceRecords([]);
        calculateStats([]);
      }
    };

    fetchAttendance();

    // 3. Connect to WebSockets for Live Punches
    const socket = io("http://localhost:5000");

    socket.on("attendance_updated", (newRecord) => {
      // Only process live update if it matches our currently viewed date
      if (newRecord.date !== filterDate) return;

      setAttendanceRecords((prevRecords) => {
        const safeRecords = Array.isArray(prevRecords) ? prevRecords : [];
        const exists = safeRecords.find((r) => r._id === newRecord._id);

        let updatedRecords;
        if (exists) {
          // Update Check-Out
          updatedRecords = safeRecords.map((r) =>
            r._id === newRecord._id ? newRecord : r,
          );
        } else {
          // Add new Check-In at the top
          updatedRecords = [newRecord, ...safeRecords];
        }

        calculateStats(updatedRecords); // Update stats cards instantly
        return updatedRecords;
      });
    });

    return () => socket.disconnect();
  }, [filterDate]); // Re-run fetch and socket listener when date changes

  // Dynamic Array for Stats UI
  const attendanceStatsData = [
    {
      title: "Present Today",
      count: stats.present,
      icon: <PresentIcon />,
      color: "#10b981",
      bg: "#10b98120",
    },
    {
      title: "Absent",
      count: stats.absent,
      icon: <AbsentIcon />,
      color: "#ef4444",
      bg: "#ef444420",
    },
    {
      title: "Late Check-in",
      count: stats.late,
      icon: <LateIcon />,
      color: "#f59e0b",
      bg: "#f59e0b20",
    },
  ];

  // Enhanced Status Chip based on your Backend Enum
  const renderStatusChip = (status) => {
    let color = "#94a3b8",
      bgColor = "#334155"; // Default

    switch (status) {
      case "Present":
        color = "#10b981";
        bgColor = "#10b98120";
        break;
      case "Absent":
        color = "#ef4444";
        bgColor = "#ef444420";
        break;
      case "Late":
        color = "#f59e0b";
        bgColor = "#f59e0b20";
        break;
      case "Half Day":
        color = "#8b5cf6";
        bgColor = "#8b5cf620";
        break;
      case "On Leave":
      case "Holiday":
      case "Weekend":
        color = "#3b82f6";
        bgColor = "#3b82f620";
        break;
      default:
        break;
    }

    return (
      <Chip
        label={status}
        size="small"
        sx={{
          background: bgColor,
          color: color,
          fontWeight: "bold",
          borderRadius: "6px",
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: "#0f172a",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography fontSize={24} fontWeight="bold">
            Attendance Overview
          </Typography>
          <Typography fontSize={14} color="#94a3b8" mt={0.5}>
            Monitor daily employee check-ins and working hours
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{
            color: "#e2e8f0",
            borderColor: "#334155",
            textTransform: "none",
            fontWeight: "bold",
            borderRadius: "8px",
            "&:hover": {
              borderColor: "#94a3b8",
              backgroundColor: "rgba(255,255,255,0.05)",
            },
          }}
        >
          Export Report
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        {attendanceStatsData.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Box
              sx={{
                p: 3,
                borderRadius: "16px",
                background: "#131826",
                border: "1px solid #1e293b",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: "12px",
                  background: stat.bg,
                  color: stat.color,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mr: 3,
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography fontSize={24} fontWeight="bold" lineHeight={1.2}>
                  {stat.count}
                </Typography>
                <Typography fontSize={14} color="#94a3b8">
                  {stat.title}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Filters & Search */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          placeholder="Search employee by name..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            background: "#1e293b",
            borderRadius: "8px",
            input: { color: "#fff" },
            "& fieldset": { border: "none" },
          }}
        />
        {/* Date Filter (Triggers API call dynamically) */}
        <TextField
          type="date"
          size="small"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          sx={{
            background: "#1e293b",
            borderRadius: "8px",
            width: "180px",
            input: { color: "#fff" },
            "& fieldset": { border: "none" },
            "& input[type='date']::-webkit-calendar-picker-indicator": {
              filter: "invert(1)",
            },
          }}
        />
      </Box>

      {/* Table Section */}
      <TableContainer
        component={Paper}
        sx={{
          background: "#131826",
          borderRadius: "8px",
          border: "1px solid #1e293b",
        }}
      >
        <Table>
          <TableHead sx={{ background: "#1e293b" }}>
            <TableRow>
              {[
                "Employee",
                "Date",
                "Status",
                "Check In",
                "Check Out",
                "Total Hours",
              ].map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    color: "#94a3b8",
                    fontWeight: "bold",
                    borderBottom: "none",
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceRecords
              .filter((row) => {
                const fullName = (row.employeeId?.fullName || "").toLowerCase();
                return fullName.includes(searchTerm.toLowerCase());
              })
              .map((row) => (
                <TableRow
                  key={row._id}
                  sx={{ "&:hover": { backgroundColor: "#1e293b" } }}
                >
                  <TableCell sx={{ borderBottom: "1px solid #1e293b" }}>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        src={row.employeeId?.avatar}
                        sx={{
                          mr: 2,
                          bgcolor: "#8b5cf6",
                          width: 35,
                          height: 35,
                          fontSize: 14,
                        }}
                      >
                        {row.employeeId?.fullName?.[0] || "?"}
                      </Avatar>
                      <Box>
                        <Typography
                          fontWeight="bold"
                          color="#fff"
                          fontSize={14}
                        >
                          {row.employeeId?.fullName || "Unknown"}
                        </Typography>
                        <Typography fontSize={12} color="#64748b">
                          {row.employeeId?.designation || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#e2e8f0",
                      borderBottom: "1px solid #1e293b",
                      fontSize: 14,
                    }}
                  >
                    {row.date}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #1e293b" }}>
                    {renderStatusChip(row.status)}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#e2e8f0",
                      borderBottom: "1px solid #1e293b",
                      fontSize: 14,
                    }}
                  >
                    {row.checkIn}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#e2e8f0",
                      borderBottom: "1px solid #1e293b",
                      fontSize: 14,
                    }}
                  >
                    {row.checkOut}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#fff",
                      fontWeight: "bold",
                      borderBottom: "1px solid #1e293b",
                      fontSize: 14,
                    }}
                  >
                    {row.totalHours}
                  </TableCell>
                </TableRow>
              ))}

            {/* Show empty state if no records exist for the date */}
            {attendanceRecords.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: "#94a3b8",
                    borderBottom: "none",
                  }}
                >
                  No attendance records found for this date.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Attendance;
