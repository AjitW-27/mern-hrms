import React from "react";
import { Box, Typography } from "@mui/material";
const ModuleCard = ({
  icon: Icon,
  title,
  category,
  description,
  onClick,
  gradient = "linear-gradient(135deg,#F5F6FF,#E0E4FF)",
  tone = "#4F46E5",
}) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    sx={{
      minHeight: 182,
      p: 2,
      textAlign: "left",
      border: "1px solid #E2E8F0",
      borderRadius: 1,
      bgcolor: "#FFFFFF",
      background: gradient,
      boxShadow: "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)",
      cursor: "pointer",
      transition: "180ms ease",
      "&:hover": {
        transform: "translateY(-2px)",
        borderColor: "#8DD8DE",
        boxShadow:
          "0 4px 6px -1px rgba(15,23,42,.07), 0 2px 4px -2px rgba(15,23,42,.05), 0 4px 24px -6px rgba(14,143,154,.35)",
      },
    }}
  >
    <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          bgcolor: "#FFFFFF",
          display: "grid",
          placeItems: "center",
          color: tone,
        }}
      >
        {Icon && <Icon sx={{ fontSize: 20 }} />}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1E293B" }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: tone }}>
          {category}
        </Typography>
      </Box>
    </Box>
    <Typography
      sx={{ fontSize: 13, lineHeight: "20px", color: "#475569", mt: 2 }}
    >
      {description}
    </Typography>
    <Typography
      sx={{
        fontSize: 12,
        fontWeight: 600,
        color: tone,
        mt: 2,
        textTransform: "uppercase",
      }}
    >
      Manage →
    </Typography>
  </Box>
);
export default ModuleCard;
