import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from "@mui/material";
import {
  Save as SaveIcon,
  Devices as DevicesIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import execReq from "../../lib/execReq";

const employeeSteps = [
  { label: "Personal" },
  { label: "Address" },
  { label: "Job Details" },
  { label: "Salary & Compensation" },
  { label: "Bank Details" },
  { label: "Emergency" },
  { label: "Documents" },
  { label: "Assets" },
];

const AddEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [assetGiven, setAssetGiven] = useState("no");
  const [activeStep, setActiveStep] = useState(0);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

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
    execReq("/admin/roles")
      .then((res) => res?.data)
      .then((data) =>
        setAvailableRoles(
          (data?.data || []).filter((role) => role?.isActive !== false),
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
        const response = await execReq(`/employees/${id}?_=${Date.now()}`, {
          headers: { "Cache-Control": "no-cache" },
        });
        const result = response?.data;
        const employee =
          result?.data?.employee || result?.employee || result?.data || null;

        if (!employee || typeof employee !== "object") {
          throw new Error("Employee data not found in API response");
        }

        if (!mounted) return;

        const toDateInput = (value) => {
          if (!value) return "";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "";
          return date.toISOString().slice(0, 10);
        };

        setIsEditMode(true);
        setFormData((prev) => ({
          ...prev,
          ...employee,
          dateOfBirth: toDateInput(employee?.dateOfBirth),
          joiningDate: toDateInput(employee?.joiningDate),
          confirmationDate: toDateInput(employee?.confirmationDate),
          address: { ...prev.address, ...(employee?.address || {}) },
          permanentAddress: {
            ...prev.permanentAddress,
            ...(employee?.permanentAddress || {}),
          },
          shiftTiming: {
            ...prev.shiftTiming,
            ...(employee?.shiftTiming || {}),
          },
          salary: { ...prev.salary, ...(employee?.salary || {}) },
          bankDetails: {
            ...prev.bankDetails,
            ...(employee?.bankDetails || {}),
          },
          emergencyContact: {
            ...prev.emergencyContact,
            ...(employee?.emergencyContact || {}),
          },
          documents: { ...prev.documents, ...(employee?.documents || {}) },
          leaveBalance: {
            ...prev.leaveBalance,
            ...(employee?.leaveBalance || {}),
          },
          weeklyOffDays: Array.isArray(employee?.weeklyOffDays)
            ? employee?.weeklyOffDays.join(", ")
            : employee?.weeklyOffDays || "",
          skills: Array.isArray(employee?.skills)
            ? employee?.skills.join(", ")
            : employee?.skills || "",
        }));

        if (employee?.assetDetails) {
          setAssetDetails((prev) => ({ ...prev, ...employee?.assetDetails }));
        }
        setAssetGiven(employee?.assetGiven ? "yes" : "no");
      } catch (error) {
        console.error("Error loading employee:", error);
        alert(error?.message || "Unable to load employee details.");
        navigate("/dashboard/employees");
      }
    };
    loadEmployee();

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const getFieldValue = (data, field) =>
    field.split(".").reduce((value, key) => value?.[key], data);

  const getFieldError = (field, data = formData, assets = assetDetails) => {
    const value = field.startsWith("asset.")
      ? getFieldValue(assets, field.replace("asset.", ""))
      : getFieldValue(data, field);
    if (!String(value || "").trim()) return "This field is required.";
    if (field === "email" && !/^\S+@\S+\.\S+$/.test(String(value))) {
      return "Enter a valid email address.";
    }
    return "";
  };

  const requiredFieldsByStep = {
    0: ["fullName", "email", "mobileNo"],
    2: ["designation", "role", "department"],
    7:
      !isEditMode && assetGiven === "yes"
        ? ["asset.assetName", "asset.assetId", ...(assetDetails?.type === "Serialized" ? ["asset.serialNumber"] : [])]
        : [],
  };

  const validateStep = (step) => {
    const errors = (requiredFieldsByStep[step] || []).reduce((next, field) => {
      const error = getFieldError(field);
      if (error) next[field] = error;
      return next;
    }, {});
    setFieldErrors((current) => ({ ...current, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;
    let nextFormData;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      nextFormData = {
        ...formData,
        [parent]: { ...formData[parent], [child]: value },
      };
      setFormData(nextFormData);
    } else {
      nextFormData = { ...formData, [name]: value };
      setFormData(nextFormData);
    }
    if (fieldErrors[name]) {
      setFieldErrors((current) => {
        const error = getFieldError(name, nextFormData);
        if (error) return { ...current, [name]: error };
        const { [name]: _, ...remaining } = current;
        return remaining;
      });
    }
  };

  const handleAssetChange = (e) => {
    const { name, value } = e.target;
    const nextAssetDetails = { ...assetDetails, [name]: value };
    setAssetDetails(nextAssetDetails);
    const field = `asset.${name}`;
    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const error = getFieldError(field, formData, nextAssetDetails);
        if (error) return { ...current, [field]: error };
        const { [field]: _, ...remaining } = current;
        return remaining;
      });
    }
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) return;
    setActiveStep((prev) => Math.min(prev + 1, employeeSteps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const applyBackendFieldErrors = (message, details) => {
    const text = String(message || "");
    if (details && typeof details === "object") {
      const entries = Object.entries(details);
      if (entries.length) {
        const errors = entries.reduce((next, [field, detail]) => {
          const errorField = ["assetName", "assetId", "serialNumber"].includes(field)
            ? `asset.${field}`
            : field;
          next[errorField] = detail?.message || detail || text;
          return next;
        }, {});
        setFieldErrors((current) => ({ ...current, ...errors }));
        return true;
      }
    }
    const field = [
      "fullName",
      "email",
      "mobileNo",
      "designation",
      "role",
      "department",
      "assetName",
      "assetId",
      "serialNumber",
    ].find((name) => new RegExp(`\\b${name}\\b`, "i").test(text));

    if (!field) return false;
    const errorField = ["assetName", "assetId", "serialNumber"].includes(field)
      ? `asset.${field}`
      : field;
    setFieldErrors((current) => ({ ...current, [errorField]: text }));
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!String(formData?.mobileNo || "").trim()) {
      setFieldErrors((current) => ({ ...current, mobileNo: "This field is required." }));
      setActiveStep(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const endpoint = isEditMode
        ? `/employees/${id || formData?._id}`
        : "/employees";

      const cleanFormData = {
        ...formData,
        mobileNo: String(formData?.mobileNo || "").trim(),
        workLocation: formData?.workLocation || undefined,
        bankDetails: {
          ...formData?.bankDetails,
          accountType: formData?.bankDetails?.accountType || undefined,
        },
      };

      const payload = {
        ...cleanFormData,
        assetGiven,
        ...(assetGiven === "yes" && { assetDetails }),
      };

      const response = isEditMode
        ? await execReq.put(endpoint, payload)
        : await execReq.post(endpoint, payload);

      const result = response?.data;
      if (result?.success === false) {
        const errorMessage = result?.message || result?.error || "Unable to save employee.";
        if (!applyBackendFieldErrors(errorMessage)) alert(errorMessage);
        return;
      }

      alert(
        isEditMode
          ? "Employee updated successfully!"
          : "Employee added successfully!",
      );
      navigate("/dashboard/employees");
    } catch (error) {
      console.error("Network or Server Error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to connect to the server.";
      if (!applyBackendFieldErrors(errorMessage, error?.response?.data?.errors)) alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      color: "#0F172A",
      backgroundColor: "#FFFFFF",
      borderRadius: "8px",
      fontSize: "14px",
      "&.Mui-focused fieldset": {
        borderColor: "#7C3AED",
        borderWidth: "1.5px",
      },
    },
    "& .MuiInputLabel-root": { color: "#64748B", fontSize: "14px" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#7C3AED" },
  };

  const selectMenuProps = {
    PaperProps: {
      sx: {
        bgcolor: "#FFFFFF",
        color: "#0F172A",
        border: "1px solid #E2E8F0",
        boxShadow: "0 10px 15px -3px rgba(15,23,42,.10)",
        borderRadius: "8px",
        "& .MuiMenuItem-root:hover": { bgcolor: "#F8FAFC" },
        "& .Mui-selected": {
          bgcolor: "#EEF2FF !important",
          color: "#7C3AED",
          fontWeight: 600,
        },
      },
    },
  };

  const completionPercentage = Math.round(
    ((activeStep + 1) / employeeSteps.length) * 100,
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{
        width: "100%",
        height: "89vh",
        maxHeight: "100vh",
        background: "#F8FAFC",
        color: "#0F172A",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 1. FIXED TOP HEADER BAR */}
      <Box
        sx={{
          flexShrink: 0,
          px: { xs: 2, sm: 4 },
          py: 1.5,
          borderBottom: "1px solid #E2E8F0",
          background: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box>
          <Typography fontSize={18} fontWeight={700} color="#0F172A">
            {isEditMode ? "Edit Employee" : "Add New Employee"}
          </Typography>
          <Typography fontSize={12} color="#64748B" mt={0.2}>
            Step {activeStep + 1} of {employeeSteps.length} &bull;{" "}
            {employeeSteps[activeStep]?.label} Details
          </Typography>
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "right" }}>
          <Typography fontSize={11} color="#64748B" fontWeight={500}>
            Autosaved Just now
          </Typography>
          <Typography fontSize={12} fontWeight={700} color="#7C3AED" mt={0.2}>
            {completionPercentage}% Completed
          </Typography>
        </Box>
      </Box>

      {/* 2. FIXED STEPPER BAR */}
      <Box
        sx={{
          flexShrink: 0,
          px: { xs: 2, sm: 4 },
          py: 2,
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          overflowX: "auto",
          "&::-webkit-scrollbar": { height: 3 },
        }}
      >
        <Stepper
          alternativeLabel
          activeStep={activeStep}
          sx={{ minWidth: 650 }}
        >
          {employeeSteps.map((step, index) => (
            <Step key={index} completed={activeStep > index}>
              <StepLabel
                onClick={() => setActiveStep(index)}
                sx={{
                  cursor: "pointer",
                  "& .MuiStepLabel-label": {
                    fontSize: "11px",
                    color: "#64748B",
                    mt: 0.5,
                    fontWeight: 500,
                  },
                  "& .MuiStepLabel-label.Mui-active": {
                    color: "#0F172A",
                    fontWeight: 700,
                  },
                  "& .MuiStepLabel-label.Mui-completed": {
                    color: "#059669",
                    fontWeight: 600,
                  },
                }}
              >
                {step?.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* 3. SCROLLABLE FORM BODY CONTAINER */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: { xs: 2, sm: 4 },
          py: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            p: { xs: 2.5, sm: 4 },
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
            width: "100%",
            maxWidth: "1200px",
            mb: 2,
          }}
        >
          {/* BANNER */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
            pb={2}
            borderBottom="1px solid #F1F5F9"
          >
            <Box>
              <Typography fontSize={17} fontWeight={700} color="#0F172A">
                {employeeSteps[activeStep]?.label} Information
              </Typography>
              <Typography fontSize={12} color="#64748B">
                Provide accurate information required for employee
                configuration.
              </Typography>
            </Box>
            <Chip
              label="* REQUIRED FIELDS"
              size="small"
              variant="outlined"
              sx={{
                borderColor: "#E2E8F0",
                color: "#D97706",
                background: "#FFFBEB",
                fontWeight: 700,
                fontSize: "10px",
                height: "24px",
              }}
            />
          </Box>

          {/* STEP 0: PERSONAL INFORMATION */}
          {activeStep === 0 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData?.fullName}
                  onChange={handleEmployeeChange}
                  required
                  error={Boolean(fieldErrors.fullName)}
                  helperText={fieldErrors.fullName}
                  sx={inputStyles}
                  placeholder="e.g. Sarah Jenkins"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData?.email}
                  onChange={handleEmployeeChange}
                  required
                  error={Boolean(fieldErrors.email)}
                  helperText={fieldErrors.email}
                  sx={inputStyles}
                  disabled={isEditMode}
                  placeholder="sarah.jenkins@company.com"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  name="mobileNo"
                  value={formData?.mobileNo}
                  onChange={handleEmployeeChange}
                  required
                  error={Boolean(fieldErrors.mobileNo)}
                  helperText={fieldErrors.mobileNo}
                  sx={inputStyles}
                  placeholder="+1 (555) 000-0000"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Alternate Phone"
                  name="alternatePhone"
                  value={formData?.alternatePhone}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                  placeholder="Optional phone"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData?.dateOfBirth}
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
                  value={formData?.gender}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Gender
                  </MenuItem>
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
                  value={formData?.bloodGroup}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Blood Group
                  </MenuItem>
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
                  value={formData?.maritalStatus}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Marital Status
                  </MenuItem>
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
                  value={formData?.nationality}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                  placeholder="e.g. American, Canadian"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Avatar / Profile Photo URL"
                  name="avatar"
                  value={formData?.avatar}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                  placeholder="https://domain.com/photo.jpg"
                />
              </Grid>
            </Grid>
          )}

          {/* STEP 1: ADDRESS */}
          {activeStep === 1 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Street"
                  name="address.street"
                  value={formData?.address?.street}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current City"
                  name="address.city"
                  value={formData?.address?.city}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Current State"
                  name="address.state"
                  value={formData?.address?.state}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Current Pincode"
                  name="address.pincode"
                  value={formData?.address?.pincode}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Current Country"
                  name="address.country"
                  value={formData?.address?.country}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Permanent Street"
                  name="permanentAddress.street"
                  value={formData?.permanentAddress?.street}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Permanent City"
                  name="permanentAddress.city"
                  value={formData?.permanentAddress?.city}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Permanent State"
                  name="permanentAddress.state"
                  value={formData?.permanentAddress?.state}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Permanent Pincode"
                  name="permanentAddress.pincode"
                  value={formData?.permanentAddress?.pincode}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Permanent Country"
                  name="permanentAddress.country"
                  value={formData?.permanentAddress?.country}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
            </Grid>
          )}

          {/* STEP 2: JOB DETAILS */}
          {activeStep === 2 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  name="designation"
                  value={formData?.designation}
                  onChange={handleEmployeeChange}
                  required
                  error={Boolean(fieldErrors.designation)}
                  helperText={fieldErrors.designation}
                  sx={inputStyles}
                  placeholder="e.g. Senior Software Engineer"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="System Role"
                  name="role"
                  value={formData?.role}
                  onChange={handleEmployeeChange}
                  required
                  error={Boolean(fieldErrors.role)}
                  helperText={fieldErrors.role}
                  sx={inputStyles}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                  }}
                >
                  <MenuItem value="" disabled>
                    Select System Role
                  </MenuItem>
                  {(availableRoles.length
                    ? availableRoles
                    : [
                        { code: "employee", name: "Employee" },
                        { code: "hr", name: "HR" },
                        { code: "manager", name: "Manager" },
                        { code: "admin", name: "Admin" },
                      ]
                  ).map((roleOption) => (
                    <MenuItem key={roleOption?.code} value={roleOption?.code}>
                      {String(
                        roleOption?.name || roleOption?.code,
                      ).toUpperCase()}
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
                  value={formData?.department}
                  onChange={handleEmployeeChange}
                  required
                  error={Boolean(fieldErrors.department)}
                  helperText={fieldErrors.department}
                  sx={inputStyles}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Department
                  </MenuItem>
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
                  value={formData?.reportsTo}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                  placeholder="Manager identifier"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Employment Type"
                  name="employmentType"
                  value={formData?.employmentType}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Employment Type
                  </MenuItem>
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
                  value={formData?.employmentStatus}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Employment Status
                  </MenuItem>
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
                  value={formData?.workLocation}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Work Location
                  </MenuItem>
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
                  value={formData?.joiningDate}
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
                  value={formData?.confirmationDate}
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
                  value={formData?.shiftTiming?.start}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                  placeholder="e.g. 09:00"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Shift End"
                  name="shiftTiming.end"
                  value={formData?.shiftTiming?.end}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                  placeholder="e.g. 18:00"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weekly Off Days"
                  name="weeklyOffDays"
                  value={formData?.weeklyOffDays}
                  onChange={handleEmployeeChange}
                  helperText="Comma separated values like Saturday, Sunday"
                  sx={inputStyles}
                />
              </Grid>
            </Grid>
          )}

          {/* STEP 3: SALARY */}
          {activeStep === 3 && (
            <Grid container spacing={2.5}>
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
                      type="number"
                      value={formData[parent][child]}
                      onChange={handleEmployeeChange}
                      sx={inputStyles}
                    />
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* STEP 4: BANK DETAILS */}
          {activeStep === 4 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Holder Name"
                  name="bankDetails.accountHolderName"
                  value={formData?.bankDetails?.accountHolderName}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  name="bankDetails.bankName"
                  value={formData?.bankDetails?.bankName}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Number"
                  name="bankDetails.accountNumber"
                  value={formData?.bankDetails?.accountNumber}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="IFSC Code"
                  name="bankDetails.ifscCode"
                  value={formData?.bankDetails?.ifscCode}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Branch Name"
                  name="bankDetails.branchName"
                  value={formData?.bankDetails?.branchName}
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
                  value={formData?.bankDetails?.accountType}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                  SelectProps={{
                    MenuProps: selectMenuProps,
                    displayEmpty: true,
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Account Type
                  </MenuItem>
                  {accountTypes.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          )}

          {/* STEP 5: EMERGENCY CONTACT */}
          {activeStep === 5 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  name="emergencyContact.name"
                  value={formData?.emergencyContact?.name}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Relation"
                  name="emergencyContact.relation"
                  value={formData?.emergencyContact?.relation}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="emergencyContact.phone"
                  value={formData?.emergencyContact?.phone}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
            </Grid>
          )}

          {/* STEP 6: DOCUMENTS */}
          {activeStep === 6 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Aadhar"
                  name="documents.aadhar"
                  value={formData?.documents?.aadhar}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PAN"
                  name="documents.pan"
                  value={formData?.documents?.pan}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Passport"
                  name="documents.passport"
                  value={formData?.documents?.passport}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Driving License"
                  name="documents.drivingLicense"
                  value={formData?.documents?.drivingLicense}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Biometric ID"
                  name="biometricId"
                  value={formData?.biometricId}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Skills"
                  name="skills"
                  value={formData?.skills}
                  onChange={handleEmployeeChange}
                  helperText="Comma separated values"
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Leave - Sick"
                  name="leaveBalance.sick"
                  type="number"
                  value={formData?.leaveBalance?.sick}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Leave - Casual"
                  name="leaveBalance.casual"
                  type="number"
                  value={formData?.leaveBalance?.casual}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Leave - Earned"
                  name="leaveBalance.earned"
                  type="number"
                  value={formData?.leaveBalance?.earned}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Leave - Unpaid"
                  name="leaveBalance.unpaid"
                  type="number"
                  value={formData?.leaveBalance?.unpaid}
                  onChange={handleEmployeeChange}
                  sx={inputStyles}
                />
              </Grid>
            </Grid>
          )}

          {/* STEP 7: ASSETS */}
          {activeStep === 7 && (
            <Box>
              {!isEditMode && (
                <Box
                  sx={{
                    p: { xs: 2, sm: 3 },
                    background: "#F8FAFC",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
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
                      <DevicesIcon sx={{ color: "#7C3AED" }} />
                      <Typography
                        fontSize={15}
                        fontWeight={600}
                        color="#0F172A"
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
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                      }}
                    >
                      <ToggleButton
                        value="yes"
                        sx={{
                          px: 3,
                          color: "#64748B",
                          border: "none",
                          "&.Mui-selected": {
                            background: "#7C3AED !important",
                            color: "#FFFFFF !important",
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
                          color: "#64748B",
                          border: "none",
                          "&.Mui-selected": {
                            background: "#EF4444 !important",
                            color: "#FFFFFF !important",
                            fontWeight: 600,
                          },
                        }}
                      >
                        No
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {assetGiven === "yes" && (
                    <Box mt={3}>
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Asset Name"
                            name="assetName"
                            value={assetDetails?.assetName}
                            onChange={handleAssetChange}
                            required
                            error={Boolean(fieldErrors["asset.assetName"])}
                            helperText={fieldErrors["asset.assetName"]}
                            sx={inputStyles}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Asset ID (System Tag)"
                            name="assetId"
                            placeholder="e.g. AST-001"
                            value={assetDetails?.assetId}
                            onChange={handleAssetChange}
                            required
                            error={Boolean(fieldErrors["asset.assetId"])}
                            helperText={fieldErrors["asset.assetId"]}
                            sx={inputStyles}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            label="Asset Type"
                            name="type"
                            value={assetDetails?.type}
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
                            value={assetDetails?.category}
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
                        {assetDetails?.type === "Serialized" && (
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Manufacturer Serial Number"
                              name="serialNumber"
                              placeholder="e.g. C02XYZ123"
                              value={assetDetails?.serialNumber}
                              onChange={handleAssetChange}
                              required
                              error={Boolean(fieldErrors["asset.serialNumber"])}
                              helperText={fieldErrors["asset.serialNumber"]}
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
                            value={assetDetails?.brand}
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
                            value={assetDetails?.model}
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
                            value={assetDetails?.condition}
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
                            value={assetDetails?.ownership}
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
            </Box>
          )}
        </Box>
      </Box>

      {/* 4. FIXED PINNED FOOTER ACTIONS */}
      <Box
        sx={{
          flexShrink: 0,
          py: 1.5,
          px: { xs: 2, sm: 4 },
          background: "#FFFFFF",
          borderTop: "1px solid #E2E8F0",
          boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.02)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{
            color: "#475569",
            borderColor: "#CBD5E1",
            background: "#FFFFFF",
            fontWeight: 600,
            px: 3,
            height: 40,
            borderRadius: "8px",
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
        <Box display="flex" gap={2}>
          {activeStep > 0 && (
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={handleBack}
              sx={{
                color: "#475569",
                borderColor: "#CBD5E1",
                fontWeight: 600,
                px: 3,
                height: 40,
                borderRadius: "8px",
                textTransform: "none",
              }}
            >
              Back
            </Button>
          )}
          {activeStep < employeeSteps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<NextIcon />}
              sx={{
                background: "#7C3AED",
                fontWeight: 600,
                px: 3,
                height: 40,
                borderRadius: "8px",
                textTransform: "none",
                "&:hover": { background: "#6D28D9" },
              }}
            >
              Save & Continue
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={!loading && <SaveIcon />}
              sx={{
                background: "#059669",
                fontWeight: 600,
                px: 3,
                height: 40,
                borderRadius: "8px",
                textTransform: "none",
                "&:hover": { background: "#047857" },
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "#FFFFFF" }} />
              ) : isEditMode ? (
                "Update Employee"
              ) : (
                "Save Employee"
              )}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AddEmployee;
