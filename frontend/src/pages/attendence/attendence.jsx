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
import execReq, { SOCKET_BASE_URL } from "../../lib/execReq";

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
        const response = await execReq(`/attendance?date=${encodeURIComponent(filterDate)}`);
        const result = response.data;

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
    const attendanceToken =
      localStorage.getItem("hrms_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");
    const socket = io(SOCKET_BASE_URL, {
      auth: { token: attendanceToken },
    });

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
      bg: "rgba(16,185,129,.12)",
    },
    {
      title: "Absent",
      count: stats.absent,
      icon: <AbsentIcon />,
      color: "#ef4444",
      bg: "rgba(239,68,68,.12)",
    },
    {
      title: "Late Check-in",
      count: stats.late,
      icon: <LateIcon />,
      color: "#f59e0b",
      bg: "rgba(245,158,11,.12)",
    },
  ];

  // Enhanced Status Chip based on Backend Enum
  const renderStatusChip = (status) => {
    let color = "#64748B";
    let bgColor = "#F1F5F9";

    switch (status) {
      case "Present":
        color = "#10b981";
        bgColor = "rgba(16,185,129,.12)";
        break;

      case "Absent":
        color = "#ef4444";
        bgColor = "rgba(239,68,68,.12)";
        break;

      case "Late":
        color = "#f59e0b";
        bgColor = "rgba(245,158,11,.12)";
        break;

      case "Half Day":
        color = "#8b5cf6";
        bgColor = "rgba(139,92,246,.12)";
        break;

      case "On Leave":
      case "Holiday":
      case "Weekend":
        color = "#4F46E5";
        bgColor = "rgba(79,70,229,.125)";
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
        background: "#F8FAFC",
        minHeight: "100vh",
        color: "#0F172A",
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
          <Typography fontSize={24} fontWeight={600} color="#0F172A">
            Attendance Overview
          </Typography>

          <Typography fontSize={14} color="#64748B" mt={0.5}>
            Monitor daily employee check-ins and working hours
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{
            color: "#334155",
            borderColor: "#E2E8F0",
            background: "#FFFFFF",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "4px",
            height: 42,
            px: 2,

            "&:hover": {
              borderColor: "#CBD5E1",
              backgroundColor: "#F8FAFC",
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
                borderRadius: "4px",

                // Same soft gradient style as Department
                background: "linear-gradient(135deg,#F0FBFC,#D5F1F4)",

                border: "1px solid #E2E8F0",

                boxShadow: "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)",

                display: "flex",
                alignItems: "center",

                transition:
                  "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",

                "&:hover": {
                  transform: "translateY(-6px) scale(1.015)",

                  boxShadow: "0 4px 6px -1px rgba(15,23,42,.07), 0 2px 4px -2px rgba(15,23,42,.05)",

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
                  borderRadius: "4px",
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
                  color="#0F172A"
                >
                  {stat.count}
                </Typography>

                <Typography fontSize={14} color="#64748B" mt={0.5}>
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
                    color: "#64748B",
                  }}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            background: "#FFFFFF",
            borderRadius: "4px",

            "& .MuiInputBase-root": {
              height: 44,
              borderRadius: "4px",
            },

            "& input": {
              color: "#0F172A",
              fontSize: 14,
            },

            "& input::placeholder": {
              color: "#64748B",
              opacity: 1,
            },

            "& fieldset": {
              border: "1px solid #E2E8F0",
            },

            "&:hover fieldset": {
              borderColor: "#CBD5E1",
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
            background: "#FFFFFF",
            borderRadius: "4px",

            "& .MuiInputBase-root": {
              height: 44,
              borderRadius: "4px",
            },

            "& input": {
              color: "#0F172A",
              fontSize: 14,
            },

            "& fieldset": {
              border: "1px solid #E2E8F0",
            },

            "&:hover fieldset": {
              borderColor: "#CBD5E1",
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
          background: "#FFFFFF",
          borderRadius: "4px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)",
          overflow: "hidden",
        }}
      >
        <Table>
          {/* Table Header */}
          <TableHead
            sx={{
              background: "#F8FAFC",
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
                    borderBottom: "1px solid #E2E8F0",
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
                      backgroundColor: "#F8FAFC",
                    },

                    transition: "background-color 0.2s ease",
                  }}
                >
                  {/* Employee */}
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #E2E8F0",
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
                          color="#0F172A"
                          fontSize={14}
                        >
                          {row?.employeeId?.fullName || "Unknown"}
                        </Typography>

                        <Typography fontSize={12} color="#64748B">
                          {row?.employeeId?.designation || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Date */}
                  <TableCell
                    sx={{
                      color: "#334155",
                      borderBottom: "1px solid #E2E8F0",
                      fontSize: 14,
                    }}
                  >
                    {row?.date}
                  </TableCell>

                  {/* Status */}
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    {renderStatusChip(row?.status)}
                  </TableCell>

                  {/* Check In */}
                  <TableCell
                    sx={{
                      color: "#334155",
                      borderBottom: "1px solid #E2E8F0",
                      fontSize: 14,
                    }}
                  >
                    {row?.checkIn}
                  </TableCell>

                  {/* Check Out */}
                  <TableCell
                    sx={{
                      color: "#334155",
                      borderBottom: "1px solid #E2E8F0",
                      fontSize: 14,
                    }}
                  >
                    {row?.checkOut}
                  </TableCell>

                  {/* Total Hours */}
                  <TableCell
                    sx={{
                      color: "#0F172A",
                      fontWeight: 600,
                      borderBottom: "1px solid #E2E8F0",
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
                    color: "#64748B",
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
