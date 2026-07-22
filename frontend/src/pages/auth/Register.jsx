import React, { useState } from "react";
import AuthLayout from "../../components/layout/authLayout";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  FormHelperText,
  Alert,
  CircularProgress,
} from "@mui/material";

import {
  PersonOutline as PersonOutlineIcon,
  MailOutline as MailOutlineIcon,
  LockOutlined as LockOutlinedIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
  VisibilityOffOutlined as VisibilityOffOutlinedIcon,
  ArrowForward as ArrowForwardIcon,
  GroupAdd as GroupAddIcon,
  KeyboardBackspaceOutlined as KeyboardBackspaceOutlinedIcon,
  BadgeOutlined as BadgeOutlinedIcon,
  WorkOutline as WorkOutlineIcon,
  CalendarTodayOutlined as CalendarTodayOutlinedIcon,
  PhoneOutlined as PhoneOutlinedIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Google Logo Component
const GoogleIconLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const DEPARTMENT_OPTIONS = [
  "IT",
  "Human Resources",
  "Finance",
  "Sales",
  "Marketing",
  "Operations",
  "Legal",
  "R&D",
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNo: "",
    department: "",
    role: "",
    employeeId: "",
    designation: "",
    joiningDate: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email address is invalid";

    if (!formData.mobileNo.trim())
      newErrors.mobileNo = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobileNo))
      newErrors.mobileNo = "Mobile number must be 10 digits";

    if (!formData.employeeId.trim())
      newErrors.employeeId = "Employee ID is required";
    if (!formData.designation.trim())
      newErrors.designation = "Designation is required";
    if (!formData.joiningDate)
      newErrors.joiningDate = "Joining date is required";

    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.role) newErrors.role = "Role is required";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setApiError("");

    const { confirmPassword, ...dataToSend } = formData;
    if (dataToSend.role) dataToSend.role = dataToSend.role.toLowerCase();

    try {
      await axios.post("http://localhost:5000/api/auth/register", dataToSend, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Registration successful! Please login with your credentials.");
      navigate("/");
    } catch (err) {
      setApiError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      height: "54px",
      borderRadius: "14px",
      color: "#fff",
      backgroundColor: "transparent",
      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
      "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.6)" },
      "&.Mui-focused fieldset": {
        borderColor: "#8b5cf6",
        borderWidth: "1.5px",
      },
    },
    "& .MuiInputBase-input::placeholder": { color: "#9ca3af", opacity: 1 },
    "& .MuiFormHelperText-root": { color: "#f44336", marginLeft: "8px" },
    "& input[type='date']::-webkit-calendar-picker-indicator": {
      filter: "invert(1)",
    },
  };

  // Fixed Select Styles to perfectly match inputStyles
  const selectStyles = {
    height: "54px",
    borderRadius: "14px",
    color: "#fff",
    backgroundColor: "transparent",
    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.6)" },
    "&.Mui-focused fieldset": {
      borderColor: "#8b5cf6",
      borderWidth: "1.5px",
    },
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      color: "#fff",
    },
    "& .MuiSvgIcon-root": { color: "#d1d5db" },
  };

  return (
    <AuthLayout>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          width: "100%",
          maxWidth: 450,
          height: 690,
          transform: "rotateY(-18deg) rotateX(2deg)",
          transformStyle: "preserve-3d",
          transition: "transform 0.3s ease",
          "&:hover": { transform: "rotateY(-8deg) rotateX(1deg)" },
          p: { xs: 4, md: 5 },
          borderRadius: "28px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)",
          backdropFilter: "blur(30px)",
          borderTop: "1.5px solid rgba(255,255,255,0.6)",
          borderLeft: "1.5px solid rgba(255,255,255,0.6)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.4)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          textAlign="center"
          display="flex"
          flexDirection="column"
          alignItems="center"
          position="relative"
        >
          <IconButton
            onClick={() => navigate("/")}
            sx={{ position: "absolute", top: -30, left: -20, color: "#fff" }}
          >
            <KeyboardBackspaceOutlinedIcon />
          </IconButton>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: "14px",
              background: "rgba(255,255,255,0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 2,
              border: "1px solid rgba(255,255,255,0.4)",
            }}
          >
            <GroupAddIcon sx={{ color: "#fff", fontSize: 28 }} />
          </Box>
          <Typography variant="h5" fontWeight="600" mb={1}>
            Create Account
          </Typography>
        </Box>

        {apiError && (
          <Alert
            severity="error"
            sx={{
              mt: 1,
              mb: 1,
              borderRadius: "12px",
              bgcolor: "rgba(244,67,54,0.1)",
              color: "#ff6b6b",
            }}
          >
            {apiError}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            maxHeight: "460px",
            gap: 2.5,
            mt: 2,
            flexGrow: 1,
            overflowY: "auto",
            pr: 1.5,
            pb: 2,
            "&::-webkit-scrollbar": { width: "5px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255,255,255,0.15)",
              borderRadius: "10px",
            },
          }}
        >
          {/* Full Name */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "#e5e7eb", ml: 0.5 }}
            >
              Full Name *
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your full name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: "#d1d5db" }} />
                  </InputAdornment>
                ),
              }}
              sx={inputStyles}
            />
          </Box>

          {/* Email */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "#e5e7eb", ml: 0.5 }}
            >
              Email Address *
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon sx={{ color: "#d1d5db" }} />
                  </InputAdornment>
                ),
              }}
              sx={inputStyles}
            />
          </Box>

          {/* Employee ID & Mobile Number (Row) */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box flex={1}>
              <Typography
                variant="body2"
                sx={{ mb: 1, color: "#e5e7eb", ml: 0.5 }}
              >
                Employee ID *
              </Typography>
              <TextField
                fullWidth
                placeholder="EMP123"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                error={!!errors.employeeId}
                helperText={errors.employeeId}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeOutlinedIcon sx={{ color: "#d1d5db" }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Box>
            <Box flex={1}>
              <Typography
                variant="body2"
                sx={{ mb: 1, color: "#e5e7eb", ml: 0.5 }}
              >
                Mobile No *
              </Typography>
              <TextField
                fullWidth
                placeholder="10 digits"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                error={!!errors.mobileNo}
                helperText={errors.mobileNo}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon sx={{ color: "#d1d5db" }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Box>
          </Box>

          {/* Designation & Joining Date (Row) */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box flex={1}>
              <Typography
                variant="body2"
                sx={{ mb: 1, color: "#e5e7eb", ml: 0.5 }}
              >
                Designation *
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g. Developer"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                error={!!errors.designation}
                helperText={errors.designation}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkOutlineIcon sx={{ color: "#d1d5db" }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Box>
            <Box flex={1}>
              <Typography
                variant="body2"
                sx={{ mb: 1, color: "#e5e7eb", ml: 0.5 }}
              >
                Joining Date *
              </Typography>
              <TextField
                fullWidth
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                error={!!errors.joiningDate}
                helperText={errors.joiningDate}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayOutlinedIcon sx={{ color: "#d1d5db" }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Box>
          </Box>

          {/* Department */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "#e5e7eb", ml: 0.5 }}
            >
              Department *
            </Typography>
            <FormControl fullWidth error={!!errors.department}>
              <Select
                name="department"
                value={formData.department}
                onChange={handleChange}
                displayEmpty
                sx={selectStyles} // Added sx prop here
                renderValue={(selected) =>
                  !selected ? (
                    <span style={{ color: "#9ca3af" }}>Select department</span>
                  ) : (
                    selected
                  )
                }
              >
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
              {errors.department && (
                <FormHelperText>{errors.department}</FormHelperText>
              )}
            </FormControl>
          </Box>

          {/* Role */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "#e5e7eb", ml: 0.5 }}
            >
              Role *
            </Typography>
            <FormControl fullWidth error={!!errors.role}>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                displayEmpty
                sx={selectStyles}
                renderValue={(selected) =>
                  !selected ? (
                    <span style={{ color: "#9ca3af" }}>Select role</span>
                  ) : (
                    selected
                  )
                }
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
              {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
            </FormControl>
          </Box>

          {/* Passwords */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "#e5e7eb", ml: 0.5 }}
            >
              Password *
            </Typography>
            <TextField
              fullWidth
              placeholder="Min. 6 characters"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#d1d5db" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "#d1d5db" }}
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputStyles}
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "#e5e7eb", ml: 0.5 }}
            >
              Confirm Password *
            </Typography>
            <TextField
              fullWidth
              placeholder="Confirm password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#d1d5db" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                      sx={{ color: "#d1d5db" }}
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={inputStyles}
            />
          </Box>
        </Box>

        <Button
          fullWidth
          type="submit"
          disabled={loading}
          endIcon={!loading && <ArrowForwardIcon />}
          sx={{
            height: "54px",
            mt: 2,
            borderRadius: "14px",
            background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
            color: "#fff",
            fontSize: "1.05rem",
            fontWeight: "600",
            textTransform: "none",
            boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)",
            "&:hover": {
              background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
            },
            flexShrink: 0,
          }}
        >
          {loading ? (
            <CircularProgress size={28} sx={{ color: "#fff" }} />
          ) : (
            "Sign Up"
          )}
        </Button>

        <Box textAlign="center" mt={2} mb={1}>
          <Typography variant="body2" sx={{ color: "#d1d5db" }}>
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              style={{ color: "#8b5cf6", cursor: "pointer", fontWeight: "600" }}
            >
              Sign in
            </span>
          </Typography>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Register;
