import React from "react";
import {
  Box,
  IconButton,
  InputBase,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import Profile from "../../pages/auth/profile";
import NotificationDropdown from "./notificationDropdown";
const Appbar = ({ open, setOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        height: 70,
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(90deg, #0f172a, #1e293b)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* LEFT */}
      <Box display="flex" alignItems="center" gap={2}>
        <IconButton
          onClick={() => setOpen(!open)}
          sx={{ color: "#fff", ml: -2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            px: 2,
            py: 0.5,
            borderRadius: "10px",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <SearchIcon sx={{ color: "#9ca3af", mr: 1 }} />
          <InputBase placeholder="Search here..." sx={{ color: "#fff" }} />
        </Box>
      </Box>

      {/* RIGHT */}
      <Box display="flex" alignItems="center" gap={isMobile ? 1 : 3}>
        
       
        <NotificationDropdown/>

        <Box display="flex" alignItems="center" gap={1}>
          <Profile/>
        </Box>
      </Box>
    </Box>
  );
};

export default Appbar;
