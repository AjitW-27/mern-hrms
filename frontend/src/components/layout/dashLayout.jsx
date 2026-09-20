import React, { useState } from "react";
import { Box, CssBaseline, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Appbar from "./appbar";
// import Sidebar from "./sidebar";
import { Outlet } from "react-router-dom";
import SessionManager from "../../strore/sessionManager";
import PageSetup from "../common/PageSetup";
import Sidebar from "./sidebar";

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
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
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

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          width: `calc(100% - ${temporaryDrawer ? 0 : SIDEBAR_COLLAPSED_WIDTH}px)`,
          marginLeft: temporaryDrawer ? 0 : `${SIDEBAR_COLLAPSED_WIDTH}px`,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Box
          sx={{
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

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            p:2,
            width: "100%",
            overflowX: "hidden",
            overflowY: "auto",
            boxSizing: "border-box",
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