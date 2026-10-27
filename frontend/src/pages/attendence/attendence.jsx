import DataTable from "../../components/common/DataTable";
import { Button, Card as Paper, Badge as Chip, Input as TextField, Avatar } from "../../components/common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment } from "@mui/material";

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
        const response = await execReq(
          `/attendance?date=${encodeURIComponent(filterDate)}`,
        );
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
      color: themeColors.success,
      bg: themeColors.overlay16,
    },
    {
      title: "Absent",
      count: stats.absent,
      icon: <AbsentIcon />,
      color: themeColors.primary,
      bg: themeColors.overlay17,
    },
    {
      title: "Late Check-in",
      count: stats.late,
      icon: <LateIcon />,
      color: themeColors.warning,
      bg: themeColors.overlay18,
    },
  ];

  // Enhanced Status Chip based on Backend Enum
  const renderStatusChip = (status) => {
    let color = themeColors.textMuted;
    let bgColor = themeColors.tableHeader;

    switch (status) {
      case "Present":
        color = themeColors.success;
        bgColor = themeColors.overlay16;
        break;

      case "Absent":
        color = themeColors.primary;
        bgColor = themeColors.overlay17;
        break;

      case "Late":
        color = themeColors.warning;
        bgColor = themeColors.overlay18;
        break;

      case "Half Day":
        color = themeColors.purple;
        bgColor = themeColors.overlay19;
        break;

      case "On Leave":
      case "Holiday":
      case "Weekend":
        color = themeColors.info;
        bgColor = themeColors.overlay20;
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
          borderRadius: "4px",
          fontSize: "12px",
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        background: themeColors.hover,
        minHeight: "100vh",
        color: themeColors.navyDark,
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


          <Typography fontSize={14} color={themeColors.textMuted} mt={0.5}>
            Monitor daily employee check-ins and working hours
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{
            color: themeColors.secondaryDark,
            borderColor: themeColors.border,
            background: themeColors.cardBg,
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "4px",
            height: 42,
            px: 2,

            "&:hover": {
              borderColor: themeColors.border,
              backgroundColor: themeColors.hover,
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
                background: "linear-gradient(135deg," + themeColors.primarySoft + "," + themeColors.primarySoft + ")",

                border: "1px solid " + themeColors.border,

                boxShadow:
                  "0 1px 2px " + themeColors.overlay1 + ", 0 1px 3px " + themeColors.overlay2,

                display: "flex",
                alignItems: "center",

                transition:
                  "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",

                "&:hover": {
                  transform: "translateY(-6px) scale(1.015)",

                  boxShadow:
                    "0 4px 6px -1px " + themeColors.overlay3 + ", 0 2px 4px -2px " + themeColors.overlay2,

                  borderColor: `color-mix(in srgb, ${stat.color} 30%, transparent)`,
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
                  color={themeColors.navyDark}
                >
                  {stat.count}
                </Typography>

                <Typography fontSize={14} color={themeColors.textMuted} mt={0.5}>
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
                    color: themeColors.textMuted,
                  }}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            background: themeColors.cardBg,
            borderRadius: "4px",

            "& .MuiInputBase-root": {
              height: 44,
              borderRadius: "4px",
            },

            "& input": {
              color: themeColors.navyDark,
              fontSize: 14,
            },

            "& input::placeholder": {
              color: themeColors.textMuted,
              opacity: 1,
            },

            "& fieldset": {
              border: "1px solid " + themeColors.border,
            },

            "&:hover fieldset": {
              borderColor: themeColors.border,
            },

            "& .Mui-focused fieldset": {
              borderColor: themeColors.purple + " !important",
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
            background: themeColors.cardBg,
            borderRadius: "4px",

            "& .MuiInputBase-root": {
              height: 44,
              borderRadius: "4px",
            },

            "& input": {
              color: themeColors.navyDark,
              fontSize: 14,
            },

            "& fieldset": {
              border: "1px solid " + themeColors.border,
            },

            "&:hover fieldset": {
              borderColor: themeColors.border,
            },

            "& .Mui-focused fieldset": {
              borderColor: themeColors.purple + " !important",
            },

            "& input::-webkit-calendar-picker-indicator": {
              opacity: 0.7,
              cursor: "pointer",
            },
          }}
        />
      </Box>

      {/* Table Section */}
      <DataTable rows={attendanceRecords} searchValue={searchTerm} onSearchChange={setSearchTerm} columns={[
{ field: "employeeId", headerName: "Employee", valueGetter: row => row.employeeId?.fullName || "Unavailable profile" },
{ field: "date", headerName: "Date" }, { field: "status", headerName: "Status", renderCell: row => renderStatusChip(row.status) },
{ field: "checkIn", headerName: "Check In" }, { field: "checkOut", headerName: "Check Out" }, { field: "totalHours", headerName: "Total Hours" }
]} />
    </Box>
  );
};

export default Attendance;
