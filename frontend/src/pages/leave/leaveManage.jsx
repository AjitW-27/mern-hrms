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
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      color: "#0f172a",
      minHeight: 44,
      "& fieldset": {
        borderColor: "#e2e8f0",
      },
      "&:hover fieldset": {
        borderColor: "#cbd5e1",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#8b5cf6",
        borderWidth: "2px",
      },
    },
    "& .MuiInputBase-input": {
      color: "#0f172a",
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#94a3b8",
      opacity: 1,
    },
    "& .MuiSelect-select": {
      color: "#0f172a",
    },
    "& .MuiSelect-icon": {
      color: "#64748b",
    },
    "& input[type='date']": {
      colorScheme: "light",
    },
    "& textarea": {
      color: "#0f172a",
    },
  };

  const renderStatusChip = (status) => {
    const statusMap = {
      approved: { color: "#10b981", bg: "#10b98120" },
      pending: { color: "#f59e0b", bg: "#f59e0b20" },
      rejected: { color: "#ef4444", bg: "#ef444420" },
      cancelled: { color: "#64748b", bg: "#f1f5f9" },
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
          background: "#f8fafc",
          minHeight: "100vh",
          color: "#0f172a",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Typography
              fontSize={{ xs: 22, sm: 26 }}
              fontWeight={700}
              color="#0f172a"
            >
              Leave Management
            </Typography>
            <Typography fontSize={14} color="#64748b" mt={0.5}>
              Manage your leave balances and history
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setView("apply")}
            sx={{
              background: "#8b5cf6",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "8px",
              boxShadow: "none",
              "&:hover": {
                background: "#7c3aed",
                boxShadow: "0 6px 16px rgba(139, 92, 246, 0.18)",
              },
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
                      minHeight: 145,
                      borderRadius: "8px",
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
                      transition:
                        "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                      "&:hover": {
                        transform: "translateY(-6px) scale(1.015)",
                        boxShadow: "0 12px 28px rgba(15, 23, 42, 0.10)",
                        borderColor: `${stat.color}55`,
                      },
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
                        color="#0f172a"
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
                      color="#64748b"
                    >
                      <Typography fontSize="inherit">
                        Total:{" "}
                        <span style={{ color: "#0f172a", fontWeight: "700" }}>
                          {stat.total}
                        </span>
                      </Typography>
                      <Typography fontSize="inherit">
                        Used:{" "}
                        <span style={{ color: "#0f172a", fontWeight: "700" }}>
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
                        backgroundColor: "#e2e8f0",
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
              <Typography color="#64748b">Loading leave balances...</Typography>
            </Grid>
          )}
        </Grid>

        {/* History Table */}
        <Paper
          sx={{
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
          }}
        >
          <Box p={2.5} borderBottom="1px solid #e5e7eb">
            <Typography fontSize={18} fontWeight="bold">
              Leave History
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ background: "#f8fafc" }}>
                <TableRow>
                  {["Leave Type", "From", "To", "Days", "Status", "Action"].map(
                    (head) => (
                      <TableCell
                        key={head}
                        sx={{
                          color: "#475569",
                          fontWeight: 600,
                          borderBottom: "1px solid #e5e7eb",
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
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f8fafc",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          color: "#0f172a",
                          borderBottom: "1px solid #e5e7eb",
                          textTransform: "capitalize",
                          fontWeight: 500,
                        }}
                      >
                        {row.leaveType} Leave
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#334155",
                          borderBottom: "1px solid #e5e7eb",
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
                          color: "#334155",
                          borderBottom: "1px solid #e5e7eb",
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
                          color: "#334155",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        {calculateDays(row.fromDate, row.toDate)}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #e5e7eb" }}>
                        {renderStatusChip(row.status)}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #e5e7eb" }}>
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
                      sx={{ py: 4, color: "#64748b", borderBottom: "none" }}
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
        background: "#f8fafc",
        minHeight: "100vh",
        color: "#0f172a",
      }}
    >
      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => setView("dashboard")}
          sx={{
            color: "#475569",
            mb: 2,
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#f1f5f9",
            },
          }}
        >
          Back to Dashboard
        </Button>
        <Typography
          fontSize={{ xs: 23, sm: 28 }}
          fontWeight={700}
          color="#0f172a"
        >
          Apply Leave
        </Typography>
        <Typography fontSize={14} color="#64748b" mt={0.5}>
          Submit leave request with manager approval workflow
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: { xs: 2.5, sm: 3, md: 4 },
              background: `
                radial-gradient(
                  circle at 0% 0%,
                  rgba(139, 92, 246, 0.08) 0%,
                  transparent 50%
                ),
                linear-gradient(
                  135deg,
                  #ffffff 0%,
                  #f8fafc 100%
                )
              `,
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
            }}
          >
            <Box mb={3}>
              <Typography fontSize={18} fontWeight={700} color="#0f172a">
                Leave Request Details
              </Typography>
              <Typography fontSize={13} color="#64748b" mt={0.5}>
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
                  SelectProps={{ sx: { color: "#0f172a" } }}
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
                  SelectProps={{ sx: { color: "#0f172a" } }}
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
                    borderColor: "#e2e8f0",
                    backgroundColor: "#ffffff",
                    textTransform: "none",
                    width: "100%",
                    justifyContent: "flex-start",
                    p: 1.5,
                    borderRadius: "8px",
                    "&:hover": {
                      borderColor: "#cbd5e1",
                      backgroundColor: "#f8fafc",
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
                  background: "#8b5cf6",
                  fontWeight: 600,
                  textTransform: "none",
                  px: 3,
                  py: 1.2,
                  borderRadius: "8px",
                  boxShadow: "none",
                  "&:hover": {
                    background: "#7c3aed",
                    boxShadow: "0 6px 16px rgba(139, 92, 246, 0.18)",
                  },
                }}
              >
                {loading ? "Submitting..." : "Submit Leave Request"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setView("dashboard")}
                sx={{
                  color: "#475569",
                  borderColor: "#e2e8f0",
                  backgroundColor: "#ffffff",
                  textTransform: "none",
                  px: 3,
                  borderRadius: "8px",
                  "&:hover": {
                    borderColor: "#cbd5e1",
                    backgroundColor: "#f8fafc",
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
              background: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
              mb: 3,
            }}
          >
            <Typography fontSize={18} fontWeight={700} mb={3} color="#0f172a">
              Leave Summary
            </Typography>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
              p={2}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                background: "#f8fafc",
              }}
            >
              <Box>
                <Typography fontSize={13} color="#64748b">
                  Total Available
                </Typography>
                <Typography fontSize={24} fontWeight={700} color="#0f172a">
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
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background: "#f8fafc",
                }}
              >
                <Typography fontSize={14} color="#64748b">
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
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                background: "#f8fafc",
              }}
            >
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography fontSize={14} color="#64748b">
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
                  backgroundColor: "#e2e8f0",
                  "& .MuiLinearProgress-bar": { backgroundColor: "#f59e0b" },
                }}
              />
            </Box>
          </Paper>

          <Box
            sx={{
              p: 3,
              background: `
                radial-gradient(
                  circle at 0% 0%,
                  rgba(16, 185, 129, 0.10) 0%,
                  transparent 55%
                ),
                linear-gradient(
                  135deg,
                  #ffffff 0%,
                  #f8fafc 100%
                )
              `,
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              color: "#0f172a",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
            }}
          >
            <Typography
              fontSize={12}
              fontWeight="bold"
              sx={{
                opacity: 1,
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              HR Notice
            </Typography>
            <Typography
              fontSize={18}
              fontWeight={700}
              mb={2}
              lineHeight={1.3}
              color="#0f172a"
            >
              Apply leave 3 days in advance
            </Typography>
            <Typography fontSize={14} color="#64748b" sx={{ lineHeight: 1.6 }}>
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
