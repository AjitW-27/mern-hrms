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
import execReq from "../../lib/execReq";

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
      const response = await execReq.post("/departments", formData);
      const data = response.data;

      if (data?.success === false) {
        alert(data?.message || data?.error || "Unable to add department.");
        return;
      }

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
      color: "#0F172A",
      backgroundColor: "#FFFFFF",
      borderRadius: "4px",

      "& fieldset": {
        borderColor: "#E2E8F0",
      },

      "&:hover fieldset": {
        borderColor: "#CBD5E1",
      },

      "&.Mui-focused fieldset": {
        borderColor: "#8b5cf6",
        borderWidth: "2px",
      },
    },

    "& .MuiInputLabel-root": {
      color: "#64748B",
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: "#8b5cf6",
    },

    "& textarea": {
      color: "#0F172A",
    },
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        background: "#F8FAFC",
        minHeight: "100vh",
        color: "#0F172A",
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
              color: "#64748B",
              mr: 2,
              "&:hover": {
                background: "#F1F5F9",
                color: "#0F172A",
              },
            }}
            onClick={() => navigate("/dashboard/departments")}
          >
            <ArrowBackIcon />
          </IconButton>

          <Typography fontSize={24} fontWeight={600} color="#0F172A">
            Add Department
          </Typography>
        </Box>

        {/* Form Card */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: "4px",

            // Same soft gradient style as Department cards
            background: "linear-gradient(135deg,#F5F6FF,#E0E4FF)",

            border: "1px solid #E2E8F0",

            boxShadow: "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)",
          }}
        >
          <Typography fontSize={18} fontWeight={600} mb={3} color="#0F172A">
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
                borderColor: "#E2E8F0",
                background: "#FFFFFF",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "4px",
                px: 2.5,

                "&:hover": {
                  borderColor: "#CBD5E1",
                  background: "#F8FAFC",
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
                borderRadius: "4px",
                px: 2.5,
                boxShadow: "none",

                "&:hover": {
                  background: "#8B5CF6",
                  boxShadow: "0 4px 6px -1px rgba(15,23,42,.07), 0 2px 4px -2px rgba(15,23,42,.05)",
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
