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
    new Date().toISOString().split("T")[0],
  );

  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Dynamic Stats State
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
  });

  // 1. Calculate Stats function
  const calculateStats = (records) => {
    let present = 0;
    let absent = 0;
    let late = 0;

    records.forEach((record) => {
      if (record?.status === "Present" || record?.status === "Half Day") {
        present++;
      }

      if (record?.status === "Absent") {
        absent++;
      }

      if (record?.status === "Late") {
        late++;
      }
    });

    setStats({
      present,
      absent,
      late,
    });
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

        if (result?.success && Array.isArray(result?.data)) {
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
      if (newRecord?.date !== filterDate) return;

      setAttendanceRecords((prevRecords) => {
        const safeRecords = Array.isArray(prevRecords) ? prevRecords : [];

        const exists = safeRecords.find((r) => r?._id === newRecord?._id);

        let updatedRecords;

        if (exists) {
          // Update Check-Out
          updatedRecords = safeRecords.map((r) =>
            r?._id === newRecord?._id ? newRecord : r,
          );
        } else {
          // Add new Check-In at the top
          updatedRecords = [newRecord, ...safeRecords];
        }

        // Update stats cards instantly
        calculateStats(updatedRecords);

        return updatedRecords;
      });
    });

    return () => socket.disconnect();
  }, [filterDate]);

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

  // Enhanced Status Chip based on Backend Enum
  const renderStatusChip = (status) => {
    let color = "#64748b";
    let bgColor = "#f1f5f9";

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
          fontWeight: 600,
          borderRadius: "6px",
          fontSize: "12px",
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        background: "#f8fafc",
        minHeight: "100vh",
        color: "#0f172a",
      }}
    >
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        gap={2}
        flexWrap="wrap"
      >
        <Box>
          <Typography fontSize={24} fontWeight={600} color="#0f172a">
            Attendance Overview
          </Typography>

          <Typography fontSize={14} color="#64748b" mt={0.5}>
            Monitor daily employee check-ins and working hours
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{
            color: "#334155",
            borderColor: "#e5e7eb",
            background: "#ffffff",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            height: 42,
            px: 2,

            "&:hover": {
              borderColor: "#cbd5e1",
              backgroundColor: "#f8fafc",
            },
          }}
        >
          Export Report
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        {attendanceStatsData.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Box
              sx={{
                p: 2,
                minHeight: 130,
                borderRadius: "8px",

                // Same soft gradient style as Department
                background: `
                  radial-gradient(
                    circle at 0% 0%,
                    ${stat.color}18 0%,
                    transparent 55%
                  ),
                  linear-gradient(
                    135deg,
                    #ffffff 0%,
                    #f8fafc 100%
                  )
                `,

                border: "1px solid #e5e7eb",

                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",

                display: "flex",
                alignItems: "center",

                transition:
                  "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",

                "&:hover": {
                  transform: "translateY(-6px) scale(1.015)",

                  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.10)",

                  borderColor: `${stat.color}55`,
                },
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  flexShrink: 0,
                  borderRadius: "8px",
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

              {/* Content */}
              <Box>
                <Typography
                  fontSize={24}
                  fontWeight={600}
                  lineHeight={1.2}
                  color="#0f172a"
                >
                  {stat.count}
                </Typography>

                <Typography fontSize={14} color="#64748b" mt={0.5}>
                  {stat.title}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Filters & Search */}
      <Box
        display="flex"
        gap={2}
        mb={3}
        flexDirection={{
          xs: "column",
          sm: "row",
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search employee by name..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    color: "#64748b",
                  }}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            background: "#ffffff",
            borderRadius: "8px",

            "& .MuiInputBase-root": {
              height: 44,
              borderRadius: "8px",
            },

            "& input": {
              color: "#0f172a",
              fontSize: 14,
            },

            "& input::placeholder": {
              color: "#64748b",
              opacity: 1,
            },

            "& fieldset": {
              border: "1px solid #e5e7eb",
            },

            "&:hover fieldset": {
              borderColor: "#cbd5e1",
            },

            "& .Mui-focused fieldset": {
              borderColor: "#8b5cf6 !important",
            },
          }}
        />

        {/* Date Filter */}
        <TextField
          type="date"
          variant="outlined"
          size="small"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          sx={{
            flexGrow: 1,
            background: "#ffffff",
            borderRadius: "8px",

            "& .MuiInputBase-root": {
              height: 44,
              borderRadius: "8px",
            },

            "& input": {
              color: "#0f172a",
              fontSize: 14,
            },

            "& fieldset": {
              border: "1px solid #e5e7eb",
            },

            "&:hover fieldset": {
              borderColor: "#cbd5e1",
            },

            "& .Mui-focused fieldset": {
              borderColor: "#8b5cf6 !important",
            },

            "& input::-webkit-calendar-picker-indicator": {
              opacity: 0.7,
              cursor: "pointer",
            },
          }}
        />
      </Box>

      {/* Table Section */}
      <TableContainer
        component={Paper}
        sx={{
          background: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
          overflow: "hidden",
        }}
      >
        <Table>
          {/* Table Header */}
          <TableHead
            sx={{
              background: "#f8fafc",
            }}
          >
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
                    color: "#475569",
                    fontWeight: 600,
                    fontSize: 13,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {attendanceRecords
              .filter((row) => {
                const fullName = (
                  row?.employeeId?.fullName || ""
                ).toLowerCase();

                return fullName.includes(searchTerm.toLowerCase());
              })
              .map((row) => (
                <TableRow
                  key={row?._id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                    },

                    transition: "background-color 0.2s ease",
                  }}
                >
                  {/* Employee */}
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Avatar
                        src={row?.employeeId?.avatar}
                        sx={{
                          mr: 2,
                          bgcolor: "#8b5cf6",
                          width: 35,
                          height: 35,
                          fontSize: 14,
                        }}
                      >
                        {row?.employeeId?.fullName?.[0] || "?"}
                      </Avatar>

                      <Box>
                        <Typography
                          fontWeight={600}
                          color="#0f172a"
                          fontSize={14}
                        >
                          {row?.employeeId?.fullName || "Unknown"}
                        </Typography>

                        <Typography fontSize={12} color="#64748b">
                          {row?.employeeId?.designation || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Date */}
                  <TableCell
                    sx={{
                      color: "#334155",
                      borderBottom: "1px solid #e5e7eb",
                      fontSize: 14,
                    }}
                  >
                    {row?.date}
                  </TableCell>

                  {/* Status */}
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {renderStatusChip(row?.status)}
                  </TableCell>

                  {/* Check In */}
                  <TableCell
                    sx={{
                      color: "#334155",
                      borderBottom: "1px solid #e5e7eb",
                      fontSize: 14,
                    }}
                  >
                    {row?.checkIn}
                  </TableCell>

                  {/* Check Out */}
                  <TableCell
                    sx={{
                      color: "#334155",
                      borderBottom: "1px solid #e5e7eb",
                      fontSize: 14,
                    }}
                  >
                    {row?.checkOut}
                  </TableCell>

                  {/* Total Hours */}
                  <TableCell
                    sx={{
                      color: "#0f172a",
                      fontWeight: 600,
                      borderBottom: "1px solid #e5e7eb",
                      fontSize: 14,
                    }}
                  >
                    {row?.totalHours}
                  </TableCell>
                </TableRow>
              ))}

            {/* Empty State */}
            {attendanceRecords.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: "#64748b",
                    borderBottom: "none",
                    fontSize: 14,
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
