import { colors as themeColors } from "../../theme/designTokens";
import React from "react";
import { Box, Typography } from "@mui/material";
const ModuleCard = ({
  icon: Icon,
  title,
  category,
  description,
  onClick,
  tone = themeColors.info,
}) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    sx={{
      minHeight: 182,
      p: 2,
      textAlign: "left",
      border: "1px solid " + themeColors.border,
      borderRadius: "4px",
      bgcolor: themeColors.cardBg,
      background: themeColors.cardBg,
      boxShadow: "0 1px 2px " + themeColors.overlay1 + ", 0 1px 3px " + themeColors.overlay2,
      cursor: "pointer",
      transition: "180ms ease",
      "&:hover": {
        transform: "translateY(-2px)",
        borderColor: themeColors.textLight,
        boxShadow:
          "0 4px 6px -1px " + themeColors.overlay3 + ", 0 2px 4px -2px " + themeColors.overlay2 + ", 0 4px 24px -6px " + themeColors.overlay4,
      },
    }}
  >
    <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "4px",
          bgcolor: themeColors.cardBg,
          display: "grid",
          placeItems: "center",
          color: tone,
        }}
      >
        {Icon && <Icon sx={{ fontSize: 20 }} />}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: themeColors.textPrimary }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: tone }}>
          {category}
        </Typography>
      </Box>
    </Box>
    <Typography
      sx={{ fontSize: 13, lineHeight: "20px", color: themeColors.textMuted, mt: 2 }}
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
