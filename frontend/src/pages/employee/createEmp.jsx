import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  IconButton,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Devices as DevicesIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const departments = [
  "IT",
  "Human Resources",
  "Finance",
  "Sales",
  "Marketing",
  "Operations",
  "Legal",
  "R&D",
];

const genders = ["Male", "Female", "Other"];
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];

const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Intern",
  "Probation",
];

const employmentStatuses = [
  "Active",
  "On Notice",
  "Resigned",
  "Terminated",
  "On Leave",
];

const workLocations = ["Office", "Remote", "Hybrid"];
const accountTypes = ["Savings", "Current"];
const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Asset Dropdown Options
const assetCategories = ["IT", "Non-IT"];
const assetTypes = ["Serialized", "Consumable"];
const assetConditions = ["New", "Good", "Fair", "Poor"];
const ownershipTypes = ["Company Owned", "Leased/Rented"];

const AddEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNo: "",
    alternatePhone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    maritalStatus: "",
    nationality: "Indian",
    avatar: "",

    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    permanentAddress: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },

    designation: "",
    role: "",
    department: "",
    reportsTo: "",
    joiningDate: "",
    confirmationDate: "",
    employmentType: "Full-time",
    employmentStatus: "Active",
    workLocation: "Office",
    shiftTiming: {
      start: "09:00",
      end: "18:00",
    },
    weeklyOffDays: "Saturday, Sunday",

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
      accountType: "Savings",
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
    leaveBalance: {
      sick: 12,
      casual: 12,
      earned: 15,
      unpaid: 0,
    },
    skills: "",
  });

  const [assetGiven, setAssetGiven] = useState("no");
  const [assetDetails, setAssetDetails] = useState({
    assetName: "",
    assetId: "",
    category: "IT",
    type: "Serialized",
    serialNumber: "",
    brand: "",
    model: "",
    condition: "New",
    ownership: "Company Owned",
  });

  useEffect(() => {
    if (isEditMode) {
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

          const emp = res.data.data;

          const formatDate = (dateString) =>
            dateString ? new Date(dateString).toISOString().split("T")[0] : "";

          setFormData({
            fullName: emp.fullName || "",
            email: emp.email || "",
            mobileNo: emp.mobileNo || "",
            alternatePhone: emp.alternatePhone || "",
            dateOfBirth: formatDate(emp.dateOfBirth),
            gender: emp.gender || "",
            bloodGroup: emp.bloodGroup || "",
            maritalStatus: emp.maritalStatus || "",
            nationality: emp.nationality || "Indian",
            avatar: emp.avatar || "",

            address: {
              street: emp.address?.street || "",
              city: emp.address?.city || "",
              state: emp.address?.state || "",
              pincode: emp.address?.pincode || "",
              country: emp.address?.country || "India",
            },
            permanentAddress: {
              street: emp.permanentAddress?.street || "",
              city: emp.permanentAddress?.city || "",
              state: emp.permanentAddress?.state || "",
              pincode: emp.permanentAddress?.pincode || "",
              country: emp.permanentAddress?.country || "India",
            },

            designation: emp.designation || "",
            role: emp.role || "",
            department: emp.department || "",
            reportsTo: emp.reportsTo?._id || emp.reportsTo || "",
            joiningDate: formatDate(emp.joiningDate),
            confirmationDate: formatDate(emp.confirmationDate),
            employmentType: emp.employmentType || "Full-time",
            employmentStatus: emp.employmentStatus || "Active",
            workLocation: emp.workLocation || "Office",
            shiftTiming: {
              start: emp.shiftTiming?.start || "09:00",
              end: emp.shiftTiming?.end || "18:00",
            },
            weeklyOffDays: Array.isArray(emp.weeklyOffDays)
              ? emp.weeklyOffDays.join(", ")
              : "Saturday, Sunday",

            salary: {
              basic: emp.salary?.basic ?? "",
              hra: emp.salary?.hra ?? "",
              da: emp.salary?.da ?? "",
              ta: emp.salary?.ta ?? "",
              otherAllowances: emp.salary?.otherAllowances ?? "",
              pf: emp.salary?.pf ?? "",
              esi: emp.salary?.esi ?? "",
              tds: emp.salary?.tds ?? "",
            },

            bankDetails: {
              accountHolderName: emp.bankDetails?.accountHolderName || "",
              bankName: emp.bankDetails?.bankName || "",
              accountNumber: emp.bankDetails?.accountNumber || "",
              ifscCode: emp.bankDetails?.ifscCode || "",
              branchName: emp.bankDetails?.branchName || "",
              accountType: emp.bankDetails?.accountType || "Savings",
            },

            emergencyContact: {
              name: emp.emergencyContact?.name || "",
              relation: emp.emergencyContact?.relation || "",
              phone: emp.emergencyContact?.phone || "",
            },

            documents: {
              aadhar: emp.documents?.aadhar || "",
              pan: emp.documents?.pan || "",
              passport: emp.documents?.passport || "",
              drivingLicense: emp.documents?.drivingLicense || "",
            },

            biometricId: emp.biometricId || "",
            leaveBalance: {
              sick: emp.leaveBalance?.sick ?? 12,
              casual: emp.leaveBalance?.casual ?? 12,
              earned: emp.leaveBalance?.earned ?? 15,
              unpaid: emp.leaveBalance?.unpaid ?? 0,
            },
            skills: Array.isArray(emp.skills) ? emp.skills.join(", ") : "",
          });
        } catch (error) {
          console.error("Error fetching employee", error);
        }
      };
      fetchEmployee();
    }
  }, [id, isEditMode]);

  const setNestedValue = (obj, path, value) => {
    const keys = path.split(".");
    const copy = { ...obj };
    let cur = copy;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      cur[k] = { ...cur[k] };
      cur = cur[k];
    }

    cur[keys[keys.length - 1]] = value;
    return copy;
  };

  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => setNestedValue(prev, name, value));
  };

  const handleAssetChange = (e) =>
    setAssetDetails({ ...assetDetails, [e.target.name]: e.target.value });

  const num = (v) =>
    v === "" || v === null || v === undefined ? 0 : Number(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditMode
        ? `http://localhost:5000/api/employees/${id}`
        : "http://localhost:5000/api/employees";

      const method = isEditMode ? "put" : "post";

      const dataToSend = {
        ...formData,
        name: formData.fullName,
        role: formData.role ? formData.role.toLowerCase() : "",
        skills: formData.skills
          ? formData.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        weeklyOffDays: formData.weeklyOffDays
          ? formData.weeklyOffDays
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        salary: {
          basic: num(formData.salary.basic),
          hra: num(formData.salary.hra),
          da: num(formData.salary.da),
          ta: num(formData.salary.ta),
          otherAllowances: num(formData.salary.otherAllowances),
          pf: num(formData.salary.pf),
          esi: num(formData.salary.esi),
          tds: num(formData.salary.tds),
        },
        leaveBalance: {
          sick: num(formData.leaveBalance.sick),
          casual: num(formData.leaveBalance.casual),
          earned: num(formData.leaveBalance.earned),
          unpaid: num(formData.leaveBalance.unpaid),
        },
        assetGiven: assetGiven === "yes",
        assetDetails:
          assetGiven === "yes"
            ? {
                ...assetDetails,
                assetId: assetDetails.assetId,
              }
            : null,
      };

      const res = await axios[method](url, dataToSend, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.success) {
        alert(`Employee ${isEditMode ? "updated" : "added"} successfully!`);
        navigate("/employees");
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          `Error ${isEditMode ? "updating" : "adding"} employee`,
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      backgroundColor: "#1e293b",
      borderRadius: "8px",
      "& fieldset": { borderColor: "#334155" },
      "&:hover fieldset": { borderColor: "#64748b" },
      "&.Mui-focused fieldset": { borderColor: "#8b5cf6", borderWidth: "2px" },
    },
    "& .MuiInputLabel-root": { color: "#94a3b8" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
    "& .MuiSelect-icon": { color: "#94a3b8" },
    "& input[type='date']::-webkit-calendar-picker-indicator": {
      filter: "invert(1)",
    },
  };

  const selectMenuProps = {
    PaperProps: {
      sx: {
        bgcolor: "#1e293b",
        color: "#fff",
        "& .MuiMenuItem-root:hover": { bgcolor: "#334155" },
        "& .Mui-selected": { bgcolor: "#8b5cf6 !important" },
      },
    },
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: "#0f172a",
        minHeight: "100vh",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 850 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <IconButton
            sx={{ color: "#94a3b8", mr: 2 }}
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography fontSize={24} fontWeight="bold">
            {isEditMode ? "Edit Employee" : "Add New Employee"}
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            background: "#131826",
            p: { xs: 3, md: 4 },
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            border: "1px solid #1e293b",
          }}
        >
          <Typography fontSize={18} fontWeight="bold" mb={3} color="#e2e8f0">
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

          <Divider sx={{ borderColor: "#1e293b", my: 4 }} />

          <Typography fontSize={18} fontWeight="bold" mb={3} color="#e2e8f0">
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

          <Divider sx={{ borderColor: "#1e293b", my: 4 }} />

          <Typography fontSize={18} fontWeight="bold" mb={3} color="#e2e8f0">
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
                {["employee", "hr", "manager", "admin"].map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt.toUpperCase()}
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
                sx={{
                  ...inputStyles,
                  "& .MuiFormHelperText-root": {
                    color: "#9ca3af", // 👈 gray color
                  },
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: "#1e293b", my: 4 }} />

          <Typography fontSize={18} fontWeight="bold" mb={3} color="#e2e8f0">
            Salary
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Basic"
                name="salary.basic"
                value={formData.salary.basic}
                onChange={handleEmployeeChange}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="HRA"
                name="salary.hra"
                value={formData.salary.hra}
                onChange={handleEmployeeChange}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="DA"
                name="salary.da"
                value={formData.salary.da}
                onChange={handleEmployeeChange}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="TA"
                name="salary.ta"
                value={formData.salary.ta}
                onChange={handleEmployeeChange}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Other Allowances"
                name="salary.otherAllowances"
                value={formData.salary.otherAllowances}
                onChange={handleEmployeeChange}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="PF"
                name="salary.pf"
                value={formData.salary.pf}
                onChange={handleEmployeeChange}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ESI"
                name="salary.esi"
                value={formData.salary.esi}
                onChange={handleEmployeeChange}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="TDS"
                name="salary.tds"
                value={formData.salary.tds}
                onChange={handleEmployeeChange}
                sx={inputStyles}
              />
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: "#1e293b", my: 4 }} />

          <Typography fontSize={18} fontWeight="bold" mb={3} color="#e2e8f0">
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

          <Divider sx={{ borderColor: "#1e293b", my: 4 }} />

          <Typography fontSize={18} fontWeight="bold" mb={3} color="#e2e8f0">
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

          <Divider sx={{ borderColor: "#1e293b", my: 4 }} />

          <Typography fontSize={18} fontWeight="bold" mb={3} color="#e2e8f0">
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
                sx={{
                  ...inputStyles,
                  "& .MuiFormHelperText-root": {
                    color: "#9ca3af", // 👈 gray color
                  },
                }}
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

          {!isEditMode && (
            <Box
              sx={{
                mt: 5,
                p: 3,
                bgcolor: "rgba(139, 92, 246, 0.05)",
                borderRadius: 3,
                border: "1px solid #334155",
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                padding={0}
                gap={2}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  <DevicesIcon sx={{ color: "#a78bfa" }} />
                  <Typography fontSize={18} fontWeight="bold" color="#e2e8f0">
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
                    bgcolor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 2,
                  }}
                >
                  <ToggleButton
                    value="yes"
                    sx={{
                      px: 3,
                      color: "#94a3b8",
                      "&.Mui-selected": {
                        bgcolor: "#8b5cf6 !important",
                        color: "#fff !important",
                        fontWeight: "bold",
                      },
                    }}
                  >
                    Yes
                  </ToggleButton>
                  <ToggleButton
                    value="no"
                    sx={{
                      px: 3,
                      color: "#94a3b8",
                      "&.Mui-selected": {
                        bgcolor: "#ef4444 !important",
                        color: "#fff !important",
                        fontWeight: "bold",
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
                        SelectProps={{ MenuProps: selectMenuProps }}
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
                        SelectProps={{ MenuProps: selectMenuProps }}
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
                        SelectProps={{ MenuProps: selectMenuProps }}
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
                        SelectProps={{ MenuProps: selectMenuProps }}
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

          <Box display="flex" justifyContent="flex-end" gap={2} mt={5}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                color: "#94a3b8",
                borderColor: "#334155",
                textTransform: "none",
                fontWeight: "bold",
                px: 3,
                borderRadius: "8px",
                "&:hover": {
                  borderColor: "#94a3b8",
                  backgroundColor: "rgba(255,255,255,0.05)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              onClick={() => navigate("/dashboard/employees")}
              disabled={loading}
              startIcon={!loading && <SaveIcon />}
              sx={{
                background: "#8b5cf6",
                textTransform: "none",
                fontWeight: "bold",
                px: 3,
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
                "&:hover": { background: "#7c3aed" },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "#fff" }} />
              ) : isEditMode ? (
                "Update Employee"
              ) : (
                "Save Employee"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddEmployee;
