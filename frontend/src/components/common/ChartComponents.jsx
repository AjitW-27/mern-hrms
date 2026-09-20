import React from "react";
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

const CARD_GRADIENTS = {
  blue: "linear-gradient(135deg,#F0F9FF,#D6EEFC)",
  teal: "linear-gradient(135deg,#F0FBFC,#D5F1F4)",
  indigo: "linear-gradient(135deg,#F5F6FF,#E0E4FF)",
  amber: "linear-gradient(135deg,#FFFBEB,#FDEBC0)",
  violet: "linear-gradient(135deg,#F5F6FF,#E0E4FF)",
  emerald: "linear-gradient(135deg,#F0FDF7,#D1F5E4)",
  sky: "linear-gradient(135deg,#F0F9FF,#D6EEFC)",
  rose: "linear-gradient(135deg,#FFF5F6,#FFE0E4)",
};

export const ChartCard = ({ children, minHeight = 340, tone = "blue" }) => (
  <Box
    sx={{
      p: 2.5,
      height: "100%",
      minHeight,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      bgcolor: "#FFFFFF",
      background: CARD_GRADIENTS[tone] || CARD_GRADIENTS.blue,
      border: "1px solid #E2E8F0",
      borderRadius: 1,
      boxShadow: "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)",
      transition: "180ms ease",
      "&:hover": {
        transform: "translateY(-2px)",
        borderColor: "#8DD8DE",
        boxShadow:
          "0 4px 6px -1px rgba(15,23,42,.07), 0 2px 4px -2px rgba(15,23,42,.05), 0 4px 24px -6px rgba(14,143,154,.35)",
      },
    }}
  >
    {children}
  </Box>
);
export const ChartHeading = ({ title, subtitle }) => (
  <Box mb={2}>
    <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}>
      {title}
    </Typography>
    {subtitle ? (
      <Typography sx={{ mt: 0.25, fontSize: 13, color: "#64748B" }}>
        {subtitle}
      </Typography>
    ) : null}
  </Box>
);
export const ChartTooltip = ({ active, payload, label, valueSuffix = "" }) =>
  !active || !payload?.length ? null : (
    <Box
      sx={{
        bgcolor: "#0F172A",
        color: "#FFFFFF",
        borderRadius: 1,
        p: 1.25,
        minWidth: 132,
        boxShadow:
          "0 10px 15px -3px rgba(15,23,42,.10), 0 4px 6px -4px rgba(15,23,42,.06)",
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
          <Typography sx={{ fontSize: 12, color: "#FFFFFF" }}>
            {entry.name}
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF" }}>
            {entry.value}
            {valueSuffix}
          </Typography>
        </Box>
      ))}
    </Box>
  );
