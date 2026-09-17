import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
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

import LoginImage from "../../assets/LoginImg.png";

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }

    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNo)) {
      newErrors.mobileNo = "Mobile number must be 10 digits";
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    }

    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required";
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = "Joining date is required";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setApiError("");

    const { confirmPassword, ...dataToSend } = formData;

    if (dataToSend.role) {
      dataToSend.role = dataToSend.role.toLowerCase();
    }

    try {
      await axios.post("http://localhost:5000/api/auth/register", dataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      alert("Registration successful! Please login with your credentials.");
      navigate("/");
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Common input styles
  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      height: "54px",
      borderRadius: "10px",
      backgroundColor: "#ffffff",
      color: "#172033",

      "& fieldset": {
        borderColor: "#d9e0ea",
        borderWidth: "1px",
      },

      "&:hover fieldset": {
        borderColor: "#93b4ff",
      },

      "&.Mui-focused fieldset": {
        borderColor: "#3b82f6",
        borderWidth: "1.5px",
      },
    },

    "& .MuiInputBase-input": {
      fontSize: "14px",
      color: "#172033",
    },

    "& .MuiInputBase-input::placeholder": {
      color: "#94a3b8",
      opacity: 1,
    },

    "& .MuiFormHelperText-root": {
      marginLeft: "4px",
      marginTop: "4px",
      fontSize: "11px",
    },

    "& input[type='date']::-webkit-calendar-picker-indicator": {
      opacity: 0.6,
    },
  };

  // Select styles
  const selectStyles = {
    height: "54px",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    color: "#172033",

    "& fieldset": {
      borderColor: "#d9e0ea",
      borderWidth: "1px",
    },

    "&:hover fieldset": {
      borderColor: "#93b4ff",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#3b82f6",
      borderWidth: "1.5px",
    },

    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      color: "#172033",
      fontSize: "14px",
    },

    "& .MuiSvgIcon-root": {
      color: "#64748b",
    },
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#f6f8fc",

        display: "grid",

        gridTemplateColumns: {
          xs: "1fr",
          lg: "65% 35%",
        },
      }}
    >
      {/* =====================================================
          LEFT IMAGE - 65%
      ====================================================== */}

      <Box
        sx={{
          display: {
            xs: "none",
            lg: "block",
          },

          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          background: "#f8fafc",
        }}
      >
        <Box
          component="img"
          src={LoginImage}
          alt="HRMS Dashboard"
          sx={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </Box>

      {/* =====================================================
          RIGHT REGISTER PANEL - 35%
      ====================================================== */}

      <Box
        sx={{
          width: "100%",
          height: "100vh",
          minWidth: 0,

          background: "#ffffff",

          display: "flex",
          flexDirection: "column",

          overflow: "hidden",
        }}
      >
        {/* Scrollable Register Area */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            overflowY: "auto",

            display: "flex",
            justifyContent: "center",

            px: {
              xs: 3,
              sm: 5,
              md: 5,
              lg: 4,
              xl: 5,
            },

            py: {
              xs: 4,
              sm: 5,
              lg: 4,
            },

            "&::-webkit-scrollbar": {
              width: "6px",
            },

            "&::-webkit-scrollbar-track": {
              background: "#f8fafc",
            },

            "&::-webkit-scrollbar-thumb": {
              background: "#cbd5e1",
              borderRadius: "10px",
            },
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              width: "100%",
              maxWidth: "430px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <Box
              sx={{
                position: "relative",
                mb: 3,
              }}
            >
              {/* Back Button */}

              <IconButton
                onClick={() => navigate("/")}
                sx={{
                  position: "absolute",
                  top: -5,
                  left: -10,

                  color: "#64748b",

                  borderRadius: "8px",

                  "&:hover": {
                    background: "#f1f5f9",
                    color: "#2563eb",
                  },
                }}
              >
                <KeyboardBackspaceOutlinedIcon />
              </IconButton>

              {/* Header Content */}

              <Box
                sx={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  pt: 1,
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,

                    borderRadius: "14px",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",

                    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.20)",

                    mb: 1.5,
                  }}
                >
                  <GroupAddIcon
                    sx={{
                      color: "#ffffff",
                      fontSize: 27,
                    }}
                  />
                </Box>

                <Typography
                  sx={{
                    fontSize: {
                      xs: "26px",
                      lg: "28px",
                    },

                    fontWeight: 700,
                    color: "#172033",
                    lineHeight: 1.2,
                  }}
                >
                  Create Account
                </Typography>

                <Typography
                  sx={{
                    mt: 0.7,
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Create your HRMS employee account
                </Typography>
              </Box>
            </Box>

            {/* =================================================
                API ERROR
            ================================================= */}

            {apiError && (
              <Alert
                severity="error"
                sx={{
                  mb: 2.5,
                  borderRadius: "10px",
                  background: "#fef2f2",
                  color: "#b91c1c",
                  border: "1px solid #fecaca",

                  "& .MuiAlert-icon": {
                    color: "#ef4444",
                  },
                }}
              >
                {apiError}
              </Alert>
            )}

            {/* =================================================
                FORM FIELDS
            ================================================= */}

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {/* Full Name */}

              <Box>
                <Typography
                  sx={{
                    mb: 0.7,
                    ml: 0.3,
                    color: "#1e293b",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
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
                  sx={inputStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon
                          sx={{
                            color: "#64748b",
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Email */}

              <Box>
                <Typography
                  sx={{
                    mb: 0.7,
                    ml: 0.3,
                    color: "#1e293b",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
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
                  sx={inputStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineIcon
                          sx={{
                            color: "#64748b",
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Employee ID + Mobile */}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      mb: 0.7,
                      ml: 0.3,
                      color: "#1e293b",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
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
                    sx={inputStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeOutlinedIcon
                            sx={{
                              color: "#64748b",
                              fontSize: 20,
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      mb: 0.7,
                      ml: 0.3,
                      color: "#1e293b",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
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
                    sx={inputStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneOutlinedIcon
                            sx={{
                              color: "#64748b",
                              fontSize: 20,
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>

              {/* Designation + Joining Date */}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      mb: 0.7,
                      ml: 0.3,
                      color: "#1e293b",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
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
                    sx={inputStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkOutlineIcon
                            sx={{
                              color: "#64748b",
                              fontSize: 20,
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      mb: 0.7,
                      ml: 0.3,
                      color: "#1e293b",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
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
                    sx={inputStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayOutlinedIcon
                            sx={{
                              color: "#64748b",
                              fontSize: 18,
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>

              {/* Department */}

              <Box>
                <Typography
                  sx={{
                    mb: 0.7,
                    ml: 0.3,
                    color: "#1e293b",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Department *
                </Typography>

                <FormControl fullWidth error={!!errors.department}>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    displayEmpty
                    sx={selectStyles}
                    renderValue={(selected) =>
                      !selected ? (
                        <span
                          style={{
                            color: "#94a3b8",
                          }}
                        >
                          Select department
                        </span>
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
                  sx={{
                    mb: 0.7,
                    ml: 0.3,
                    color: "#1e293b",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
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
                        <span
                          style={{
                            color: "#94a3b8",
                          }}
                        >
                          Select role
                        </span>
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

                  {errors.role && (
                    <FormHelperText>{errors.role}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* Password */}

              <Box>
                <Typography
                  sx={{
                    mb: 0.7,
                    ml: 0.3,
                    color: "#1e293b",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
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
                  sx={inputStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{
                            color: "#64748b",
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{
                            color: "#64748b",

                            "&:hover": {
                              color: "#2563eb",
                              background: "#eff6ff",
                            },
                          }}
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
                />
              </Box>

              {/* Confirm Password */}

              <Box>
                <Typography
                  sx={{
                    mb: 0.7,
                    ml: 0.3,
                    color: "#1e293b",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
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
                  sx={inputStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{
                            color: "#64748b",
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                          sx={{
                            color: "#64748b",

                            "&:hover": {
                              color: "#2563eb",
                              background: "#eff6ff",
                            },
                          }}
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
                />
              </Box>
            </Box>

            {/* =================================================
                SIGN UP BUTTON
            ================================================= */}

            <Button
              fullWidth
              type="submit"
              disabled={loading}
              endIcon={!loading && <ArrowForwardIcon />}
              sx={{
                height: "54px",
                mt: 2.5,

                borderRadius: "10px",

                background: "linear-gradient(90deg, #4f46e5 0%, #2563eb 100%)",

                color: "#ffffff",

                fontSize: "15px",
                fontWeight: 600,

                textTransform: "none",

                boxShadow: "0 8px 20px rgba(37, 99, 235, 0.20)",

                transition: "all 0.2s ease",

                "&:hover": {
                  background:
                    "linear-gradient(90deg, #4338ca 0%, #1d4ed8 100%)",

                  boxShadow: "0 10px 25px rgba(37, 99, 235, 0.28)",

                  transform: "translateY(-1px)",
                },

                "&.Mui-disabled": {
                  color: "#ffffff",
                  background: "#94a3b8",
                },
              }}
            >
              {loading ? (
                <CircularProgress
                  size={24}
                  sx={{
                    color: "#ffffff",
                  }}
                />
              ) : (
                "Create Account"
              )}
            </Button>

            {/* =================================================
                LOGIN LINK
            ================================================= */}

            <Box
              sx={{
                textAlign: "center",
                mt: 2.5,
                pb: 1,
              }}
            >
              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Already have an account?{" "}
                <Box
                  component="span"
                  onClick={() => navigate("/")}
                  sx={{
                    color: "#2563eb",
                    cursor: "pointer",
                    fontWeight: 600,

                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign in
                </Box>
              </Typography>
            </Box>

            {/* =================================================
                SECURITY
            ================================================= */}

            <Typography
              sx={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "11px",
                pb: 1,
              }}
            >
              © 2026 HRMS. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
