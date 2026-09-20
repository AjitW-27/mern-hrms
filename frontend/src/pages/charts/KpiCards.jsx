import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";
import {
  PeopleOutline,
  BusinessOutlined,
  WorkOutline,
  AccountBalanceWalletOutlined,
  CheckCircleOutline,
  HourglassEmptyOutlined,
  PersonAddOutlined,
  ScheduleOutlined,
} from "@mui/icons-material";

const defs = {
  admin: [
    ["totalEmployees", "Total Employees", PeopleOutline, "teal"],
    ["totalDepartments", "Departments", BusinessOutlined, "indigo"],
    ["activeProjects", "Active Projects", WorkOutline, "green"],
    [
      "totalPayroll",
      "Monthly Payroll",
      AccountBalanceWalletOutlined,
      "amber",
      (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`,
    ],
    ["todayPresent", "Present Today", CheckCircleOutline, "teal"],
    ["todayAbsent", "Absent Today", ScheduleOutlined, "rose"],
    ["pendingLeaves", "Pending Leaves", HourglassEmptyOutlined, "amber"],
    ["newJoineesThisMonth", "New Joinings", PersonAddOutlined, "indigo"],
  ],
  hr: [
    ["totalEmployees", "Total Employees", PeopleOutline, "teal"],
    ["totalDepartments", "Departments", BusinessOutlined, "indigo"],
    ["todayPresent", "Present Today", CheckCircleOutline, "teal"],
    ["pendingLeaves", "Pending Leaves", HourglassEmptyOutlined, "amber"],
    ["newJoineesThisMonth", "New Joinings", PersonAddOutlined, "indigo"],
    ["activeProjects", "Active Projects", WorkOutline, "green"],
  ],
  manager: [
    ["totalEmployees", "Team Members", PeopleOutline, "teal"],
    ["activeProjects", "Active Projects", WorkOutline, "green"],
    ["todayPresent", "Present Today", CheckCircleOutline, "teal"],
    ["pendingLeaves", "Pending Leaves", HourglassEmptyOutlined, "amber"],
  ],
  employee: [
    ["totalEmployees", "Total Employees", PeopleOutline, "teal"],
    ["totalDepartments", "Departments", BusinessOutlined, "indigo"],
    ["activeProjects", "Active Projects", WorkOutline, "green"],
    ["todayPresent", "Present Today", CheckCircleOutline, "teal"],
  ],
};
const gradients = {
  teal: "linear-gradient(135deg,#F0FBFC,#D5F1F4)",
  indigo: "linear-gradient(135deg,#F5F6FF,#E0E4FF)",
  green: "linear-gradient(135deg,#F0FDF7,#D1F5E4)",
  amber: "linear-gradient(135deg,#FFFBEB,#FDEBC0)",
  rose: "linear-gradient(135deg,#FFF5F6,#FFE0E4)",
};
const KpiCard = ({ label, value, Icon, loading, tone, format }) => (
  <Card
    sx={{
      minHeight: 130,
      borderRadius: 1,
      background: gradients[tone],
      border: "1px solid #E2E8F0",
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
    <CardContent sx={{ p: 2.5 }}>
      {loading ? (
        <>
          <Skeleton variant="text" width={120} height={18} />
          <Skeleton variant="text" width={70} height={38} />
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                lineHeight: "16px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                color: "#64748B",
              }}
            >
              {label}
            </Typography>
            <Typography
              sx={{
                mt: 0.5,
                fontSize: 28,
                lineHeight: "32px",
                fontWeight: 700,
                color: "#0F172A",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {format ? format(value) : (value ?? 0)}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 1,
              bgcolor: "#FFFFFF",
              display: "grid",
              placeItems: "center",
              color: "#0E8F9A",
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Box>
        </Box>
      )}
    </CardContent>
  </Card>
);
export default function KpiCards({
  data = {},
  loading = false,
  role = "employee",
}) {
  const items = defs[String(role).toLowerCase()] || defs.employee;
  return (
    <Grid container spacing={2}>
      {items.map(([key, label, Icon, tone, format]) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
          <KpiCard
            label={label}
            value={data?.[key]}
            Icon={Icon}
            tone={tone}
            format={format}
            loading={loading}
          />
        </Grid>
      ))}
    </Grid>
  );
}
