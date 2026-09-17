import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Divider,
  MenuItem,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";

import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Devices as DevicesIcon,
} from "@mui/icons-material";

import { useNavigate, useParams } from "react-router-dom";

const employeeSteps = [
  { label: "Personal", id: "employee-step-personal" },
  { label: "Address", id: "employee-step-address" },
  { label: "Job Details", id: "employee-step-job" },
  { label: "Salary", id: "employee-step-salary" },
  { label: "Bank", id: "employee-step-bank" },
  { label: "Emergency", id: "employee-step-emergency" },
  { label: "Documents", id: "employee-step-documents" },
  { label: "Assets", id: "employee-step-assets" },
];

const AddEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [assetGiven, setAssetGiven] = useState("no");
  const [activeStep, setActiveStep] = useState(0);
  const [availableRoles, setAvailableRoles] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNo: "",
    alternatePhone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    maritalStatus: "",
    nationality: "",
    avatar: "",

    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
    },

    permanentAddress: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
    },

    designation: "",
    role: "",
    department: "",
    reportsTo: "",
    employmentType: "",
    employmentStatus: "",
    workLocation: "",
    joiningDate: "",
    confirmationDate: "",

    shiftTiming: {
      start: "",
      end: "",
    },

    weeklyOffDays: "",

    salary: {
      basic: "",
      hra: "",
      da: "",
      ta: "",
      otherAllowances: "",
      pf: "",
      esi: "",
      tds: "",
    },

    bankDetails: {
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      branchName: "",
      accountType: "",
    },

    emergencyContact: {
      name: "",
      relation: "",
      phone: "",
    },

    documents: {
      aadhar: "",
      pan: "",
      passport: "",
      drivingLicense: "",
    },

    biometricId: "",
    skills: "",

    leaveBalance: {
      sick: "",
      casual: "",
      earned: "",
      unpaid: "",
    },
  });

  const [assetDetails, setAssetDetails] = useState({
    assetName: "",
    assetId: "",
    type: "",
    category: "",
    serialNumber: "",
    brand: "",
    model: "",
    condition: "",
    ownership: "",
  });

  const genders = ["Male", "Female", "Other"];

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];

  const departments = [
    "HR",
    "IT",
    "Finance",
    "Sales",
    "Marketing",
    "Operations",
  ];

  const employmentTypes = [
    "Full Time",
    "Part Time",
    "Contract",
    "Intern",
    "Temporary",
  ];

  const employmentStatuses = ["Active", "Inactive", "On Leave", "Terminated"];

  const workLocations = ["Office", "Remote", "Hybrid"];

  const accountTypes = ["Savings", "Current"];

  const assetTypes = ["Serialized", "Non-Serialized"];

  const assetCategories = [
    "Laptop",
    "Desktop",
    "Monitor",
    "Mobile",
    "Keyboard",
    "Mouse",
    "Other",
  ];

  const assetConditions = ["New", "Good", "Fair", "Damaged"];

  const ownershipTypes = ["Company Owned", "Leased"];

  useEffect(() => {
    fetch("/api/admin/roles", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || localStorage.getItem("hrms_token") || ""}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) =>
        setAvailableRoles(
          (data?.data || []).filter((role) => role.isActive !== false),
        ),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) {
      setIsEditMode(false);
      return;
    }

    let mounted = true;
    const loadEmployee = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/employees/${id}?_=${Date.now()}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${
                localStorage.getItem("token") ||
                localStorage.getItem("hrms_token") ||
                ""
              }`,
              "Cache-Control": "no-cache",
            },
          },
        );

        console.log("Employee API status:", response.status);

        const result = await response.json().catch(() => null);

        console.log("Employee API response:", result);

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              `Unable to load employee (${response.status})`,
          );
        }

        const employee =
          result?.data?.employee || result?.employee || result?.data || null;

        if (!employee || typeof employee !== "object") {
          console.error("Invalid employee response:", result);
          throw new Error("Employee data not found in API response");
        }

        if (!mounted) return;

        const toDateInput = (value) => {
          if (!value) return "";

          const date = new Date(value);

          if (Number.isNaN(date.getTime())) {
            return "";
          }

          return date.toISOString().slice(0, 10);
        };

        setIsEditMode(true);

        setFormData((prev) => ({
          ...prev,
          ...employee,

          dateOfBirth: toDateInput(employee.dateOfBirth),
          joiningDate: toDateInput(employee.joiningDate),
          confirmationDate: toDateInput(employee.confirmationDate),

          address: {
            ...prev.address,
            ...(employee.address || {}),
          },

          permanentAddress: {
            ...prev.permanentAddress,
            ...(employee.permanentAddress || {}),
          },

          shiftTiming: {
            ...prev.shiftTiming,
            ...(employee.shiftTiming || {}),
          },

          salary: {
            ...prev.salary,
            ...(employee.salary || {}),
          },

          bankDetails: {
            ...prev.bankDetails,
            ...(employee.bankDetails || {}),
          },

          emergencyContact: {
            ...prev.emergencyContact,
            ...(employee.emergencyContact || {}),
          },

          documents: {
            ...prev.documents,
            ...(employee.documents || {}),
          },

          leaveBalance: {
            ...prev.leaveBalance,
            ...(employee.leaveBalance || {}),
          },

          weeklyOffDays: Array.isArray(employee.weeklyOffDays)
            ? employee.weeklyOffDays.join(", ")
            : employee.weeklyOffDays || "",

          skills: Array.isArray(employee.skills)
            ? employee.skills.join(", ")
            : employee.skills || "",
        }));

        if (employee.assetDetails) {
          setAssetDetails((prev) => ({
            ...prev,
            ...employee.assetDetails,
          }));
        }

        setAssetGiven(employee.assetGiven ? "yes" : "no");
      } catch (error) {
        console.error("Error loading employee:", error);

        alert(error.message || "Unable to load employee details.");

        navigate("/dashboard/employees");
      }
    };
    loadEmployee();
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");

      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAssetChange = (e) => {
    const { name, value } = e.target;

    setAssetDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        isEditMode ? `/api/employees/${id || formData._id}` : "/api/employees",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...formData,
            assetGiven,
            ...(assetGiven === "yes" && {
              assetDetails,
            }),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        alert(
          errorData?.error ||
            `Error: ${response.status} ${response.statusText}`,
        );

        return;
      }

      await response.json();

      alert(
        isEditMode
          ? "Employee updated successfully!"
          : "Employee added successfully!",
      );

      navigate("/dashboard/employees");
    } catch (error) {
      console.error("Network or Server Error:", error);
      alert("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      color: "#0f172a",
      backgroundColor: "#ffffff",
      borderRadius: "8px",

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

    "& .MuiInputLabel-root": {
      color: "#64748b",
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: "#8b5cf6",
    },

    "& .MuiSelect-icon": {
      color: "#64748b",
    },

    "& input[type='date']::-webkit-calendar-picker-indicator": {
      opacity: 0.7,
    },

    "& .MuiFormHelperText-root": {
      color: "#64748b",
    },
  };

  const selectMenuProps = {
    PaperProps: {
      sx: {
        bgcolor: "#ffffff",
        color: "#0f172a",
        border: "1px solid #e5e7eb",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",

        "& .MuiMenuItem-root:hover": {
          bgcolor: "#f8fafc",
        },

        "& .Mui-selected": {
          bgcolor: "#ede9fe !important",
          color: "#7c3aed",
        },
      },
    },
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        p: { xs: 2, sm: 3, md: 4 },
        background: "#f4f8f865",
        color: "#0f172a",
      }}
    >
      {/* PAGE HEADER */}
      <Box display="flex" alignItems="center" mb={{ xs: 3, md: 4 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            color: "#475569",
            mr: 1.5,

            "&:hover": {
              backgroundColor: "#f1f5f9",
              color: "#0f172a",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Box>
          <Typography
            fontSize={{ xs: 21, sm: 24 }}
            fontWeight={600}
            color="#0f172a"
          >
            {isEditMode ? "Edit Employee" : "Add New Employee"}
          </Typography>

          <Typography fontSize={14} color="#64748b" mt={0.5}>
            {isEditMode
              ? "Update employee information"
              : "Create a new employee and add their details"}
          </Typography>
        </Box>
      </Box>

      {/* RESPONSIVE FORM STEPPER - navigation only; all existing form fields remain unchanged */}
      <Box
        sx={{
          mb: { xs: 2, sm: 2.5 },
          px: { xs: 0.5, sm: 1 },
          overflowX: "auto",
          "&::-webkit-scrollbar": { height: 2 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#cbd5e1",
            borderRadius: 4,
          },
        }}
      >
        <Stepper
          alternativeLabel
          activeStep={activeStep}
          sx={{
            minWidth: { xs: 680, sm: "auto" },
            "& .MuiStepLabel-label": {
              fontSize: { xs: 11, sm: 12 },
              color: "#64748b",
            },
            "& .MuiStepLabel-label.Mui-active": {
              color: "#0f172a",
              fontWeight: 600,
            },
            "& .MuiStepConnector-line": {
              borderColor: "#e2e8f0",
            },
          }}
        >
          {employeeSteps.map((step) => (
            <Step key={step.id}>
              <StepLabel
                onClick={() => {
                  const stepIndex = employeeSteps.findIndex(
                    (item) => item.id === step.id,
                  );
                  setActiveStep(stepIndex);
                  document.getElementById(step.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                sx={{ cursor: "pointer" }}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* FULL WIDTH FORM */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          background: `
            radial-gradient(
              circle at 0% 0%,
              rgba(139, 92, 246, 0.08) 0%,
              transparent 45%
            ),
            linear-gradient(
              135deg,
              #ffffff 0%,
              #f8fafc 100%
            )
          `,
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          p: { xs: 2.5, sm: 3, md: 4 },
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
        }}
      >
        {/* PERSONAL INFORMATION */}
        <Typography
          id="employee-step-personal"
          fontSize={18}
          fontWeight={600}
          mb={3}
          color="#0f172a"
        >
          Personal Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleEmployeeChange}
              required
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleEmployeeChange}
              required
              sx={inputStyles}
              disabled={isEditMode}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleEmployeeChange}
              required
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Alternate Phone"
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleEmployeeChange}
              InputLabelProps={{ shrink: true }}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleEmployeeChange}
              sx={inputStyles}
              SelectProps={{ MenuProps: selectMenuProps }}
            >
              {genders.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Blood Group"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleEmployeeChange}
              sx={inputStyles}
              SelectProps={{ MenuProps: selectMenuProps }}
            >
              {bloodGroups.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Marital Status"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleEmployeeChange}
              sx={inputStyles}
              SelectProps={{ MenuProps: selectMenuProps }}
            >
              {maritalStatuses.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Avatar URL"
              name="avatar"
              value={formData.avatar}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>
        </Grid>

        <Divider
          sx={{
            borderColor: "#e5e7eb",
            my: 4,
          }}
        />

        {/* ADDRESS */}
        <Typography
          id="employee-step-address"
          fontSize={18}
          fontWeight={600}
          mb={3}
          color="#0f172a"
        >
          Address
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Current Street"
              name="address.street"
              value={formData.address.street}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Current City"
              name="address.city"
              value={formData.address.city}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Current State"
              name="address.state"
              value={formData.address.state}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Current Pincode"
              name="address.pincode"
              value={formData.address.pincode}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Current Country"
              name="address.country"
              value={formData.address.country}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Permanent Street"
              name="permanentAddress.street"
              value={formData.permanentAddress.street}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Permanent City"
              name="permanentAddress.city"
              value={formData.permanentAddress.city}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Permanent State"
              name="permanentAddress.state"
              value={formData.permanentAddress.state}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Permanent Pincode"
              name="permanentAddress.pincode"
              value={formData.permanentAddress.pincode}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Permanent Country"
              name="permanentAddress.country"
              value={formData.permanentAddress.country}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: "#e5e7eb", my: 4 }} />

        {/* JOB DETAILS */}
        <Typography
          id="employee-step-job"
          fontSize={18}
          fontWeight={600}
          mb={3}
          color="#0f172a"
        >
          Job Details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Designation (Job Title)"
              name="designation"
              value={formData.designation}
              onChange={handleEmployeeChange}
              required
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="System Role"
              name="role"
              value={formData.role}
              onChange={handleEmployeeChange}
              required
              sx={inputStyles}
              SelectProps={{ MenuProps: selectMenuProps }}
            >
              {(availableRoles.length
                ? availableRoles
                : [
                    { code: "employee", name: "employee" },
                    { code: "hr", name: "hr" },
                    { code: "manager", name: "manager" },
                    { code: "admin", name: "admin" },
                  ]
              ).map((roleOption) => (
                <MenuItem key={roleOption.code} value={roleOption.code}>
                  {String(roleOption.name || roleOption.code)
                    .replace(/_/g, " ")
                    .toUpperCase()}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleEmployeeChange}
              required
              sx={inputStyles}
              SelectProps={{ MenuProps: selectMenuProps }}
            >
              {departments.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Reports To (Manager ID)"
              name="reportsTo"
              value={formData.reportsTo}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Employment Type"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleEmployeeChange}
              sx={inputStyles}
              SelectProps={{ MenuProps: selectMenuProps }}
            >
              {employmentTypes.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Employment Status"
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleEmployeeChange}
              sx={inputStyles}
              SelectProps={{ MenuProps: selectMenuProps }}
            >
              {employmentStatuses.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Work Location"
              name="workLocation"
              value={formData.workLocation}
              onChange={handleEmployeeChange}
              sx={inputStyles}
              SelectProps={{ MenuProps: selectMenuProps }}
            >
              {workLocations.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Joining Date"
              name="joiningDate"
              type="date"
              value={formData.joiningDate}
              onChange={handleEmployeeChange}
              InputLabelProps={{ shrink: true }}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Confirmation Date"
              name="confirmationDate"
              type="date"
              value={formData.confirmationDate}
              onChange={handleEmployeeChange}
              InputLabelProps={{ shrink: true }}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Shift Start"
              name="shiftTiming.start"
              value={formData.shiftTiming.start}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Shift End"
              name="shiftTiming.end"
              value={formData.shiftTiming.end}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Weekly Off Days"
              name="weeklyOffDays"
              value={formData.weeklyOffDays}
              onChange={handleEmployeeChange}
              helperText="Comma separated, like Saturday, Sunday"
              sx={inputStyles}
            />
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: "#e5e7eb", my: 4 }} />

        {/* SALARY */}
        <Typography
          id="employee-step-salary"
          fontSize={18}
          fontWeight={600}
          mb={3}
          color="#0f172a"
        >
          Salary
        </Typography>

        <Grid container spacing={3}>
          {[
            ["Basic", "salary.basic"],
            ["HRA", "salary.hra"],
            ["DA", "salary.da"],
            ["TA", "salary.ta"],
            ["Other Allowances", "salary.otherAllowances"],
            ["PF", "salary.pf"],
            ["ESI", "salary.esi"],
            ["TDS", "salary.tds"],
          ].map(([label, name]) => {
            const [parent, child] = name.split(".");

            return (
              <Grid item xs={12} sm={4} key={name}>
                <TextField
                  fullWidth
                  label={label}
                  name={name}
                  value={formData[parent][child]}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
            );
          })}
        </Grid>

        <Divider sx={{ borderColor: "#e5e7eb", my: 4 }} />

        {/* BANK DETAILS */}
        <Typography
          id="employee-step-bank"
          fontSize={18}
          fontWeight={600}
          mb={3}
          color="#0f172a"
        >
          Bank Details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Account Holder Name"
              name="bankDetails.accountHolderName"
              value={formData.bankDetails.accountHolderName}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bank Name"
              name="bankDetails.bankName"
              value={formData.bankDetails.bankName}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Account Number"
              name="bankDetails.accountNumber"
              value={formData.bankDetails.accountNumber}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="IFSC Code"
              name="bankDetails.ifscCode"
              value={formData.bankDetails.ifscCode}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Branch Name"
              name="bankDetails.branchName"
              value={formData.bankDetails.branchName}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Account Type"
              name="bankDetails.accountType"
              value={formData.bankDetails.accountType}
              onChange={handleEmployeeChange}
              sx={inputStyles}
              SelectProps={{ MenuProps: selectMenuProps }}
            >
              {accountTypes.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: "#e5e7eb", my: 4 }} />

        {/* EMERGENCY CONTACT */}
        <Typography
          id="employee-step-emergency"
          fontSize={18}
          fontWeight={600}
          mb={3}
          color="#0f172a"
        >
          Emergency Contact
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Contact Name"
              name="emergencyContact.name"
              value={formData.emergencyContact.name}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Relation"
              name="emergencyContact.relation"
              value={formData.emergencyContact.relation}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Phone"
              name="emergencyContact.phone"
              value={formData.emergencyContact.phone}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: "#e5e7eb", my: 4 }} />

        {/* DOCUMENTS & SYSTEM */}
        <Typography
          id="employee-step-documents"
          fontSize={18}
          fontWeight={600}
          mb={3}
          color="#0f172a"
        >
          Documents & System
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Aadhar"
              name="documents.aadhar"
              value={formData.documents.aadhar}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="PAN"
              name="documents.pan"
              value={formData.documents.pan}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Passport"
              name="documents.passport"
              value={formData.documents.passport}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Driving License"
              name="documents.drivingLicense"
              value={formData.documents.drivingLicense}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Biometric ID"
              name="biometricId"
              value={formData.biometricId}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Skills"
              name="skills"
              value={formData.skills}
              onChange={handleEmployeeChange}
              helperText="Comma separated, like React, Node.js, MongoDB"
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Leave - Sick"
              name="leaveBalance.sick"
              value={formData.leaveBalance.sick}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Leave - Casual"
              name="leaveBalance.casual"
              value={formData.leaveBalance.casual}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Leave - Earned"
              name="leaveBalance.earned"
              value={formData.leaveBalance.earned}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Leave - Unpaid"
              name="leaveBalance.unpaid"
              value={formData.leaveBalance.unpaid}
              onChange={handleEmployeeChange}
              sx={inputStyles}
            />
          </Grid>
        </Grid>

        {/* ASSET ASSIGNMENT */}
        {!isEditMode && (
          <Box
            sx={{
              mt: 5,
              p: { xs: 2, sm: 3 },
              background: `
                radial-gradient(
                  circle at 0% 0%,
                  rgba(139, 92, 246, 0.07) 0%,
                  transparent 55%
                ),
                #ffffff
              `,
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <DevicesIcon sx={{ color: "#8b5cf6" }} />

                <Typography
                  id="employee-step-assets"
                  fontSize={18}
                  fontWeight={600}
                  color="#0f172a"
                >
                  Assign Company Asset?
                </Typography>
              </Box>

              <ToggleButtonGroup
                value={assetGiven}
                exclusive
                onChange={(e, val) => {
                  if (val) setAssetGiven(val);
                }}
                sx={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              >
                <ToggleButton
                  value="yes"
                  sx={{
                    px: 3,
                    color: "#64748b",
                    border: "none",

                    "&.Mui-selected": {
                      background: "#8b5cf6 !important",
                      color: "#ffffff !important",
                      fontWeight: 600,
                    },
                  }}
                >
                  Yes
                </ToggleButton>

                <ToggleButton
                  value="no"
                  sx={{
                    px: 3,
                    color: "#64748b",
                    border: "none",

                    "&.Mui-selected": {
                      background: "#ef4444 !important",
                      color: "#ffffff !important",
                      fontWeight: 600,
                    },
                  }}
                >
                  No
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {assetGiven === "yes" && (
              <Box mt={4}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Asset Name"
                      name="assetName"
                      value={assetDetails.assetName}
                      onChange={handleAssetChange}
                      required
                      sx={inputStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Asset ID (System Tag)"
                      name="assetId"
                      placeholder="e.g. AST-001"
                      value={assetDetails.assetId}
                      onChange={handleAssetChange}
                      required
                      sx={inputStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Asset Type"
                      name="type"
                      value={assetDetails.type}
                      onChange={handleAssetChange}
                      sx={inputStyles}
                      SelectProps={{
                        MenuProps: selectMenuProps,
                      }}
                    >
                      {assetTypes.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Category"
                      name="category"
                      value={assetDetails.category}
                      onChange={handleAssetChange}
                      sx={inputStyles}
                      SelectProps={{
                        MenuProps: selectMenuProps,
                      }}
                    >
                      {assetCategories.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {assetDetails.type === "Serialized" && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Manufacturer Serial Number"
                        name="serialNumber"
                        placeholder="e.g. C02XYZ123"
                        value={assetDetails.serialNumber}
                        onChange={handleAssetChange}
                        required
                        sx={inputStyles}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Brand"
                      name="brand"
                      placeholder="e.g. Apple"
                      value={assetDetails.brand}
                      onChange={handleAssetChange}
                      sx={inputStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Model"
                      name="model"
                      placeholder="e.g. M2 2023"
                      value={assetDetails.model}
                      onChange={handleAssetChange}
                      sx={inputStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      fullWidth
                      label="Condition"
                      name="condition"
                      value={assetDetails.condition}
                      onChange={handleAssetChange}
                      sx={inputStyles}
                      SelectProps={{
                        MenuProps: selectMenuProps,
                      }}
                    >
                      {assetConditions.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Ownership"
                      name="ownership"
                      value={assetDetails.ownership}
                      onChange={handleAssetChange}
                      sx={inputStyles}
                      SelectProps={{
                        MenuProps: selectMenuProps,
                      }}
                    >
                      {ownershipTypes.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        )}

        {/* ACTION BUTTONS */}
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={2}
          mt={5}
          pt={3}
          borderTop="1px solid #e5e7eb"
          sx={{
            "@media (max-width: 500px)": {
              flexDirection: "column-reverse",
              alignItems: "stretch",

              "& button": {
                width: "100%",
              },
            },
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{
              color: "#475569",
              borderColor: "#e2e8f0",
              background: "#ffffff",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              height: 44,
              borderRadius: "8px",

              "&:hover": {
                borderColor: "#cbd5e1",
                backgroundColor: "#f8fafc",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={!loading && <SaveIcon />}
            sx={{
              background: "#8b5cf6",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              height: 44,
              borderRadius: "8px",
              boxShadow: "none",

              "&:hover": {
                background: "#7c3aed",
                boxShadow: "0 6px 16px rgba(139, 92, 246, 0.18)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#ffffff" }} />
            ) : isEditMode ? (
              "Update Employee"
            ) : (
              "Save Employee"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddEmployee;
