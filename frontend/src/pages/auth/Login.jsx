// src/pages/auth/Login.jsx

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";

import {
  MailOutline as MailOutlineIcon,
  LockOutlined as LockOutlinedIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
  VisibilityOffOutlined as VisibilityOffOutlinedIcon,
  ArrowForward as ArrowForwardIcon,
  PeopleOutline as PeopleOutlineIcon,
  SecurityOutlined as SecurityOutlinedIcon,
  KeyboardBackspaceOutlined as KeyboardBackspaceOutlinedIcon,
} from "@mui/icons-material";

import { useNavigate, Link } from "react-router-dom";
import execReq, { SOCKET_BASE_URL } from "../../lib/execReq";
import useAuthStore from "../../strore/authStore";
import LoginImage from "../../assets/loginImg.png"; // Import the image
// Google Icon
const GoogleIconLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="#4F46E5"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#10B981"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#F59E0B"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EF4444"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await execReq.post(
        "/auth/login",
        {
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const payload = response.data?.data || response.data;

      const accessToken = payload.accessToken || payload.token;
      const user = payload.user;

      if (!accessToken || !user) {
        throw new Error("Login response is missing token or user details.");
      }

      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("token", accessToken);
        localStorage.setItem("hrms_token", accessToken);
      } else {
        localStorage.setItem("rememberMe", "false");
        sessionStorage.setItem("token", accessToken);
        localStorage.setItem("hrms_token", accessToken);
      }

      localStorage.setItem("hrms_user", JSON.stringify(user));

      setAuth({
        user,
        accessToken,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      height: "56px",
      borderRadius: "10px",
      backgroundColor: "#FFFFFF",
      color: "#0F172A",

      "& fieldset": {
        borderColor: "#E2E8F0",
        borderWidth: "1px",
      },

      "&:hover fieldset": {
        borderColor: "#818CF8",
      },

      "&.Mui-focused fieldset": {
        borderColor: "#4F46E5",
        borderWidth: "1.5px",
      },
    },

    "& .MuiInputBase-input": {
      fontSize: "15px",
    },

    "& .MuiInputBase-input::placeholder": {
      color: "none",
      opacity: 1,
    },
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        background: "#F8FAFC",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        overflow: "hidden",
        p: 0,
      }}
    >
      {/* =====================================================
          MAIN CONTAINER
          DESKTOP = 65% IMAGE + 35% FORM
          MOBILE/TABLET = 100% FORM
      ====================================================== */}

      <Box
        sx={{
          width: "100%",
          height: "100vh",
          minHeight: "100vh",

          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr",
            md: "1fr",
            lg: "65% 35%",
          },

          background: "#FFFFFF",
          overflow: "hidden",
          borderRadius: 0,
          border: "none",
          boxShadow: "none",
        }}
      >
        {/* =====================================================
            LEFT IMAGE
            DESKTOP ONLY
        ====================================================== */}

        <Box
          sx={{
            display: {
              xs: "none",
              sm: "none",
              md: "none",
              lg: "block",
            },

            position: "relative",
            width: "100%",
            height: "100vh",
            overflow: "hidden",
            background: "#FFFFFF",
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

              // Keeps the complete HRMS design visually balanced
              objectPosition: "center center",
            }}
          />
        </Box>

        {/* =====================================================
            RIGHT LOGIN FORM
        ====================================================== */}

        <Box
          sx={{
            width: "100%",
            height: "100vh",
            minHeight: "100vh",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            px: {
              xs: 3,
              sm: 5,
              md: 8,
              lg: 5,
              xl: 6,
            },

            py: {
              xs: 4,
              sm: 5,
              md: 5,
              lg: 4,
            },

            background: "#FFFFFF",

            overflowY: "auto",
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%",

              maxWidth: {
                xs: "440px",
                sm: "480px",
                md: "500px",
                lg: "430px",
                xl: "470px",
              },

              mx: "auto",
            }}
          >
            {/* =================================================
                MOBILE / TABLET LOGO
            ================================================= */}

            <Box
              sx={{
                display: {
                  xs: "flex",
                  sm: "flex",
                  md: "flex",
                  lg: "none",
                },

                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",

                mb: {
                  xs: 4,
                  sm: 5,
                  md: 4,
                },
              }}
            >
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: "4px",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #4F46E5 100%)",

                  boxShadow:
                    "0 10px 15px -3px rgba(15,23,42,.10), 0 4px 6px -4px rgba(15,23,42,.06)",
                }}
              >
                <PeopleOutlineIcon
                  sx={{
                    fontSize: 36,
                    color: "#FFFFFF",
                  }}
                />
              </Box>

              <Typography
                sx={{
                  mt: 1.5,
                  fontSize: "25px",
                  fontWeight: 700,
                  color: "#0F172A",
                }}
              >
                HRMS
              </Typography>

              <Typography
                sx={{
                  mt: 0.3,
                  color: "#64748B",
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                Human Resource Management System
              </Typography>
            </Box>

            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <IconButton
              type="button"
              onClick={() => navigate("/")}
              sx={{
                mb: {
                  xs: 2,
                  sm: 2,
                  md: 2,
                  lg: 2,
                },

                color: "#64748B",
                borderRadius: "10px",

                "&:hover": {
                  background: "#F1F5F9",
                  color: "#4F46E5",
                },
              }}
            >
              <KeyboardBackspaceOutlinedIcon />
            </IconButton>

            {/* =================================================
                HEADER
            ================================================= */}

            <Box
              sx={{
                mb: {
                  xs: 3.5,
                  sm: 4,
                  md: 4,
                  lg: 3.5,
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: "30px",
                    sm: "34px",
                    md: "36px",
                    lg: "32px",
                    xl: "36px",
                  },

                  lineHeight: 1.2,
                  fontWeight: 700,
                  color: "#0F172A",
                  letterSpacing: "-0.4px",
                }}
              >
                Welcome Back!
              </Typography>

              <Typography
                sx={{
                  color: "#64748B",
                  fontSize: "15px",
                  mt: 1,
                }}
              >
                Sign in to your HRMS account
              </Typography>
            </Box>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: "10px",
                  background: "#FEE2E2",
                  color: "#EF4444",
                  border: "1px solid #FEE2E2",

                  "& .MuiAlert-icon": {
                    color: "#ef4444",
                  },
                }}
              >
                {error}
              </Alert>
            )}

            {/* =================================================
                EMAIL
            ================================================= */}

            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  color: "#1E293B",
                  fontSize: "14px",
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Email / Employee ID
              </Typography>

              <TextField
                fullWidth
                name="email"
                type="text"
                placeholder="Enter your email or employee ID"
                value={formData.email}
                onChange={handleChange}
                autoComplete="username"
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon
                        sx={{
                          color: "#64748B",
                          fontSize: 21,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  color: "#1E293B",
                  fontSize: "14px",
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Password
              </Typography>

              <TextField
                fullWidth
                name="password"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon
                        sx={{
                          color: "#64748B",
                          fontSize: 21,
                        }}
                      />
                    </InputAdornment>
                  ),

                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{
                          color: "#64748B",

                          "&:hover": {
                            color: "#4F46E5",
                            background: "#E0F2FE",
                          },
                        }}
                      >
                        {showPassword ? (
                          <VisibilityOffOutlinedIcon />
                        ) : (
                          <VisibilityOutlinedIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* =================================================
                REMEMBER + FORGOT
            ================================================= */}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",

                mb: 3.5,

                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    sx={{
                      p: 0.5,
                      mr: 0.5,
                      color: "none",

                      "&.Mui-checked": {
                        color: "#4F46E5",
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      color: "#475569",
                      fontSize: "14px",
                    }}
                  >
                    Remember me
                  </Typography>
                }
              />

              <Typography
                component={Link}
                to="/forgot-password"
                sx={{
                  color: "#4F46E5",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 600,

                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Forgot password?
              </Typography>
            </Box>

            {/* =================================================
                SIGN IN
            ================================================= */}

            <Button
              fullWidth
              type="submit"
              disabled={loading}
              endIcon={<ArrowForwardIcon />}
              sx={{
                height: "56px",
                borderRadius: "10px",

                background: "linear-gradient(90deg, #4f46e5 0%, #4F46E5 100%)",

                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: 600,
                textTransform: "none",

                boxShadow:
                  "0 4px 6px -1px rgba(15,23,42,.07), 0 2px 4px -2px rgba(15,23,42,.05)",

                transition: "all 0.2s ease",

                "&:hover": {
                  background: "#4338CA",

                  boxShadow:
                    "0 10px 15px -3px rgba(15,23,42,.10), 0 4px 6px -4px rgba(15,23,42,.06)",

                  transform: "translateY(-1px)",
                },

                "&.Mui-disabled": {
                  color: "#FFFFFF",
                  background: "none",
                },
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* =================================================
                DIVIDER
            ================================================= */}

            <Divider
              sx={{
                my: 3,
                color: "none",
                fontSize: "13px",

                "&::before, &::after": {
                  borderColor: "#E2E8F0",
                },
              }}
            >
              OR
            </Divider>

            {/* =================================================
                GOOGLE LOGIN
            ================================================= */}

            <Button
              fullWidth
              type="button"
              startIcon={<GoogleIconLogo />}
              onClick={() => {
                window.location.href = `${SOCKET_BASE_URL}/api/auth/google`;
              }}
              sx={{
                height: "54px",
                borderRadius: "10px",

                border: "1px solid #E2E8F0",

                color: "#334155",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 500,

                background: "#FFFFFF",

                "&:hover": {
                  background: "#F8FAFC",
                  borderColor: "#818CF8",
                },
              }}
            >
              Sign in with Google
            </Button>

            {/* =================================================
                CONTACT ADMIN
            ================================================= */}

            <Typography
              sx={{
                textAlign: "center",
                mt: 4,
                color: "#64748B",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              Don't have an account?{" "}
              <Box
                component="span"
                onClick={() => navigate("/register")}
                sx={{
                  color: "#4F46E5",
                  cursor: "pointer",
                  fontWeight: 600,

                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Contact HR Administrator
              </Box>
            </Typography>

            {/* =================================================
                SECURITY
            ================================================= */}

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 0.8,

                mt: 4,

                color: "none",

                textAlign: "center",
              }}
            >
              <SecurityOutlinedIcon
                sx={{
                  fontSize: 16,
                  color: "#64748B",
                  flexShrink: 0,
                }}
              />

              <Typography
                sx={{
                  fontSize: "12px",
                }}
              >
                Your data is protected with enterprise-grade security.
              </Typography>
            </Box>

            {/* =================================================
                COPYRIGHT
            ================================================= */}

            <Typography
              sx={{
                textAlign: "center",
                mt: 1.5,
                color: "none",
                fontSize: "12px",
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

export default Login;
