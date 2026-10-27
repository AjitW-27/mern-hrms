import React, { useCallback, useState } from "react";
import { Box, CssBaseline, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import Sidebar from "./sidebar";
import SessionManager from "../../strore/sessionManager";
import AiAssistant from "../ai/AiAssistant";
import { branding } from "../../config/branding";
import { colors } from "../../theme/designTokens";
export default function DashboardLayout() {
  const mobile = useMediaQuery("(max-width:767px)");
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  return <Box sx={{ height: "100dvh", width: "100%", overflow: "hidden", bgcolor: colors.pageBg }}><CssBaseline /><SessionManager /><Sidebar mobileOpen={mobileOpen} onMobileClose={closeMobile} /><Box sx={{ ml: mobile ? 0 : "72px", height: "100%", minWidth: 0, display: "flex", flexDirection: "column" }}><AppHeader onMobileOpen={() => setMobileOpen(true)} /><Box component="main" sx={{ flex: 1, minHeight: 0, minWidth: 0, overflowY: "auto", overflowX: "clip", display: "flex", flexDirection: "column", p: { xs: 1.5, md: 2.5 } }}><Box data-ui="page-content" sx={{ minHeight: "auto", minWidth: 0, flex: "1 0 auto", display: "flex", flexDirection: "column" }}><Outlet /></Box><Box component="footer" sx={{ pt: 1.5, fontSize: 12, color: colors.textMuted }}>{branding.footer || branding.appName}</Box></Box><AiAssistant /></Box></Box>;
}
