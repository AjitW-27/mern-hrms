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
      color: "#fff",
      backgroundColor: "#1e293b",
      borderRadius: "8px",
      "& fieldset": { borderColor: "#334155" },
    },
    "& .MuiInputLabel-root": { color: "#94a3b8" },
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: "#0f172a",
        minHeight: "100vh",
        color: "#fff",
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
              background: "#131826",
              p: 4,
              borderRadius: "16px",
              border: "1px solid #1e293b",
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
                    "&:hover": { background: "#7c3aed" },
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
              background: "#131826",
              p: 4,
              borderRadius: "16px",
              border: "1px solid #1e293b",
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
                <Typography fontSize={13} color="#94a3b8">
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
            <Divider sx={{ borderColor: "#1e293b", my: 2 }} />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography fontWeight="bold">Payroll Alerts</Typography>
                <Typography fontSize={13} color="#94a3b8">
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
