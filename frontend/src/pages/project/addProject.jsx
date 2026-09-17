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
      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        alert(
          errorData?.error || `Error: ${response.status}`
        );

        return;
      }

      alert("Project added successfully!");
      navigate("/dashboard/projects");
    } catch (error) {
      console.error("Network or Server Error:", error);
      alert("Failed to connect to the server.");
    }
  };

  /* =========================
     INPUT STYLES
  ========================= */

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      color: "#0f172a",
      backgroundColor: "#ffffff",
      borderRadius: "8px",

      "& fieldset": {
        borderColor: "#e2e8f0",
      },

      "&:hover fieldset": {
        borderColor: "#cbd5e1",
      },

      "&.Mui-focused fieldset": {
        borderColor: "#8b5cf6",
        borderWidth: "2px",
      },

      "& input::placeholder": {
        color: "#94a3b8",
        opacity: 1,
      },

      "& textarea::placeholder": {
        color: "#94a3b8",
        opacity: 1,
      },
    },

    "& .MuiInputLabel-root": {
      color: "#64748b",
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: "#8b5cf6",
    },

    "& .MuiSelect-icon": {
      color: "#64748b",
    },

    "& input[type='date']::-webkit-calendar-picker-indicator": {
      opacity: 0.7,
    },
  };

  /* =========================
     DROPDOWN STYLES
  ========================= */

  const dropdownStyles = {
    PaperProps: {
      sx: {
        bgcolor: "#ffffff",
        color: "#0f172a",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",

        "& .MuiMenuItem-root": {
          fontSize: 14,
        },

        "& .MuiMenuItem-root:hover": {
          bgcolor: "#f8fafc",
        },

        "& .Mui-selected": {
          bgcolor: "#ede9fe !important",
          color: "#7c3aed",
        },
      },
    },
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        background: "#f8fafc",
        color: "#0f172a",
      }}
    >
      {/* =========================
          PAGE HEADER
      ========================= */}

      <Box
        display="flex"
        alignItems="center"
        mb={{
          xs: 3,
          md: 4,
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            color: "#475569",
            mr: 1.5,

            "&:hover": {
              backgroundColor: "#f1f5f9",
              color: "#0f172a",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Box>
          <Typography
            fontSize={{
              xs: 21,
              sm: 24,
            }}
            fontWeight={600}
            color="#0f172a"
          >
            Create New Project
          </Typography>

          <Typography
            fontSize={14}
            color="#64748b"
            mt={0.5}
          >
            Add project details, timeline and project information
          </Typography>
        </Box>
      </Box>

      {/* =========================
          FULL WIDTH FORM
      ========================= */}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",

          background: `
            radial-gradient(
              circle at 0% 0%,
              rgba(139, 92, 246, 0.10) 0%,
              transparent 45%
            ),
            linear-gradient(
              135deg,
              #ffffff 0%,
              #f8fafc 100%
            )
          `,

          border: "1px solid #e5e7eb",
          borderRadius: "8px",

          p: {
            xs: 2.5,
            sm: 3,
            md: 4,
          },

          boxShadow:
            "0 1px 3px rgba(15, 23, 42, 0.05)",
        }}
      >
        {/* =========================
            BASIC DETAILS
        ========================= */}

        <Typography
          fontSize={18}
          fontWeight={600}
          color="#0f172a"
          mb={3}
        >
          Basic Details
        </Typography>

        <Grid
          container
          spacing={3}
          mb={4}
        >
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

        {/* =========================
            TIMELINE & STATUS
        ========================= */}

        <Typography
          fontSize={18}
          fontWeight={600}
          color="#0f172a"
          mb={3}
        >
          Timeline & Status
        </Typography>

        <Grid
          container
          spacing={3}
          mb={4}
        >
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
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
              InputLabelProps={{
                shrink: true,
              }}
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
              SelectProps={{
                MenuProps: dropdownStyles,
              }}
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
              SelectProps={{
                MenuProps: dropdownStyles,
              }}
            >
              {[
                "Low",
                "Medium",
                "High",
                "Critical",
              ].map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* =========================
            METRICS & META
        ========================= */}

        <Typography
          fontSize={18}
          fontWeight={600}
          color="#0f172a"
          mb={3}
        >
          Metrics & Meta
        </Typography>

        <Grid
          container
          spacing={3}
          mb={4}
        >
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
                    <Typography color="#64748b">
                      $
                    </Typography>
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
              value={formData.progress}
              onChange={handleChange}
              InputProps={{
                inputProps: {
                  min: 0,
                  max: 100,
                },
              }}
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

        {/* =========================
            PROJECT DESCRIPTION
        ========================= */}

        <Typography
          fontSize={18}
          fontWeight={600}
          color="#0f172a"
          mb={3}
        >
          Project Description
        </Typography>

        <Grid
          container
          spacing={3}
        >
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={5}
              label="Project Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              sx={inputStyles}
            />
          </Grid>
        </Grid>

        {/* =========================
            ACTION BUTTONS
        ========================= */}

        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={2}
          mt={5}
          pt={3}
          borderTop="1px solid #e5e7eb"
          sx={{
            "@media (max-width: 500px)": {
              flexDirection: "column-reverse",
              alignItems: "stretch",

              "& button": {
                width: "100%",
              },
            },
          }}
        >
          <Button
            variant="outlined"
            onClick={() =>
              navigate("/dashboard/projects")
            }
            sx={{
              height: 44,
              px: 3,

              color: "#475569",
              borderColor: "#e2e8f0",
              background: "#ffffff",

              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",

              "&:hover": {
                borderColor: "#cbd5e1",
                backgroundColor: "#f8fafc",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={<AddTaskIcon />}
            sx={{
              height: 44,
              px: 3,

              background: "#8b5cf6",

              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",

              boxShadow: "none",

              "&:hover": {
                background: "#7c3aed",
                boxShadow:
                  "0 6px 16px rgba(139, 92, 246, 0.18)",
              },
            }}
          >
            Create Project
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddProject;