import { Input as TextField, Button, IconButton } from "../../components/common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import React, { useState } from "react";
import { Box, Typography, Grid, MenuItem, InputAdornment } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AddTask as AddTaskIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import execReq from "../../lib/execReq";

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
      const response = await execReq.post("/projects", formattedData);
      const data = response.data;

      if (data?.success === false) {
        alert(data?.message || data?.error || "Unable to add project.");
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
      color: themeColors.navyDark,
      backgroundColor: themeColors.cardBg,
      borderRadius: "4px",

      "& fieldset": {
        borderColor: themeColors.border,
      },

      "&:hover fieldset": {
        borderColor: themeColors.border,
      },

      "&.Mui-focused fieldset": {
        borderColor: themeColors.purple,
        borderWidth: "2px",
      },

      "& input::placeholder": {
        color: "none",
        opacity: 1,
      },

      "& textarea::placeholder": {
        color: "none",
        opacity: 1,
      },
    },

    "& .MuiInputLabel-root": {
      color: themeColors.textMuted,
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: themeColors.purple,
    },

    "& .MuiSelect-icon": {
      color: themeColors.textMuted,
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
        bgcolor: themeColors.cardBg,
        color: themeColors.navyDark,
        border: "1px solid " + themeColors.border,
        borderRadius: "4px",
        boxShadow:
          "0 10px 15px -3px " + themeColors.overlay5 + ", 0 4px 6px -4px " + themeColors.overlay1,

        "& .MuiMenuItem-root": {
          fontSize: 14,
        },

        "& .MuiMenuItem-root:hover": {
          bgcolor: themeColors.hover,
        },

        "& .Mui-selected": {
          bgcolor: themeColors.infoSoft + " !important",
          color: themeColors.purple,
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
        background: themeColors.hover,
        color: themeColors.navyDark,
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
            color: themeColors.textMuted,
            mr: 1.5,

            "&:hover": {
              backgroundColor: themeColors.tableHeader,
              color: themeColors.navyDark,
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Box>


          <Typography fontSize={14} color={themeColors.textMuted} mt={0.5}>
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

          background: "linear-gradient(135deg," + themeColors.pageBg + "," + themeColors.infoSoft + ")",

          border: "1px solid " + themeColors.border,
          borderRadius: "4px",

          p: {
            xs: 2.5,
            sm: 3,
            md: 4,
          },

          boxShadow:
            "0 1px 2px " + themeColors.overlay1 + ", 0 1px 3px " + themeColors.overlay2,
        }}
      >
        {/* =========================
            BASIC DETAILS
        ========================= */}

        <Typography fontSize={18} fontWeight={600} color={themeColors.navyDark} mb={3}>
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

        {/* =========================
            TIMELINE & STATUS
        ========================= */}

        <Typography fontSize={18} fontWeight={600} color={themeColors.navyDark} mb={3}>
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
              {["Low", "Medium", "High", "Critical"].map((p) => (
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

        <Typography fontSize={18} fontWeight={600} color={themeColors.navyDark} mb={3}>
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
                    <Typography color={themeColors.textMuted}>$</Typography>
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

        <Typography fontSize={18} fontWeight={600} color={themeColors.navyDark} mb={3}>
          Project Description
        </Typography>

        <Grid container spacing={3}>
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
          borderTop={"1px solid " + themeColors.border}
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
            onClick={() => navigate("/dashboard/projects")}
            sx={{
              height: 44,
              px: 3,

              color: themeColors.textMuted,
              borderColor: themeColors.border,
              background: themeColors.cardBg,

              textTransform: "none",
              fontWeight: 600,
              borderRadius: "4px",

              "&:hover": {
                borderColor: themeColors.border,
                backgroundColor: themeColors.hover,
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

              background: themeColors.purple,

              textTransform: "none",
              fontWeight: 600,
              borderRadius: "4px",

              boxShadow: "none",

              "&:hover": {
                background: themeColors.purple,
                boxShadow:
                  "0 4px 6px -1px " + themeColors.overlay3 + ", 0 2px 4px -2px " + themeColors.overlay2,
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
