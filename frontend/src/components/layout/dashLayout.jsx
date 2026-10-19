import React, { useState } from "react";
import { Box, CssBaseline, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import Appbar from "./appbar";
import Sidebar from "./sidebar";
import SessionManager from "../../strore/sessionManager";
import PageSetup from "../common/PageSetup";

const SIDEBAR_COLLAPSED_WIDTH = 70;

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const temporaryDrawer = isMobile || !canHover;

  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: "background.default",
        height: "100vh", // CHANGED: Strictly lock outer viewport to 100vh
        width: "100vw",
        overflow: "hidden", // CHANGED: Prevents whole page from scrolling
      }}
    >
      <CssBaseline />

      <SessionManager />

      <Sidebar
        open={open}
        variant={temporaryDrawer ? "temporary" : "permanent"}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
      />

      {/* Main Content Area (Appbar + Body) */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          width: `calc(100% - ${temporaryDrawer ? 0 : SIDEBAR_COLLAPSED_WIDTH}px)`,
          marginLeft: temporaryDrawer ? 0 : `${SIDEBAR_COLLAPSED_WIDTH}px`,
          display: "flex",
          flexDirection: "column",
          height: "100vh", // CHANGED: Locks right side to 100vh
          overflow: "hidden", // CHANGED: Appbar stays completely fixed
        }}
      >
        {/* Top Appbar Wrapper - Fixed at top, will never scroll */}
        <Box
          sx={{
            flexShrink: 0, // CHANGED: Prevents Appbar from collapsing/shrinking
            position: "relative",
            zIndex: 1100,
            width: "100%",
          }}
        >
          <Appbar
            open={open}
            setOpen={setOpen}
            temporaryDrawer={temporaryDrawer}
          />
        </Box>

        {/* Scrollable Main Content - ONLY THIS SCROLLS */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            p: 2,
            width: "100%",
            overflowX: "hidden",
            overflowY: "auto", // CHANGED: Vertical scrollbar starts BELOW the Appbar
            boxSizing: "border-box",
            /* Custom sleek scrollbar below appbar */
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#CBD5E1",
              borderRadius: "4px",
            },
          }}
        >
          <PageSetup>
            <Outlet />
          </PageSetup>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
