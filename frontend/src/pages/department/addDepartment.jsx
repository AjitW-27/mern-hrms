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

      // Safely handle errors if the backend doesn't return JSON
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        alert(
          errorData?.error ||
            `Error: ${response.status} ${response.statusText}`,
        );
        return;
      }

      const data = await response.json();
      alert("Department added successfully!");
      navigate("/dashboard/departments");
    } catch (error) {
      console.error("Network or Server Error:", error);
      alert("Failed to connect to the server.");
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
      <Box sx={{ width: "100%", maxWidth: 800 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <IconButton
            sx={{ color: "#94a3b8", mr: 2 }}
            onClick={() => navigate("/dashboard/departments")}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography fontSize={24} fontWeight="bold">
            Add Department
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            background: "#131826",
            p: { xs: 3, md: 4 },
            borderRadius: "16px",
            border: "1px solid #1e293b",
          }}
        >
          <Typography fontSize={18} fontWeight="bold" mb={3} color="#e2e8f0">
            Department Details
          </Typography>
          <Grid container spacing={3}>
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
          <Box display="flex" justifyContent="flex-end" gap={2} mt={5}>
            <Button
              variant="outlined"
              onClick={() => navigate("/dashboard/departments")}
              sx={{
                color: "#94a3b8",
                borderColor: "#334155",
                textTransform: "none",
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
                "&:hover": { background: "#7c3aed" },
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
