import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const useChartTheme = () => {
  const theme = useTheme();
  const tokens = theme.hrms;
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
    radius: tokens.radius,
  };
};

export const ChartCard = ({ children, minHeight = 320 }) => (
  <Box
    sx={{
      p: 2.5,
      height: "100%",
      minHeight,
      bgcolor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: "8px",
      boxShadow: "none",
    }}
  >
    {children}
  </Box>
);

export const ChartHeading = ({ title, subtitle }) => (
  <Box mb={2}>
    <Typography sx={{ fontSize: 16, fontWeight: 600, color: "text.primary" }}>
      {title}
    </Typography>
    {subtitle ? (
      <Typography sx={{ mt: 0.25, fontSize: 12, color: "text.secondary" }}>
        {subtitle}
      </Typography>
    ) : null}
  </Box>
);

export const ChartTooltip = ({ active, payload, label, valueSuffix = "" }) => {
  const chart = useChartTheme();
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "8px",
        p: 1.25,
        minWidth: 132,
      }}
    >
      {label ? (
        <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
          {label}
        </Typography>
      ) : null}
      {payload.map((entry) => (
        <Box
          key={entry.name}
          sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
        >
          <Typography
            sx={{ fontSize: 12, color: entry.color || "text.secondary" }}
          >
            {entry.name}
          </Typography>
          <Typography
            sx={{ fontSize: 12, fontWeight: 600, color: "text.primary" }}
          >
            {entry.value}
            {valueSuffix}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
