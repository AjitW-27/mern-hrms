import React from "react";
import { Avatar, Box, Chip, Typography } from "@mui/material";

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
        border: "1px solid #E2E8F0",
        borderRadius: 1,
        p: 2,
        bgcolor: "#FFFFFF",
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar
          src={employee.avatar}
          sx={{
            width: 48,
            height: 48,
            bgcolor: "#0E8F9A",
            background: "linear-gradient(135deg,#26A8B3,#4F46E5)",
            color: "#FFFFFF",
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
              color: "#1E293B",
            }}
            noWrap
          >
            {name}
          </Typography>
          <Typography
            sx={{ fontSize: 13, lineHeight: "20px", color: "#475569" }}
            noWrap
          >
            {role}
          </Typography>
        </Box>
      </Box>
      <Chip
        label={department}
        size="small"
        sx={{ mt: 2, bgcolor: "#E6F7F8", color: "#0A5C67", height: 26 }}
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
