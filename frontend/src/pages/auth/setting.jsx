import { Input as TextField, Button } from "../../components/common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import React from "react";
import { Box, Typography, Grid, Switch, Divider } from "@mui/material";

const Settings = () => {
  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      color: themeColors.cardBg,
      backgroundColor: themeColors.textPrimary,
      borderRadius: "4px",
      "& fieldset": { borderColor: themeColors.secondaryDark },
    },
    "& .MuiInputLabel-root": { color: "none" },
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: themeColors.navyDark,
        minHeight: "100vh",
        color: themeColors.cardBg,
      }}
    >


      <Grid container spacing={4}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              background: themeColors.navyDark,
              p: 4,
              borderRadius: "4px",
              border: "1px solid " + themeColors.textPrimary,
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
                    background: themeColors.purple,
                    textTransform: "none",
                    "&:hover": { background: themeColors.purple },
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
              background: themeColors.navyDark,
              p: 4,
              borderRadius: "4px",
              border: "1px solid " + themeColors.textPrimary,
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
                  "& .MuiSwitch-switchBase.Mui-checked": { color: themeColors.purple },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: themeColors.purple,
                  },
                }}
              />
            </Box>
            <Divider sx={{ borderColor: themeColors.textPrimary, my: 2 }} />
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
                  "& .MuiSwitch-switchBase.Mui-checked": { color: themeColors.purple },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: themeColors.purple,
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
