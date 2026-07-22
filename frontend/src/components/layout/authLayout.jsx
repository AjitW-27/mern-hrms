import React from "react";
import { Box, Grid, Typography, Stack } from "@mui/material";

// Named Imports for Icons
import {
  Business as BusinessIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  CalendarToday as CalendarTodayIcon,
  VerifiedUserOutlined as VerifiedUserOutlinedIcon,
} from "@mui/icons-material";

const AuthLayout = ({ children }) => {
  return (
    <Grid
      container
      sx={{
        height: "100vh",
        width: "100vw",
        backgroundImage: "url('/loginBg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden", // Extra scroll hide
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
         // background:
        //    "linear-gradient(to right, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.6) 50%, rgba(15,23,42,0.2) 100%)",
          zIndex: 1,
        },
      }}
    >
      {/* LEFT SIDE: Text Content */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          px: { md: 8, lg: 12 },
          color: "#fff",
          position: "relative",
          zIndex: 2,
          perspective: "1200px", // Enables 3D Space
        }}
      >
        {/* 🔥 Apply 3D tilt to left text (Left edge utha hua) */}
        <Box
          sx={{
            transform: "rotateY(35deg) rotateX(2deg)",
            transformStyle: "preserve-3d",
            mt: 9, 
            // mr:15,
            ml:2
          }}
        >
          <Box display="flex" alignItems="center" mb={6}>
            {/* <BusinessIcon sx={{ fontSize: 40, mr: 1, color: "#d1d5db" }} /> */}
            {/* <Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ letterSpacing: 1, lineHeight: 1 }}
              >
                HRMS
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#9ca3af", letterSpacing: 1 }}
              >
                HUMAN RESOURCE MANAGEMENT SYSTEM
              </Typography>
            </Box> */}
          </Box>

          <Typography
            variant="h3"
            fontWeight="500"
            mb={2}
            sx={{ lineHeight: 1.2 }}
          >
            Empowering People,
            <br />
            Building <span style={{ color: "#a78bfa" }}>Better Workplaces</span>
          </Typography>

          <Typography
            variant="body1"
            sx={{ opacity: 0.8, mb: 6, maxWidth: 450, fontSize: "1.1rem" }}
          >
            A complete HRMS solution to manage your workforce, simplify
            processes and drive organizational success.
          </Typography>

          <Stack direction="row" spacing={5} mb={8}>
            <Stack alignItems="center" spacing={1}>
              <GroupsOutlinedIcon sx={{ color: "#a78bfa", fontSize: 32 }} />
              <Typography
                variant="body2"
                textAlign="center"
                sx={{ opacity: 0.8, lineHeight: 1.2 }}
              >
                Employee
                <br />
                Management
              </Typography>
            </Stack>
            <Stack alignItems="center" spacing={1}>
              <CalendarTodayIcon sx={{ color: "#a78bfa", fontSize: 28 }} />
              <Typography
                variant="body2"
                textAlign="center"
                sx={{ opacity: 0.8, lineHeight: 1.2 }}
              >
                Attendance
                <br />
                Tracking
              </Typography>
            </Stack>
            <Stack alignItems="center" spacing={1}>
              <VerifiedUserOutlinedIcon
                sx={{ color: "#a78bfa", fontSize: 32 }}
              />
              <Typography
                variant="body2"
                textAlign="center"
                sx={{ opacity: 0.8, lineHeight: 1.2 }}
              >
                Secure &<br />
                Reliable
              </Typography>
            </Stack>
          </Stack>

          <Box sx={{ borderLeft: "3px solid #818cf8", pl: 2, maxWidth: 350 }}>
            <Typography
              variant="body2"
              sx={{ fontStyle: "italic", opacity: 0.9,mt:-2 }}
            >
              "Great companies are built by amazing teams."
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* RIGHT SIDE: Auth Form */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          justifyContent: { xs: "center", md: "flex-end" },
          alignItems: "center",
          position: "relative",
          zIndex: 2,
          pr: { md: 15, lg: 20 },
          perspective: "1200px", // Enables 3D Space for children
        }}
      >
        {children}
      </Grid>
    </Grid>
  );
};

export default AuthLayout;
