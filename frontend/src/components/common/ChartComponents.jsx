import { colors as themeColors } from "../../theme/designTokens";
import React from "react";
import { Card } from "./UI";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const useChartTheme = () => {
  const tokens = useTheme().hrms;
  return {
    primary: tokens.chartPrimary,
    secondary: tokens.chartSecondary,
    success: tokens.chartTertiary,
    warning: tokens.warning,
    error: tokens.error,
    text: tokens.text,
    muted: tokens.mutedText,
    border: tokens.border,
    grid: tokens.chartGrid,
    surface: tokens.surface,
    hover: tokens.hover,
    radius: tokens.cardRadius,
  };
};

export const ChartCard = ({ children, minHeight = 340, tone = "primary" }) => (
  <Card
    sx={{
      p: 2.5,
      height: "100%",
      minHeight,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      bgcolor: themeColors.cardBg,
      background: themeColors.cardBg,
      borderTop: tone === "primary" ? "3px solid " + themeColors.primary : "3px solid " + themeColors.border,
      border: "1px solid " + themeColors.border,
      borderRadius: "4px",
      boxShadow: "0 1px 2px " + themeColors.overlay1 + ", 0 1px 3px " + themeColors.overlay2,
      transition: "180ms ease",
      "&:hover": {
        transform: "translateY(-2px)",
        borderColor: themeColors.textLight,
        boxShadow:
          "0 4px 6px -1px " + themeColors.overlay3 + ", 0 2px 4px -2px " + themeColors.overlay2 + ", 0 4px 24px -6px " + themeColors.overlay4,
      },
    }}
  >
    {children}
  </Card>
);
export const ChartHeading = ({ title, subtitle }) => (
  <Box mb={2}>
    <Typography sx={{ fontSize: 16, fontWeight: 600, color: themeColors.navyDark }}>
      {title}
    </Typography>
    {subtitle ? (
      <Typography sx={{ mt: 0.25, fontSize: 13, color: themeColors.textMuted }}>
        {subtitle}
      </Typography>
    ) : null}
  </Box>
);
export const ChartTooltip = ({ active, payload, label, valueSuffix = "" }) =>
  !active || !payload?.length ? null : (
    <Box
      sx={{
        bgcolor: themeColors.navyDark,
        color: themeColors.cardBg,
        borderRadius: "4px",
        p: 1.25,
        minWidth: 132,
        boxShadow:
          "0 10px 15px -3px " + themeColors.overlay5 + ", 0 4px 6px -4px " + themeColors.overlay1,
      }}
    >
      {label ? (
        <Typography sx={{ fontSize: 12, color: "none", mb: 0.5 }}>
          {label}
        </Typography>
      ) : null}
      {payload.map((entry) => (
        <Box
          key={entry.name}
          sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
        >
          <Typography sx={{ fontSize: 12, color: themeColors.cardBg }}>
            {entry.name}
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: themeColors.cardBg }}>
            {entry.value}
            {valueSuffix}
          </Typography>
        </Box>
      ))}
    </Box>
  );
