import { Input as TextField, Button, IconButton } from "../../components/common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import React, { useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
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
    },

    "& .MuiInputLabel-root": {
      color: themeColors.textMuted,
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: themeColors.purple,
    },

    "& textarea": {
      color: themeColors.navyDark,
    },
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        background: themeColors.hover,
        minHeight: "100vh",
        color: themeColors.navyDark,
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
              color: themeColors.textMuted,
              mr: 2,
              "&:hover": {
                background: themeColors.tableHeader,
                color: themeColors.navyDark,
              },
            }}
            onClick={() => navigate("/dashboard/departments")}
          >
            <ArrowBackIcon />
          </IconButton>


        </Box>

        {/* Form Card */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: "4px",

            // Same soft gradient style as Department cards
            background: "linear-gradient(135deg," + themeColors.pageBg + "," + themeColors.infoSoft + ")",

            border: "1px solid " + themeColors.border,

            boxShadow: "0 1px 2px " + themeColors.overlay1 + ", 0 1px 3px " + themeColors.overlay2,
          }}
        >
          <Typography fontSize={18} fontWeight={600} mb={3} color={themeColors.navyDark}>
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
                color: themeColors.textMuted,
                borderColor: themeColors.border,
                background: themeColors.cardBg,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "4px",
                px: 2.5,

                "&:hover": {
                  borderColor: themeColors.border,
                  background: themeColors.hover,
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
                background: themeColors.purple,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "4px",
                px: 2.5,
                boxShadow: "none",

                "&:hover": {
                  background: themeColors.purple,
                  boxShadow: "0 4px 6px -1px " + themeColors.overlay3 + ", 0 2px 4px -2px " + themeColors.overlay2,
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
