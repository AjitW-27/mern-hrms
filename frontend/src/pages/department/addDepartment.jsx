import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AddDepartment = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    head: "",
    description: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        alert(
          errorData?.error ||
            `Error: ${response.status} ${response.statusText}`,
        );

        return;
      }

      await response.json();

      alert("Department added successfully!");
      navigate("/dashboard/departments");
    } catch (error) {
      console.error("Network or Server Error:", error);
      alert("Failed to connect to the server.");
    }
  };

  // Light theme input styles
  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      color: "#0f172a",
      backgroundColor: "#ffffff",
      borderRadius: "8px",

      "& fieldset": {
        borderColor: "#e5e7eb",
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

    "& textarea": {
      color: "#0f172a",
    },
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        background: "#f8fafc",
        minHeight: "100vh",
        color: "#0f172a",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 800,
        }}
      >
        {/* Header */}
        <Box display="flex" alignItems="center" mb={4}>
          <IconButton
            sx={{
              color: "#64748b",
              mr: 2,
              "&:hover": {
                background: "#f1f5f9",
                color: "#0f172a",
              },
            }}
            onClick={() => navigate("/dashboard/departments")}
          >
            <ArrowBackIcon />
          </IconButton>

          <Typography fontSize={24} fontWeight={600} color="#0f172a">
            Add Department
          </Typography>
        </Box>

        {/* Form Card */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: "8px",

            // Same soft gradient style as Department cards
            background: `
              radial-gradient(
                circle at 0% 0%,
                rgba(139, 92, 246, 0.12) 0%,
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
          }}
        >
          <Typography fontSize={18} fontWeight={600} mb={3} color="#0f172a">
            Department Details
          </Typography>

          <Grid container spacing={3}>
            {/* Department Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                sx={inputStyles}
              />
            </Grid>

            {/* Head of Department */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Head of Department"
                name="head"
                value={formData.head}
                onChange={handleChange}
                sx={inputStyles}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                sx={inputStyles}
              />
            </Grid>
          </Grid>

          {/* Buttons */}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={5}>
            <Button
              variant="outlined"
              onClick={() => navigate("/dashboard/departments")}
              sx={{
                color: "#475569",
                borderColor: "#e5e7eb",
                background: "#ffffff",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2.5,

                "&:hover": {
                  borderColor: "#cbd5e1",
                  background: "#f8fafc",
                },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              type="submit"
              startIcon={<SaveIcon />}
              sx={{
                background: "#8b5cf6",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2.5,
                boxShadow: "none",

                "&:hover": {
                  background: "#7c3aed",
                  boxShadow: "0 6px 16px rgba(139, 92, 246, 0.20)",
                },
              }}
            >
              Save Department
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddDepartment;
