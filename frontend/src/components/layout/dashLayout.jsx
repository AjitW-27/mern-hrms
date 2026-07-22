import React, { useState } from "react";
import { Box, CssBaseline, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Appbar from "./appbar";
import Sidebar from "./sidebar";
import { Outlet } from "react-router-dom";
import SessionManager from "../../strore/sessionManager";

const DashboardLayout = () => {
  const [open, setOpen] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth >= 900,
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: "#020617",
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",

        /* Firefox */
        scrollbarWidth: "2px",
        scrollbarColor: "#022447 transparent",

        /* Chrome, Edge */
        "&::-webkit-scrollbar": {
          width: "2px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#021e3966",
          borderRadius: "2px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#1565c0",
        },
      }}
    >
      <CssBaseline />

      <SessionManager />

      <Sidebar
        open={open}
        variant={isMobile ? "temporary" : "permanent"}
        onClose={() => setOpen(false)}
      />

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ zIndex: 1100 }}>
          <Appbar open={open} setOpen={setOpen} />
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1, sm: 1.5 },
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
