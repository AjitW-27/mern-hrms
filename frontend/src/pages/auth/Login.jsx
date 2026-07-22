// src/pages/auth/Login.jsx
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
  Login as LoginIcon,
  KeyboardBackspaceOutlined as KeyboardBackspaceOutlinedIcon,
} from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../strore/authStore";

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
    if (error) setError("");
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
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      // ✅ Backend sends "accessToken" (not "token")
      const payload = response.data?.data || response.data;
      const accessToken = payload.accessToken || payload.token;
      const user = payload.user;

      if (!accessToken || !user) {
        throw new Error("Login response is missing token or user details.");
      }

      // Save token based on rememberMe
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

      // ✅ Store in Zustand - pass accessToken so setAuth picks it up
      setAuth({ user, accessToken });

      // Set default axios header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

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
  };

  return (
    <AuthLayout>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 440,
          minHeight: 690,
          height:690,
         // height: "auto",
          transform: "rotateY(-18deg) rotateX(2deg)",
          transformStyle: "preserve-3d",
          transition: "transform 0.3s ease",
          "&:hover": { transform: "rotateY(-8deg) rotateX(1deg)" },
          p: { xs: 4, md: 5 },
          borderRadius: "28px",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          borderTop: "1.5px solid rgba(255, 255, 255, 0.6)",
          borderLeft: "1.5px solid rgba(255, 255, 255, 0.6)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.4)",
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
        >
          <IconButton
            onClick={() => navigate("/")}
            sx={{ position: "absolute", top: 20, left: 20, color: "#fff" }}
          >
            <KeyboardBackspaceOutlinedIcon />
          </IconButton>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 2,
              border: "1px solid rgba(255, 255, 255, 0.4)",
            }}
          >
            <LoginIcon sx={{ color: "#fff", fontSize: 28 }} />
          </Box>
          <Typography
            variant="h4"
            fontWeight="500"
            mb={1}
            sx={{ letterSpacing: 0.5 }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ color: "#e5e7eb", opacity: 0.8 }}>
            Sign in to your account
          </Typography>
        </Box>

        {/* Error Alert */}
        <Box
          sx={{
            minHeight: 15,
            mt: 1,
             mb: 1.5,
          }}
        >
          {error && (
            <Alert
              severity="error"
              sx={{
                borderRadius: "12px",
                bgcolor: "rgba(244,67,54,0.12)",
                color: "#ff6b6b",
                "& .MuiAlert-icon": {
                  color: "#ff6b6b",
                },
              }}
            >
              {error}
            </Alert>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            mt: 3,
          }}
        >
          {/* Email */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, display: "block", color: "#e5e7eb", ml: 0.5 }}
            >
              Email Address
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon sx={{ color: "#d1d5db", fontSize: 22 }} />
                  </InputAdornment>
                ),
              }}
              sx={inputStyles}
            />
          </Box>

          {/* Password */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, display: "block", color: "#e5e7eb", ml: 0.5 }}
            >
              Password
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#d1d5db", fontSize: 22 }} />
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

          {/* Remember Me + Forgot Password */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: -0.5,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  sx={{
                    color: "rgba(255,255,255,0.6)",
                    "&.Mui-checked": { color: "#8b5cf6" },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "#e5e7eb" }}>
                  Remember me
                </Typography>
              }
            />
            <Typography
              component={Link}
              to="/forgot-password"
              variant="body2"
              sx={{
                color: "#8b5cf6",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
                cursor: "pointer",
              }}
            >
              Forgot password?
            </Typography>
          </Box>
        </Box>

        {/* Sign In Button */}

        <Button
          fullWidth
          type="submit"
          endIcon={<ArrowForwardIcon />}
          disabled={loading}
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
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        <Divider
          sx={{
            mt: 1.5,
            "&::before, &::after": { borderColor: "rgba(255, 255, 255, 0.2)" },
            color: "#d1d5db",
            fontSize: "0.9rem",
            flexShrink: 0,
          }}
        >
          or
        </Divider>
        <Box sx={{ mt: "auto", }}>
          <Button
            fullWidth
            startIcon={<GoogleIconLogo />}
            sx={{
              height: "54px",
              mt: 1,
              borderRadius: "14px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "#fff",
              textTransform: "none",
              fontSize: "1rem",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.6)",
              },
              flexShrink: 0,
            }}
            onClick={() => {
              window.location.href = "http://localhost:5000/api/auth/google";
            }}
          >
            Sign in with Google
          </Button>

          <Box textAlign="center">
            <Typography variant="body1" sx={{ color: "#d1d5db" }}>
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                style={{
                  color: "#8b5cf6",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Sign up
              </span>
            </Typography>
          </Box>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Login;
