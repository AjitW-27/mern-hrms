import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  Chip,
  TextField,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import DataGrid from "../../components/common/DataGrid";
import execReq from "../../lib/execReq";

// Helper to calculate days between two dates dynamically
const calculateDays = (start, end) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (endDate < startDate) return 0;
  return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
};

const LeaveManagement = () => {
  const [view, setView] = useState("dashboard"); // 'dashboard' | 'apply'
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState({});
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dynamic Form State
  const [formData, setFormData] = useState({
    leaveType: "",
    managerId: "",
    fromDate: "",
    toDate: "",
    reason: "",
    supportingDocument: null,
  });

  // 1. Fetch Leaves & Balances
  const fetchLeaves = async () => {
    try {
      let response;
      try {
        response = await execReq("/leaves/my");
      } catch (err) {
        response = await execReq("/leave/my");
      }

      const result = response?.data;
      if (result?.success) {
        setLeaves(result?.data || []);
        if (result?.leaveBalance) setBalances(result.leaveBalance);
      }
    } catch (error) {
      console.error(
        "Failed to fetch leaves:",
        error?.response?.data?.message || error?.message || "Unknown error",
      );
    }
  };

  // 2. Fetch Managers Dynamically
  const fetchManagers = async () => {
    try {
      const response = await execReq("/employees");
      const result = response.data;
      if (result.success) {
        const approvers = result.data.filter((emp) =>
          ["admin", "hr", "manager"].includes(emp.userId?.role || emp.role),
        );
        setManagers(approvers.length > 0 ? approvers : result.data);
      }
    } catch (error) {
      console.error("Failed to fetch managers:", error);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchManagers();
  }, []);

  // 3. Submit Leave
  const handleApplyLeave = async () => {
    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("leaveType", formData.leaveType);
      payload.append("fromDate", formData.fromDate);
      payload.append("toDate", formData.toDate);
      payload.append("reason", formData.reason || "");

      if (formData.supportingDocument) {
        payload.append("supportingDocument", formData.supportingDocument);
      }

      let response;
      try {
        response = await execReq.post("/leaves/apply", payload);
      } catch (err) {
        response = await execReq.post("/leave/apply", payload);
      }

      const result = response?.data;
      if (result?.success) {
        alert("Leave applied successfully!");
        setFormData({
          leaveType: "",
          managerId: "",
          fromDate: "",
          toDate: "",
          reason: "",
          supportingDocument: null,
        });
        setView("dashboard");
        fetchLeaves();
      } else {
        alert(result?.message || "Failed to apply for leave");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Error applying leave";
      console.error("Error applying leave:", msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // 4. Cancel Leave
  const handleCancelLeave = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;
    try {
      const response = await execReq.put(`/leaves/${id}/cancel`);
      const result = response.data;
      if (result.success) fetchLeaves();
    } catch (error) {
      console.error("Error cancelling leave:", error);
    }
  };

  // --- Dynamic UI Calculations ---
  const dynamicLeaveStats = Object.keys(balances).map((key, index) => {
    const colors = ["#8b5cf6", "#4F46E5", "#10b981", "#f59e0b", "#ef4444"];
    const color = colors[index % colors.length];

    let total = 15;
    let remaining = 0;

    if (typeof balances[key] === "object") {
      total = balances[key].total || 15;
      remaining = balances[key].remaining || 0;
    } else {
      remaining = Number(balances[key]) || 0;
    }

    return {
      type: key,
      title: `${key.charAt(0).toUpperCase() + key.slice(1)} Leave`,
      total: total,
      remaining: remaining,
      used: total - remaining,
      color: color,
    };
  });

  const totalAvailableLeaves = dynamicLeaveStats.reduce(
    (acc, curr) => acc + curr.remaining,
    0,
  );
  const pendingLeavesCount = leaves.filter(
    (l) => l.status === "pending",
  ).length;
  const pendingProgress =
    leaves.length > 0 ? (pendingLeavesCount / leaves.length) * 100 : 0;
  const formCalculatedDays = calculateDays(formData.fromDate, formData.toDate);

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#FFFFFF",
      borderRadius: "4px",
      color: "#0F172A",
      minHeight: 44,
      "& fieldset": { borderColor: "#E2E8F0" },
      "&:hover fieldset": { borderColor: "#CBD5E1" },
      "&.Mui-focused fieldset": { borderColor: "#8b5cf6", borderWidth: "2px" },
    },
    "& .MuiInputBase-input": { color: "#0F172A" },
    "& .MuiSelect-select": { color: "#0F172A" },
    "& .MuiSelect-icon": { color: "#64748B" },
    "& input[type='date']": { colorScheme: "light" },
    "& textarea": { color: "#0F172A" },
  };

  const renderStatusChip = (status) => {
    const statusMap = {
      approved: { color: "#10b981", bg: "rgba(16,185,129,.12)" },
      pending: { color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
      rejected: { color: "#ef4444", bg: "rgba(239,68,68,.12)" },
      cancelled: { color: "#64748B", bg: "#F1F5F9" },
    };
    const style = statusMap[status?.toLowerCase()] || statusMap.pending;
    return (
      <Chip
        label={status?.toUpperCase() || "UNKNOWN"}
        size="small"
        sx={{
          background: style.bg,
          color: style.color,
          fontWeight: "bold",
          borderRadius: "6px",
        }}
      />
    );
  };

  if (view === "dashboard") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          color: "#0F172A",
        }}
      >
        {/* Header Subtitle */}
        <Box mb={2.5}>
          <Typography fontSize={14} color="#64748B">
            Manage your leave balances and history
          </Typography>
        </Box>

        {/* Dynamic Balance Cards */}
        <Grid container spacing={2.5} mb={3}>
          {dynamicLeaveStats.length > 0 ? (
            dynamicLeaveStats.map((stat, index) => {
              const progress =
                stat.total > 0 ? (stat.remaining / stat.total) * 100 : 0;
              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: "8px",
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 1px 2px rgba(15,23,42,.05)",
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1.5}
                    >
                      <Typography
                        fontSize={15}
                        fontWeight={600}
                        color="#0F172A"
                      >
                        {stat.title}
                      </Typography>
                      <Box
                        sx={{
                          background: `${stat.color}20`,
                          color: stat.color,
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: 13,
                        }}
                      >
                        {stat.remaining}
                      </Box>
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      mb={1}
                      fontSize={12}
                      color="#64748B"
                    >
                      <Typography fontSize="inherit">
                        Total: <b>{stat.total}</b>
                      </Typography>
                      <Typography fontSize="inherit">
                        Used: <b>{stat.used}</b>
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 6,
                        borderRadius: "3px",
                        backgroundColor: "#E2E8F0",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: stat.color,
                        },
                      }}
                    />
                  </Box>
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              <Typography color="#64748B">Loading leave balances...</Typography>
            </Grid>
          )}
        </Grid>

        {/* DIRECT DATA GRID: NO WRAPPING PAPER (REMOVES EXTRA BORDER & WHITE GAP) */}
        <DataGrid
          rows={leaves}
          emptyMessage="No leave history available."
          addBtn="Apply Leave"
          onAddClick={() => setView("apply")}
          config={{
            addBtn: "Apply Leave",
            onAddClick: () => setView("apply"),
            onRefreshClick: fetchLeaves,
          }}
          columns={[
            {
              field: "leaveType",
              headerName: "Leave Type",
              valueGetter: (row) => `${row.leaveType} Leave`,
            },
            {
              field: "fromDate",
              headerName: "From",
              valueGetter: (row) =>
                new Date(row.fromDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
            },
            {
              field: "toDate",
              headerName: "To",
              valueGetter: (row) =>
                new Date(row.toDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
            },
            {
              field: "days",
              headerName: "Days",
              valueGetter: (row) => calculateDays(row.fromDate, row.toDate),
            },
            {
              field: "status",
              headerName: "Status",
              renderCell: (row) => renderStatusChip(row.status),
            },
          ]}
          actions={(row) =>
            row.status === "pending" ? (
              <Button
                size="small"
                color="error"
                onClick={() => handleCancelLeave(row._id)}
              >
                Cancel
              </Button>
            ) : (
              <Typography fontSize={13} color="text.secondary">
                Processed
              </Typography>
            )
          }
        />
      </Box>
    );
  }

  // ==============================
  // VIEW 2: APPLY LEAVE (Form)
  // ==============================
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: "100%", color: "#0F172A" }}>
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => setView("dashboard")}
          sx={{
            color: "#475569",
            mb: 1.5,
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "4px",
            "&:hover": { backgroundColor: "#F1F5F9" },
          }}
        >
          Back to Dashboard
        </Button>
        <Typography fontSize={13} color="#64748B">
          Submit leave request with manager approval workflow
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: { xs: 2.5, sm: 3, md: 4 },
              background: "#FFFFFF",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(15,23,42,.05)",
            }}
          >
            <Box mb={3}>
              <Typography fontSize={18} fontWeight={700} color="#0F172A">
                Leave Request Details
              </Typography>
              <Typography fontSize={13} color="#64748B" mt={0.5}>
                Enter the details below to submit your leave request.
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <Typography
                  fontSize={14}
                  color="#475569"
                  fontWeight={600}
                  mb={1}
                >
                  Leave Type
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={formData.leaveType}
                  onChange={(e) =>
                    setFormData({ ...formData, leaveType: e.target.value })
                  }
                  sx={textFieldStyles}
                  SelectProps={{ sx: { color: "#0F172A" } }}
                >
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="casual">Casual Leave</MenuItem>
                  <MenuItem value="earned">Earned Leave</MenuItem>
                  <MenuItem value="unpaid">Unpaid Leave</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  fontSize={14}
                  color="#475569"
                  fontWeight={600}
                  mb={1}
                >
                  Reporting Manager
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={formData.managerId}
                  onChange={(e) =>
                    setFormData({ ...formData, managerId: e.target.value })
                  }
                  sx={textFieldStyles}
                  SelectProps={{ sx: { color: "#0F172A" } }}
                >
                  {managers.map((mgr) => (
                    <MenuItem key={mgr._id} value={mgr._id}>
                      {mgr.fullName || mgr.name || "Unknown"} (
                      {mgr.department || "HR"})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  fontSize={14}
                  color="#475569"
                  fontWeight={600}
                  mb={1}
                >
                  Start Date
                </Typography>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  value={formData.fromDate}
                  onChange={(e) =>
                    setFormData({ ...formData, fromDate: e.target.value })
                  }
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography
                  fontSize={14}
                  color="#475569"
                  fontWeight={600}
                  mb={1}
                >
                  End Date
                </Typography>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  value={formData.toDate}
                  inputProps={{ min: formData.fromDate }}
                  onChange={(e) =>
                    setFormData({ ...formData, toDate: e.target.value })
                  }
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  fontSize={14}
                  color="#475569"
                  fontWeight={600}
                  mb={1}
                >
                  Leave Reason
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Enter detailed leave reason here..."
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  fontSize={14}
                  color="#475569"
                  fontWeight={600}
                  mb={1}
                >
                  Supporting Document (Optional)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  sx={{
                    color: "#475569",
                    borderColor: "#E2E8F0",
                    backgroundColor: "#FFFFFF",
                    textTransform: "none",
                    width: "100%",
                    justifyContent: "flex-start",
                    p: 1.5,
                    borderRadius: "4px",
                    "&:hover": {
                      borderColor: "#CBD5E1",
                      backgroundColor: "#F8FAFC",
                    },
                  }}
                >
                  {formData.supportingDocument
                    ? formData.supportingDocument.name
                    : "Upload File (PDF, JPG, PNG)"}
                  <input
                    type="file"
                    hidden
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supportingDocument: e.target.files[0],
                      })
                    }
                  />
                </Button>
              </Grid>
            </Grid>

            <Box mt={4} display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={handleApplyLeave}
                disabled={
                  loading ||
                  !formData.fromDate ||
                  !formData.toDate ||
                  !formData.leaveType
                }
                sx={{
                  background: "#FD5622",
                  fontWeight: 600,
                  textTransform: "none",
                  px: 3,
                  py: 1.2,
                  borderRadius: "6px",
                  boxShadow: "none",
                  "&:hover": { background: "#E04818", boxShadow: "none" },
                }}
              >
                {loading ? "Submitting..." : "Submit Leave Request"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setView("dashboard")}
                sx={{
                  color: "#475569",
                  borderColor: "#CBD5E1",
                  backgroundColor: "#FFFFFF",
                  textTransform: "none",
                  px: 3,
                  borderRadius: "6px",
                  "&:hover": {
                    borderColor: "#94A3B8",
                    backgroundColor: "#F8FAFC",
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              background: "#FFFFFF",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(15,23,42,.05)",
              mb: 3,
            }}
          >
            <Typography fontSize={18} fontWeight={700} mb={3} color="#0F172A">
              Leave Summary
            </Typography>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
              p={2}
              sx={{
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                background: "#F8FAFC",
              }}
            >
              <Box>
                <Typography fontSize={13} color="#64748B">
                  Total Available
                </Typography>
                <Typography fontSize={24} fontWeight={700} color="#0F172A">
                  {totalAvailableLeaves} Days
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 45,
                  height: 45,
                  borderRadius: "50%",
                  background: "rgba(16,185,129,.12)",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                {totalAvailableLeaves}
              </Box>
            </Box>

            {formCalculatedDays > 0 && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                p={2}
                sx={{
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  background: "#F8FAFC",
                }}
              >
                <Typography fontSize={14} color="#64748B">
                  Days Requested:
                </Typography>
                <Typography fontSize={16} fontWeight="bold" color="#FD5622">
                  {formCalculatedDays} Day's
                </Typography>
              </Box>
            )}

            <Box
              p={2}
              sx={{
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                background: "#F8FAFC",
              }}
            >
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography fontSize={14} color="#64748B">
                  Pending Approvals
                </Typography>
                <Typography fontSize={14} fontWeight="bold" color="#f59e0b">
                  {pendingLeavesCount} Waiting
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={pendingProgress}
                sx={{
                  height: 8,
                  borderRadius: "4px",
                  backgroundColor: "#E2E8F0",
                  "& .MuiLinearProgress-bar": { backgroundColor: "#f59e0b" },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeaveManagement;
