import React from "react";
import { AppBar, Avatar, Box, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "../../context/AuthContext";

const Topbar = ({ open, setOpen }) => {
  const { user, logout } = useAuth();

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#0b1220", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
      <Toolbar sx={{ minHeight: 78, px: 3, display: "flex", justifyContent: "space-between" }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => setOpen(!open)} sx={{ color: "#fff" }}>
            <MenuRoundedIcon />
          </IconButton>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
              Enterprise HRMS
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,.6)">
              {user?.role?.name || user?.role || "guest"}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton sx={{ color: "#fff" }}>
            <NotificationsRoundedIcon />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1.2}>
            <Avatar sx={{ width: 38, height: 38 }}>{user?.name?.[0] || "A"}</Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {user?.name || "Admin"}
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,.65)">
                {user?.email || ""}
              </Typography>
            </Box>
            <IconButton onClick={logout} sx={{ color: "#fff" }}>
              <LogoutRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
