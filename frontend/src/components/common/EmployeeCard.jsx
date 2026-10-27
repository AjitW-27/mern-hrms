import { Avatar, Badge as Chip } from "./UI";
import { colors as themeColors } from "../../theme/designTokens";
import React from "react";
import { Box, Typography } from "@mui/material";

const EmployeeCard = ({ employee, onClick }) => {
  const name = employee.fullName || employee.name || "Employee";
  const role =
    employee.designation || employee.role?.name || employee.role || "Employee";
  const department =
    employee.department?.name || employee.department || "Unassigned";
  const id = employee.employeeId || employee.code || "—";
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        textAlign: "left",
        border: "1px solid " + themeColors.border,
        borderRadius: "4px",
        p: 2,
        bgcolor: themeColors.cardBg,
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar
          src={employee.avatar}
          sx={{
            width: 48,
            height: 48,
            bgcolor: themeColors.primary,
            background: "linear-gradient(135deg," + themeColors.info + "," + themeColors.info + ")",
            color: themeColors.cardBg,
            fontWeight: 700,
          }}
        >
          {name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 16,
              lineHeight: "24px",
              fontWeight: 600,
              color: themeColors.textPrimary,
            }}
            noWrap
          >
            {name}
          </Typography>
          <Typography
            sx={{ fontSize: 13, lineHeight: "20px", color: themeColors.textMuted }}
            noWrap
          >
            {role}
          </Typography>
        </Box>
      </Box>
      <Chip
        label={department}
        size="small"
        sx={{ mt: 2, bgcolor: themeColors.primarySoft, color: themeColors.secondaryDark, height: 26 }}
      />
      <Typography
        sx={{ mt: 1.5, fontSize: 12, lineHeight: "16px", color: "none" }}
      >
        ID {id}
      </Typography>
    </Box>
  );
};
export default EmployeeCard;
