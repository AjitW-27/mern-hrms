import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  Divider,
} from "@mui/material";

const Settings = () => {
  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      color: "#FFFFFF",
      backgroundColor: "#1E293B",
      borderRadius: "4px",
      "& fieldset": { borderColor: "#334155" },
    },
    "& .MuiInputLabel-root": { color: "none" },
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: "#0F172A",
        minHeight: "100vh",
        color: "#FFFFFF",
      }}
    >
      <Typography fontSize={24} fontWeight="bold" mb={4}>
        System Settings
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              background: "#0F172A",
              p: 4,
              borderRadius: "4px",
              border: "1px solid #1E293B",
            }}
          >
            <Typography fontSize={18} fontWeight="bold" mb={3}>
              Company Profile
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  defaultValue="Acme Corp"
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Support Email"
                  defaultValue="admin@acme.com"
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  sx={{
                    background: "#8b5cf6",
                    textTransform: "none",
                    "&:hover": { background: "#8B5CF6" },
                  }}
                >
                  Save Profile
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              background: "#0F172A",
              p: 4,
              borderRadius: "4px",
              border: "1px solid #1E293B",
            }}
          >
            <Typography fontSize={18} fontWeight="bold" mb={3}>
              Preferences
            </Typography>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Box>
                <Typography fontWeight="bold">Email Notifications</Typography>
                <Typography fontSize={13} color="none">
                  Receive alerts for new messages
                </Typography>
              </Box>
              <Switch
                defaultChecked
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#8b5cf6" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#8b5cf6",
                  },
                }}
              />
            </Box>
            <Divider sx={{ borderColor: "#1E293B", my: 2 }} />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography fontWeight="bold">Payroll Alerts</Typography>
                <Typography fontSize={13} color="none">
                  Notify employees on payroll run
                </Typography>
              </Box>
              <Switch
                defaultChecked
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#8b5cf6" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#8b5cf6",
                  },
                }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Settings;
