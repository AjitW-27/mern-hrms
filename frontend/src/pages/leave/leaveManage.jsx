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
  MenuItem,
  LinearProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";

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

  // Dynamic Form State (Added supportingDocument)
  const [formData, setFormData] = useState({
    leaveType: "",
    managerId: "",
    fromDate: "",
    toDate: "",
    reason: "",
    supportingDocument: null, // File upload state
  });

  // 1. Fetch Leaves & Balances (Updated to match /api/leaves/my)
  const fetchLeaves = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/leaves/my", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const result = await response.json();
      if (result.success) {
        setLeaves(result.data);
        if (result.leaveBalance) setBalances(result.leaveBalance);
      }
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
    }
  };

  // 2. Fetch Managers Dynamically
  const fetchManagers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const result = await response.json();
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

  // 3. Submit Leave (Updated for Multer FormData)
  const handleApplyLeave = async () => {
    try {
      setLoading(true);

      // Create FormData instead of JSON because of upload.single("supportingDocument")
      const payload = new FormData();
      payload.append("leaveType", formData.leaveType);
      payload.append("managerId", formData.managerId);
      payload.append("fromDate", formData.fromDate);
      payload.append("toDate", formData.toDate);
      payload.append("reason", formData.reason);

      // Append file if selected
      if (formData.supportingDocument) {
        payload.append("supportingDocument", formData.supportingDocument);
      }

      const response = await fetch("http://localhost:5000/api/leaves/apply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // Note: DO NOT set Content-Type here. The browser automatically
          // sets 'multipart/form-data' with the correct boundary boundary when passing FormData.
        },
        body: payload,
      });

      const result = await response.json();
      if (result.success) {
        setFormData({
          leaveType: "",
          managerId: "",
          fromDate: "",
          toDate: "",
          reason: "",
          supportingDocument: null,
        });
        setView("dashboard");
        fetchLeaves(); // Refresh data
      } else {
        alert(result.message || "Failed to apply for leave");
      }
    } catch (error) {
      console.error("Error applying leave:", error);
    } finally {
      setLoading(false);
    }
  };

  // 4. Cancel Leave (Matches /api/leaves/:id/cancel)
  const handleCancelLeave = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/leaves/${id}/cancel`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const result = await response.json();
      if (result.success) fetchLeaves();
    } catch (error) {
      console.error("Error cancelling leave:", error);
    }
  };

  // --- Dynamic UI Calculations ---
  const dynamicLeaveStats = Object.keys(balances).map((key, index) => {
    const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
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
    background: "#0f172a",
    borderRadius: "8px",
    input: { color: "#fff", colorScheme: "white" },
    "& fieldset": { borderColor: "#334155" },
    "&:hover fieldset": { borderColor: "#64748b !important" },
    "&.Mui-focused fieldset": { borderColor: "#8b5cf6 !important" },
    "& .MuiSelect-icon": { color: "#94a3b8" },
  };

  const renderStatusChip = (status) => {
    const statusMap = {
      approved: { color: "#10b981", bg: "#10b98120" },
      pending: { color: "#f59e0b", bg: "#f59e0b20" },
      rejected: { color: "#ef4444", bg: "#ef444420" },
      cancelled: { color: "#94a3b8", bg: "#334155" },
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
          p: { xs: 2, md: 4 },
          background: "#0f172a",
          minHeight: "100vh",
          color: "#fff",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Typography fontSize={26} fontWeight="bold">
              Leave Management
            </Typography>
            <Typography fontSize={14} color="#94a3b8" mt={0.5}>
              Manage your leave balances and history
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setView("apply")}
            sx={{
              background: "#8b5cf6",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: "8px",
              "&:hover": { background: "#7c3aed" },
            }}
          >
            Apply Leave
          </Button>
        </Box>

        {/* Dynamic Balance Cards */}
        <Grid container spacing={3} mb={5}>
          {dynamicLeaveStats.length > 0 ? (
            dynamicLeaveStats.map((stat, index) => {
              const progress =
                stat.total > 0 ? (stat.remaining / stat.total) * 100 : 0;
              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: "16px",
                      background: "#1e293b",
                      border: "1px solid #334155",
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Typography
                        fontSize={16}
                        fontWeight="bold"
                        color="#e2e8f0"
                      >
                        {stat.title}
                      </Typography>
                      <Box
                        sx={{
                          background: `${stat.color}20`,
                          color: stat.color,
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {stat.remaining}
                      </Box>
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      mb={1}
                      fontSize={13}
                      color="#94a3b8"
                    >
                      <Typography fontSize="inherit">
                        Total:{" "}
                        <span style={{ color: "#fff", fontWeight: "bold" }}>
                          {stat.total}
                        </span>
                      </Typography>
                      <Typography fontSize="inherit">
                        Used:{" "}
                        <span style={{ color: "#fff", fontWeight: "bold" }}>
                          {stat.used}
                        </span>
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#334155",
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
              <Typography color="#94a3b8">Loading leave balances...</Typography>
            </Grid>
          )}
        </Grid>

        {/* History Table */}
        <Paper
          sx={{
            background: "#1e293b",
            borderRadius: "12px",
            border: "1px solid #334155",
            overflow: "hidden",
          }}
        >
          <Box p={2.5} borderBottom="1px solid #334155">
            <Typography fontSize={18} fontWeight="bold">
              Leave History
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ background: "#0f172a" }}>
                <TableRow>
                  {["Leave Type", "From", "To", "Days", "Status", "Action"].map(
                    (head) => (
                      <TableCell
                        key={head}
                        sx={{
                          color: "#94a3b8",
                          fontWeight: "bold",
                          borderBottom: "1px solid #334155",
                        }}
                      >
                        {head}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.length > 0 ? (
                  leaves.map((row) => (
                    <TableRow
                      key={row._id}
                      sx={{ "&:hover": { backgroundColor: "#0f172a" } }}
                    >
                      <TableCell
                        sx={{
                          color: "#fff",
                          borderBottom: "1px solid #334155",
                          textTransform: "capitalize",
                          fontWeight: 500,
                        }}
                      >
                        {row.leaveType} Leave
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#e2e8f0",
                          borderBottom: "1px solid #334155",
                        }}
                      >
                        {new Date(row.fromDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#e2e8f0",
                          borderBottom: "1px solid #334155",
                        }}
                      >
                        {new Date(row.toDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#e2e8f0",
                          borderBottom: "1px solid #334155",
                        }}
                      >
                        {calculateDays(row.fromDate, row.toDate)}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #334155" }}>
                        {renderStatusChip(row.status)}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #334155" }}>
                        {row.status === "pending" ? (
                          <Button
                            size="small"
                            onClick={() => handleCancelLeave(row._id)}
                            sx={{
                              color: "#ef4444",
                              textTransform: "none",
                              fontWeight: "bold",
                            }}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <Typography fontSize={13} color="#64748b">
                            Processed
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: 3, color: "#94a3b8", borderBottom: "none" }}
                    >
                      No leave history available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    );
  }

  // ==============================
  // VIEW 2: APPLY LEAVE (Form)
  // ==============================
  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: "#0f172a",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => setView("dashboard")}
          sx={{ color: "#94a3b8", mb: 2, textTransform: "none" }}
        >
          Back to Dashboard
        </Button>
        <Typography fontSize={28} fontWeight="bold">
          Apply Leave
        </Typography>
        <Typography fontSize={14} color="#94a3b8" mt={0.5}>
          Submit leave request with manager approval workflow
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 4,
              background: "#1e293b",
              borderRadius: "16px",
              border: "1px solid #334155",
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography fontSize={14} color="#94a3b8" mb={1}>
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
                  SelectProps={{ sx: { color: "#fff" } }}
                >
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="casual">Casual Leave</MenuItem>
                  <MenuItem value="earned">Earned Leave</MenuItem>
                  <MenuItem value="unpaid">Unpaid Leave</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography fontSize={14} color="#94a3b8" mb={1}>
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
                  SelectProps={{ sx: { color: "#fff" } }}
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
                <Typography fontSize={14} color="#94a3b8" mb={1}>
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
                <Typography fontSize={14} color="#94a3b8" mb={1}>
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
                <Typography fontSize={14} color="#94a3b8" mb={1}>
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
                  sx={{ ...textFieldStyles, textarea: { color: "#fff" } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography fontSize={14} color="#94a3b8" mb={1}>
                  Supporting Document (Optional)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  sx={{
                    color: "#e2e8f0",
                    borderColor: "#334155",
                    textTransform: "none",
                    width: "100%",
                    justifyContent: "flex-start",
                    p: 1.5,
                    borderRadius: "8px",
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
                  background: "#10b981",
                  fontWeight: "bold",
                  textTransform: "none",
                  px: 4,
                  py: 1.2,
                  borderRadius: "8px",
                  "&:hover": { background: "#059669" },
                }}
              >
                {loading ? "Submitting..." : "Submit Leave Request"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setView("dashboard")}
                sx={{
                  color: "#e2e8f0",
                  borderColor: "#334155",
                  textTransform: "none",
                  px: 4,
                  borderRadius: "8px",
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
              background: "#1e293b",
              borderRadius: "16px",
              border: "1px solid #334155",
              mb: 3,
            }}
          >
            <Typography fontSize={20} fontWeight="bold" mb={3} color="#e2e8f0">
              Leave Summary
            </Typography>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
              p={2}
              sx={{
                border: "1px solid #334155",
                borderRadius: "12px",
                background: "#0f172a",
              }}
            >
              <Box>
                <Typography fontSize={13} color="#94a3b8">
                  Total Available
                </Typography>
                <Typography fontSize={24} fontWeight="bold" color="#fff">
                  {totalAvailableLeaves} Days
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 45,
                  height: 45,
                  borderRadius: "50%",
                  background: "#10b98120",
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
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  background: "#0f172a",
                }}
              >
                <Typography fontSize={14} color="#94a3b8">
                  Days Requested:
                </Typography>
                <Typography fontSize={16} fontWeight="bold" color="#8b5cf6">
                  {formCalculatedDays} Day's
                </Typography>
              </Box>
            )}

            <Box
              p={2}
              sx={{
                border: "1px solid #334155",
                borderRadius: "12px",
                background: "#0f172a",
              }}
            >
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography fontSize={14} color="#94a3b8">
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
                  borderRadius: 4,
                  backgroundColor: "#334155",
                  "& .MuiLinearProgress-bar": { backgroundColor: "#f59e0b" },
                }}
              />
            </Box>
          </Paper>

          <Box
            sx={{
              p: 3,
         
              
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              borderRadius: "16px",
              color: "#fff",
              boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)",
            }}
          >
            <Typography
              fontSize={12}
              fontWeight="bold"
              sx={{
                opacity: 0.9,
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              HR Notice
            </Typography>
            <Typography fontSize={20} fontWeight="bold" mb={2} lineHeight={1.3}>
              Apply leave 3 days in advance
            </Typography>
            <Typography fontSize={14} sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              Emergency leaves require immediate approval from your reporting
              manager and HR department.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeaveManagement;
