import { Card, Skeleton } from "../../components/common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import React from "react";
import { Grid, CardContent, Typography, Box } from "@mui/material";
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
    ["totalEmployees", "Total Employees", PeopleOutline, "primary"],
    ["totalDepartments", "Departments", BusinessOutlined, "indigo"],
    ["activeProjects", "Active Projects", WorkOutline, "green"],
    [
      "totalPayroll",
      "Recorded Payroll",
      AccountBalanceWalletOutlined,
      "amber",
      (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`,
    ],
    ["todayPresent", "Present Today", CheckCircleOutline, "primary"],
    ["todayAbsent", "Absent Today", ScheduleOutlined, "rose"],
    ["pendingLeaves", "Pending Leaves", HourglassEmptyOutlined, "amber"],
    ["newJoineesThisMonth", "New Joinings", PersonAddOutlined, "indigo"],
  ],
  hr: [
    ["totalEmployees", "Total Employees", PeopleOutline, "primary"],
    ["totalDepartments", "Departments", BusinessOutlined, "indigo"],
    ["todayPresent", "Present Today", CheckCircleOutline, "primary"],
    ["pendingLeaves", "Pending Leaves", HourglassEmptyOutlined, "amber"],
    ["newJoineesThisMonth", "New Joinings", PersonAddOutlined, "indigo"],
    ["activeProjects", "Active Projects", WorkOutline, "green"],
  ],
  manager: [
    ["totalEmployees", "Team Members", PeopleOutline, "primary"],
    ["activeProjects", "Active Projects", WorkOutline, "green"],
    ["todayPresent", "Present Today", CheckCircleOutline, "primary"],
    ["pendingLeaves", "Pending Leaves", HourglassEmptyOutlined, "amber"],
  ],
  employee: [
    ["totalEmployees", "Total Employees", PeopleOutline, "primary"],
    ["totalDepartments", "Departments", BusinessOutlined, "indigo"],
    ["activeProjects", "Active Projects", WorkOutline, "green"],
    ["todayPresent", "Present Today", CheckCircleOutline, "primary"],
  ],
};
const gradients = {
  primary: "linear-gradient(135deg," + themeColors.primarySoft + "," + themeColors.primarySoft + ")",
  indigo: "linear-gradient(135deg," + themeColors.pageBg + "," + themeColors.infoSoft + ")",
  green: "linear-gradient(135deg," + themeColors.pageBg + "," + themeColors.successSoft + ")",
  amber: "linear-gradient(135deg," + themeColors.primarySoft + "," + themeColors.warningSoft + ")",
  rose: "linear-gradient(135deg," + themeColors.hover + "," + themeColors.dangerSoft + ")",
};
const KpiCard = ({ label, value, Icon, loading, tone, format }) => (
  <Card
    sx={{
      minHeight: 130,
      borderRadius: "4px",
      background: themeColors.cardBg,
      borderTop: "3px solid " + themeColors.primary,
      border: "1px solid " + themeColors.border,
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
                color: themeColors.textMuted,
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
                color: themeColors.navyDark,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {format ? format(value) : (value ?? "—")}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "4px",
              background: gradients[tone],
              display: "grid",
              placeItems: "center",
              color: themeColors.primary,
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
  const normalized = ["superadmin", "super_admin"].includes(role) ? "admin" : role;
  const items = (defs[normalized] || defs.employee).filter(([key]) => loading || Object.hasOwn(data || {}, key));
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
