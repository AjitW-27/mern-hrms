import { branding } from "../../config/branding";
import { Input as TextField, Button, IconButton } from "../../components/common/UI";
import { colors as themeColors } from "../../theme/designTokens";
// src/pages/auth/Login.jsx

import React, { useEffect, useState } from "react";
import { Box, Typography, Divider, InputAdornment, FormControlLabel, Checkbox, Alert } from "@mui/material";

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
import execReq from "../../lib/execReq";
import { loadGoogleIdentityServices } from "../../lib/googleLogin";
import useAuthStore from "../../strore/authStore";
import LoginImage from "../../assets/loginImg.png"; // Import the image
// Google Icon
const GoogleIconLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill={themeColors.info}
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill={themeColors.success}
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill={themeColors.warning}
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill={themeColors.primary}
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
  const [googleConfig, setGoogleConfig] = useState(null), [googleBusy, setGoogleBusy] = useState(false);
  useEffect(() => { let alive = true; execReq("/auth/google/config").then(async ({ data }) => { if (data.configured) await loadGoogleIdentityServices(); if (alive) setGoogleConfig(data); }).catch(error => { if (alive) setGoogleConfig({ configured: false, message: error.message || "Google sign-in could not load. Please retry." }); }); return () => { alive = false; }; }, []);

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

    // Employee IDs are valid login identifiers too. Only validate email syntax
    // when the supplied identifier is an email address.
    if (formData.email.includes("@") && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    return true;
  };

  const completeSignIn = payload => {
      const accessToken = payload.accessToken || payload.token;
      const user = payload.user;

      if (!accessToken || !user) {
        throw new Error("Login response is missing token or user details.");
      }

      const storage = formData.rememberMe ? localStorage : sessionStorage;
      const otherStorage = formData.rememberMe ? sessionStorage : localStorage;
      ["token", "hrms_token", "refreshToken", "hrms_refresh_token"].forEach((key) => {
        otherStorage.removeItem(key);
      });
      storage.setItem("token", accessToken);
      storage.setItem("hrms_token", accessToken);
      if (payload.refreshToken) {
        storage.setItem("refreshToken", payload.refreshToken);
        storage.setItem("hrms_refresh_token", payload.refreshToken);
      }
      localStorage.setItem("rememberMe", String(formData.rememberMe));
      localStorage.setItem("hrms_user", JSON.stringify(user));

      setAuth({
        user,
        accessToken,
      });

      navigate("/dashboard");
  };

  const handleGoogleLogin = () => {
    setError("");
    if (!googleConfig?.configured || !window.google?.accounts?.oauth2) { setError(googleConfig?.message || "Google sign-in is still loading. Please try again."); return; }
    setGoogleBusy(true);
    try { window.google.accounts.oauth2.initCodeClient({ client_id: googleConfig.clientId, scope: "openid email profile", ux_mode: "popup", callback: async response => {
      try { if (response.error || !response.code) throw new Error("Google sign-in was cancelled or denied. Please try again."); const result = await execReq.post("/auth/google", { code: response.code }, { headers: { "X-Requested-With": "XMLHttpRequest" } }); completeSignIn(result.data?.data || result.data); }
      catch (error) { setError(error?.response?.data?.message || error.message || "Google sign-in failed. Please try again."); } finally { setGoogleBusy(false); }
    }, error_callback: error => { setGoogleBusy(false); setError(error.type === "popup_closed" ? "Google sign-in was cancelled. Please try again." : "The Google sign-in popup could not open. Allow popups for HRMS and retry."); } }).requestCode(); }
    catch { setGoogleBusy(false); setError("Google sign-in could not start. Please reload and retry."); }
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

      completeSignIn(payload);
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
      borderRadius: "4px",
      backgroundColor: themeColors.cardBg,
      color: themeColors.navyDark,

      "& fieldset": {
        borderColor: themeColors.border,
        borderWidth: "1px",
      },

      "&:hover fieldset": {
        borderColor: themeColors.textLight,
      },

      "&.Mui-focused fieldset": {
        borderColor: themeColors.info,
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
        background: themeColors.hover,
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

          background: themeColors.cardBg,
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
            background: themeColors.cardBg,
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

            background: themeColors.cardBg,

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
                    "linear-gradient(135deg, " + themeColors.info + " 0%, " + themeColors.info + " 100%)",

                  boxShadow:
                    "0 10px 15px -3px " + themeColors.overlay5 + ", 0 4px 6px -4px " + themeColors.overlay1,
                }}
              >
                <img src={branding.logoUrl} alt={branding.appName} width={58} height={58} style={{ borderRadius: "4px" }} />
              </Box>

              <Typography
                sx={{
                  mt: 1.5,
                  fontSize: "25px",
                  fontWeight: 700,
                  color: themeColors.navyDark,
                }}
              >{branding.appName}</Typography>

              <Typography
                sx={{
                  mt: 0.3,
                  color: themeColors.textMuted,
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

                color: themeColors.textMuted,
                borderRadius: "4px",

                "&:hover": {
                  background: themeColors.tableHeader,
                  color: themeColors.info,
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
                  color: themeColors.navyDark,
                  letterSpacing: "-0.4px",
                }}
              >
                Welcome Back!
              </Typography>

              <Typography
                sx={{
                  color: themeColors.textMuted,
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
                  borderRadius: "4px",
                  background: themeColors.dangerSoft,
                  color: themeColors.primary,
                  border: "1px solid " + themeColors.dangerSoft,

                  "& .MuiAlert-icon": {
                    color: themeColors.primary,
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
                  color: themeColors.textPrimary,
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
                          color: themeColors.textMuted,
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
                  color: themeColors.textPrimary,
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
                          color: themeColors.textMuted,
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
                          color: themeColors.textMuted,

                          "&:hover": {
                            color: themeColors.info,
                            background: themeColors.infoSoft,
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
                        color: themeColors.info,
                      },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      color: themeColors.textMuted,
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
                  color: themeColors.primary,
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
              variant="primary"
              style={{ color: themeColors.cardBg }}
              disabled={loading || googleBusy}
              endIcon={<ArrowForwardIcon />}
              sx={{
                height: "56px",
                borderRadius: "4px",

                background: "linear-gradient(90deg, " + themeColors.info + " 0%, " + themeColors.info + " 100%)",

                color: themeColors.cardBg,
                fontSize: "16px",
                fontWeight: 600,
                textTransform: "none",

                boxShadow:
                  "0 4px 6px -1px " + themeColors.overlay3 + ", 0 2px 4px -2px " + themeColors.overlay2,

                transition: "all 0.2s ease",

                "&:hover": {
                  background: themeColors.info,

                  boxShadow:
                    "0 10px 15px -3px " + themeColors.overlay5 + ", 0 4px 6px -4px " + themeColors.overlay1,

                  transform: "translateY(-1px)",
                },

                "&.Mui-disabled": {
                  color: themeColors.cardBg,
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
                  borderColor: themeColors.border,
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
              variant="outline"
              style={{ color: themeColors.textPrimary, borderColor: themeColors.border }}
              loading={googleBusy}
              disabled={loading || !googleConfig}
              onClick={handleGoogleLogin}
              sx={{
                height: "54px",
                borderRadius: "4px",

                border: "1px solid " + themeColors.border,

                color: themeColors.secondaryDark,
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 500,

                background: themeColors.cardBg,

                "&:hover": {
                  background: themeColors.hover,
                  borderColor: themeColors.textLight,
                },
              }}
            >
              {googleBusy ? "Signing in..." : "Sign in with Google"}
            </Button>

            {/* =================================================
                CONTACT ADMIN
            ================================================= */}

            <Typography
              sx={{
                textAlign: "center",
                mt: 4,
                color: themeColors.textMuted,
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              Don't have an account?{" "}
              <Box
                component="span"
                onClick={() => navigate("/register")}
                sx={{
                  color: themeColors.primary,
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
                  color: themeColors.textMuted,
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


          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
