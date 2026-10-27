import { Avatar } from "../../components/common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import execReq from "../../lib/execReq";
import useAuthStore from "../../strore/authStore";

const Profile = () => {
  // Select state individually to prevent unnecessary React re-renders
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout); // Optional: useful for error handling

  useEffect(() => {
    // Rely on the token from Zustand state rather than querying localStorage directly
    if (token && !user) {
      execReq("/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          setAuth({
            user: res.data.user,
            token: token,
          });
        })
        .catch((err) => {
          console.error("Failed to fetch profile:", err);
          // Optional: If it's a 401 Unauthorized, the token might be expired.
          // if (err.response?.status === 401) logout();
        });
    }
  }, [user, token, setAuth]);

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Avatar />
      <Box>
        <Typography sx={{ color: themeColors.cardBg, fontSize: 14 }}>
          {user?.name || "Loading..."}
        </Typography>
        <Typography sx={{ color: "none", fontSize: 12 }}>
          {user?.role || "User"}
        </Typography>
      </Box>
    </Box>
  );
};

export default Profile;
