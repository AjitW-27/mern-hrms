import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AddTask as AddTaskIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AddProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    startDate: "",
    deadline: "",
    status: "Not Started",
    priority: "Medium",
    budget: "",
    progress: 0,
    tags: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Format tags from comma-separated string to an array
    const formattedData = {
      ...formData,
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      budget: Number(formData.budget) || 0,
      progress: Number(formData.progress) || 0,
    };

    try {
      const response = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.error || `Error: ${response.status}`);
        return;
      }

      alert("Project added successfully!");
      navigate("/dashboard/projects");
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
    },
    "& .MuiInputLabel-root": { color: "#94a3b8" },
    "& input[type='date']::-webkit-calendar-picker-indicator": {
      filter: "invert(1)",
    },
  };

  const dropdownStyles = {
    PaperProps: { sx: { bgcolor: "#1e293b", color: "#fff" } },
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
      <Box sx={{ width: "100%", maxWidth: 900 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <IconButton
            sx={{ color: "#94a3b8", mr: 2 }}
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography fontSize={26} fontWeight="bold">
            Create New Project
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
          <Typography variant="h6" color="#8b5cf6" mb={3}>
            Basic Details
          </Typography>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client / Sponsor"
                name="client"
                value={formData.client}
                onChange={handleChange}
                sx={inputStyles}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" color="#8b5cf6" mb={3}>
            Timeline & Status
          </Typography>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="date"
                label="Deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                sx={inputStyles}
                SelectProps={{ MenuProps: dropdownStyles }}
              >
                {[
                  "Not Started",
                  "In Progress",
                  "Delayed",
                  "On Hold",
                  "Completed",
                  "Cancelled",
                ].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                sx={inputStyles}
                SelectProps={{ MenuProps: dropdownStyles }}
              >
                {["Low", "Medium", "High", "Critical"].map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Typography variant="h6" color="#8b5cf6" mb={3}>
            Metrics & Meta
          </Typography>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography color="#94a3b8">$</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Initial Progress (%)"
                name="progress"
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                value={formData.progress}
                onChange={handleChange}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tags (comma separated)"
                name="tags"
                placeholder="e.g. Frontend, React, MVP"
                value={formData.tags}
                onChange={handleChange}
                sx={inputStyles}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Project Description"
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
              onClick={() => navigate("/dashboard/projects")}
              sx={{
                color: "#94a3b8",
                borderColor: "#334155",
                textTransform: "none",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddTaskIcon />}
              sx={{
                background: "#8b5cf6",
                textTransform: "none",
                "&:hover": { background: "#7c3aed" },
              }}
            >
              Create Project
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddProject;
