import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Avatar,
  Paper,
  Chip,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email,
  Phone,
  Badge,
  Work,
  CalendarMonth,
  Business,
  Devices as DevicesIcon,
  QrCode as QrCodeIcon,
  ConfirmationNumber as SerialIcon,
  Home,
  AccountBalance,
  ContactEmergency,
  CreditCard,
  Fingerprint,
  InfoOutlined,
  WorkHistory,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/employees/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (res.data.success) setEmployee(res.data.data);
      } catch (err) {
        console.error("Error fetching employee", err);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to deactivate/delete this employee?",
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          data: { exitReason: "HR Deleted" },
        });
        alert("Employee deleted successfully");
        navigate("/dashboard/employees");
      } catch (err) {
        alert(err.response?.data?.message || "Error deleting employee");
      }
    }
  };

  if (!employee)
    return (
      <Typography color="#fff" p={4}>
        Loading...
      </Typography>
    );

  const InfoRow = ({ icon: Icon, label, value }) => (
    <Box display="flex" alignItems="center" gap={2} mb={2.5}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: "rgba(139, 92, 246, 0.1)",
          color: "#a78bfa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Box>
        <Typography fontSize={12} color="#94a3b8">
          {label}
        </Typography>
        <Typography fontSize={15} color="#f8fafc" fontWeight="500">
          {value || "N/A"}
        </Typography>
      </Box>
    </Box>
  );

  const SectionTitle = ({ icon: Icon, title }) => (
    <Box display="flex" alignItems="center" gap={1.5} mb={3}>
      <Icon sx={{ color: "#8b5cf6" }} />
      <Typography variant="h6" color="#e2e8f0" fontWeight="bold">
        {title}
      </Typography>
    </Box>
  );

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
        <Box display="flex" alignItems="center">
          <IconButton
            sx={{ color: "#94a3b8", mr: 2 }}
            onClick={() => navigate("/dashboard/employees")}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography fontSize={24} fontWeight="bold">
            Employee Profile
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/dashboard/edit-employee/${id}`)}
            sx={{
              color: "#38bdf8",
              borderColor: "#38bdf8",
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                borderColor: "#0284c7",
                bgcolor: "rgba(56, 189, 248, 0.1)",
              },
            }}
          >
            Edit Profile
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            color="error"
            sx={{ textTransform: "none", fontWeight: "bold" }}
          >
            Deactivate
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              textAlign: "center",
              
            }}
          >
            <Avatar
              sx={{
                width: 110,
                height: 110,
                mx: "auto",
                mb: 2,
                bgcolor: "#8b5cf6",
                fontSize: 45,
                boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)",
              }}
            >
              {employee.fullName?.[0]}
            </Avatar>
            <Typography variant="h5" fontWeight="bold" color="#fff">
              {employee.fullName}
            </Typography>
            <Typography color="#94a3b8" mb={2}>
              {employee.designation}
            </Typography>
            <Chip
              label={employee.isActive ? "Active Employee" : "Inactive"}
              color={employee.isActive ? "success" : "error"}
              sx={{ fontWeight: "bold", px: 1 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box display="flex" flexDirection="column" gap={4}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: "#1e293b",
                border: "1px solid #334155",
              }}
            >
              <SectionTitle icon={InfoOutlined} title="Detailed Information" />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={Badge}
                    label="Employee ID"
                    value={employee.employeeId}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={Email}
                    label="Email Address"
                    value={employee.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={Phone}
                    label="Mobile Number"
                    value={employee.mobileNo}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={Phone}
                    label="Alternate Phone"
                    value={employee.alternatePhone}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={Business}
                    label="Department"
                    value={employee.department}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={Work}
                    label="System Role"
                    value={employee.role}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={Work}
                    label="Designation"
                    value={employee.designation}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={Work}
                    label="Employment Type"
                    value={employee.employmentType}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={WorkHistory}
                    label="Employment Status"
                    value={employee.employmentStatus}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={CalendarMonth}
                    label="Joining Date"
                    value={
                      employee.joiningDate
                        ? new Date(employee.joiningDate).toLocaleDateString()
                        : "N/A"
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={CalendarMonth}
                    label="Confirmation Date"
                    value={
                      employee.confirmationDate
                        ? new Date(
                            employee.confirmationDate,
                          ).toLocaleDateString()
                        : "N/A"
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={CalendarMonth}
                    label="Date of Birth"
                    value={
                      employee.dateOfBirth
                        ? new Date(employee.dateOfBirth).toLocaleDateString()
                        : "N/A"
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={Fingerprint}
                    label="Biometric ID"
                    value={employee.biometricId}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={Home}
                    label="Current Address"
                    value={
                      employee.address
                        ? `${employee.address.street || ""} ${employee.address.city || ""} ${employee.address.state || ""} ${employee.address.pincode || ""} ${employee.address.country || ""}`
                        : "N/A"
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={Home}
                    label="Permanent Address"
                    value={
                      employee.permanentAddress
                        ? `${employee.permanentAddress.street || ""} ${employee.permanentAddress.city || ""} ${employee.permanentAddress.state || ""} ${employee.permanentAddress.pincode || ""} ${employee.permanentAddress.country || ""}`
                        : "N/A"
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={AccountBalance}
                    label="Blood Group"
                    value={employee.bloodGroup}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={AccountBalance}
                    label="Marital Status"
                    value={employee.maritalStatus}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={ContactEmergency}
                    label="Emergency Contact"
                    value={
                      employee.emergencyContact
                        ? `${employee.emergencyContact.name || ""} (${employee.emergencyContact.relation || ""}) - ${employee.emergencyContact.phone || ""}`
                        : "N/A"
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={CreditCard}
                    label="Nationality"
                    value={employee.nationality}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={Work}
                    label="Reports To"
                    value={employee.reportsTo?.fullName || employee.reportsTo}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={Work}
                    label="Shift Timing"
                    value={
                      employee.shiftTiming
                        ? `${employee.shiftTiming.start || ""} - ${employee.shiftTiming.end || ""}`
                        : "N/A"
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={Work}
                    label="Weekly Off Days"
                    value={
                      Array.isArray(employee.weeklyOffDays)
                        ? employee.weeklyOffDays.join(", ")
                        : employee.weeklyOffDays
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <InfoRow
                    icon={CreditCard}
                    label="Skills"
                    value={
                      Array.isArray(employee.skills)
                        ? employee.skills.join(", ")
                        : employee.skills
                    }
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: "#1e293b",
                border: "1px solid #334155",
              }}
            >
              <SectionTitle icon={CreditCard} title="Bank Details" />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={CreditCard}
                    label="Account Holder Name"
                    value={employee.bankDetails?.accountHolderName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={CreditCard}
                    label="Bank Name"
                    value={employee.bankDetails?.bankName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={CreditCard}
                    label="Account Number"
                    value={employee.bankDetails?.accountNumber}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={CreditCard}
                    label="IFSC Code"
                    value={employee.bankDetails?.ifscCode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={CreditCard}
                    label="Branch Name"
                    value={employee.bankDetails?.branchName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow
                    icon={CreditCard}
                    label="Account Type"
                    value={employee.bankDetails?.accountType}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: "#1e293b",
                border: "1px solid #334155",
              }}
            >
              <SectionTitle icon={WorkHistory} title="Salary & Leave" />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    icon={WorkHistory}
                    label="Basic"
                    value={employee.salary?.basic}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    icon={WorkHistory}
                    label="HRA"
                    value={employee.salary?.hra}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    icon={WorkHistory}
                    label="DA"
                    value={employee.salary?.da}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    icon={WorkHistory}
                    label="TA"
                    value={employee.salary?.ta}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    icon={WorkHistory}
                    label="Other Allowances"
                    value={employee.salary?.otherAllowances}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    icon={WorkHistory}
                    label="PF"
                    value={employee.salary?.pf}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    icon={WorkHistory}
                    label="ESI"
                    value={employee.salary?.esi}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    icon={WorkHistory}
                    label="TDS"
                    value={employee.salary?.tds}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <InfoRow
                    icon={WorkHistory}
                    label="Leave Sick"
                    value={employee.leaveBalance?.sick}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <InfoRow
                    icon={WorkHistory}
                    label="Leave Casual"
                    value={employee.leaveBalance?.casual}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <InfoRow
                    icon={WorkHistory}
                    label="Leave Earned"
                    value={employee.leaveBalance?.earned}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <InfoRow
                    icon={WorkHistory}
                    label="Leave Unpaid"
                    value={employee.leaveBalance?.unpaid}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: "#1e293b",
                border: "1px solid #334155",
              }}
            >
              <SectionTitle icon={DevicesIcon} title="Assigned Assets" />

              {employee.assets && employee.assets.length > 0 ? (
                <Grid container spacing={3}>
                  {employee.assets.map((asset) => (
                    <Grid item xs={12} sm={6} key={asset._id}>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          background:
                            "linear-gradient(145deg, #131826, #0f172a)",
                          border: "1px solid #334155",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "3px",
                            bgcolor: "#8b5cf6",
                          }}
                        />

                        <Typography
                          fontSize={16}
                          fontWeight="bold"
                          color="#fff"
                          mb={1}
                        >
                          {asset.assetName}
                        </Typography>

                        <Box
                          display="flex"
                          flexDirection="column"
                          gap={0.5}
                          mb={2}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <QrCodeIcon
                              sx={{ fontSize: 16, color: "#94a3b8" }}
                            />
                            <Typography
                              fontSize={13}
                              color="#94a3b8"
                              sx={{ fontFamily: "monospace" }}
                            >
                              Asset ID: {asset.assetId}
                            </Typography>
                          </Box>

                          {asset.type === "Serialized" &&
                            asset.serialNumber && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <SerialIcon
                                  sx={{ fontSize: 16, color: "#94a3b8" }}
                                />
                                <Typography
                                  fontSize={13}
                                  color="#94a3b8"
                                  sx={{ fontFamily: "monospace" }}
                                >
                                  S/N: {asset.serialNumber}
                                </Typography>
                              </Box>
                            )}
                        </Box>

                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <Typography
                              fontSize={11}
                              color="#64748b"
                              textTransform="uppercase"
                            >
                              Category
                            </Typography>
                            <Typography fontSize={13} color="#e2e8f0">
                              {asset.category} ({asset.type})
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              fontSize={11}
                              color="#64748b"
                              textTransform="uppercase"
                            >
                              Ownership
                            </Typography>
                            <Typography fontSize={13} color="#e2e8f0">
                              {asset.ownership || "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              fontSize={11}
                              color="#64748b"
                              textTransform="uppercase"
                            >
                              Brand & Model
                            </Typography>
                            <Typography fontSize={13} color="#e2e8f0">
                              {asset.brand || "N/A"} {asset.model || ""}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              fontSize={11}
                              color="#64748b"
                              textTransform="uppercase"
                            >
                              Condition
                            </Typography>
                            <Typography fontSize={13} color="#e2e8f0">
                              {asset.condition}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              fontSize={11}
                              color="#64748b"
                              textTransform="uppercase"
                            >
                              Status
                            </Typography>
                            <Typography fontSize={13} color="#e2e8f0">
                              {asset.status || "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              fontSize={11}
                              color="#64748b"
                              textTransform="uppercase"
                            >
                              Assigned On
                            </Typography>
                            <Typography fontSize={13} color="#e2e8f0">
                              {asset.assignedDate
                                ? new Date(
                                    asset.assignedDate,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography
                              fontSize={11}
                              color="#64748b"
                              textTransform="uppercase"
                            >
                              Return Date
                            </Typography>
                            <Typography fontSize={13} color="#e2e8f0">
                              {asset.returnDate
                                ? new Date(
                                    asset.returnDate,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="#94a3b8">No assets assigned.</Typography>
              )}
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDetails;
