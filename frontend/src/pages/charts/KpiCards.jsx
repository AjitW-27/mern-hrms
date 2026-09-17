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
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  PersonAdd as PersonAddIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

const CARD_DEFS = {
  admin: [
    {
      key: "totalEmployees",
      label: "Total Employees",
      icon: PeopleIcon,
      gradient:
        "radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.16), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
      format: (v) => v,
    },
    {
      key: "totalDepartments",
      label: "Departments",
      icon: BusinessIcon,
      gradient:
        "radial-gradient(circle at 100% 0%, rgba(56, 189, 248, 0.16), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f7fbff 100%)",
      format: (v) => v,
    },
    {
      key: "activeProjects",
      label: "Active Projects",
      icon: WorkIcon,
      gradient:
        "radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.14), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f7fffb 100%)",
      format: (v) => v,
    },
    {
      key: "totalPayroll",
      label: "Monthly Payroll",
      icon: WalletIcon,
      gradient:
        "radial-gradient(circle at 100% 100%, rgba(245, 158, 11, 0.14), transparent 55%), linear-gradient(135deg, #ffffff 0%, #fffdf7 100%)",
      format: (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`,
    },
    {
      key: "todayPresent",
      label: "Present Today",
      icon: CheckIcon,
      gradient:
        "radial-gradient(circle at 0% 0%, rgba(20, 184, 166, 0.14), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f7fffd 100%)",
      format: (v) => v,
    },
    {
      key: "todayAbsent",
      label: "Absent Today",
      icon: ScheduleIcon,
      gradient:
        "radial-gradient(circle at 100% 0%, rgba(239, 68, 68, 0.10), transparent 55%), linear-gradient(135deg, #ffffff 0%, #fffafa 100%)",
      format: (v) => v,
    },
    {
      key: "pendingLeaves",
      label: "Pending Leaves",
      icon: PendingIcon,
      gradient:
        "radial-gradient(circle at 0% 100%, rgba(245, 158, 11, 0.12), transparent 55%), linear-gradient(135deg, #ffffff 0%, #fffdf7 100%)",
      format: (v) => v,
    },
    {
      key: "newJoineesThisMonth",
      label: "New Joinings",
      icon: PersonAddIcon,
      gradient:
        "radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.13), transparent 55%), linear-gradient(135deg, #ffffff 0%, #faf7ff 100%)",
      format: (v) => v,
    },
  ],

  hr: [
    {
      key: "totalEmployees",
      label: "Total Employees",
      icon: PeopleIcon,
      gradient:
        "radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.16), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
      format: (v) => v,
    },
    {
      key: "totalDepartments",
      label: "Departments",
      icon: BusinessIcon,
      gradient:
        "radial-gradient(circle at 100% 0%, rgba(56, 189, 248, 0.16), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f7fbff 100%)",
      format: (v) => v,
    },
    {
      key: "todayPresent",
      label: "Present Today",
      icon: CheckIcon,
      gradient:
        "radial-gradient(circle at 0% 0%, rgba(20, 184, 166, 0.14), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f7fffd 100%)",
      format: (v) => v,
    },
    {
      key: "pendingLeaves",
      label: "Pending Leaves",
      icon: PendingIcon,
      gradient:
        "radial-gradient(circle at 0% 100%, rgba(245, 158, 11, 0.12), transparent 55%), linear-gradient(135deg, #ffffff 0%, #fffdf7 100%)",
      format: (v) => v,
    },
    {
      key: "newJoineesThisMonth",
      label: "New Joinings",
      icon: PersonAddIcon,
      gradient:
        "radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.13), transparent 55%), linear-gradient(135deg, #ffffff 0%, #faf7ff 100%)",
      format: (v) => v,
    },
    {
      key: "activeProjects",
      label: "Active Projects",
      icon: WorkIcon,
      gradient:
        "radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.14), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f7fffb 100%)",
      format: (v) => v,
    },
  ],

  manager: [
    {
      key: "totalEmployees",
      label: "Team Members",
      icon: PeopleIcon,
      gradient:
        "radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.16), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
      format: (v) => v,
    },
    {
      key: "activeProjects",
      label: "Active Projects",
      icon: WorkIcon,
      gradient:
        "radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.14), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f7fffb 100%)",
      format: (v) => v,
    },
    {
      key: "todayPresent",
      label: "Present Today",
      icon: CheckIcon,
      gradient:
        "radial-gradient(circle at 0% 0%, rgba(20, 184, 166, 0.14), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f7fffd 100%)",
      format: (v) => v,
    },
    {
      key: "pendingLeaves",
      label: "Pending Leaves",
      icon: PendingIcon,
      gradient:
        "radial-gradient(circle at 0% 100%, rgba(245, 158, 11, 0.12), transparent 55%), linear-gradient(135deg, #ffffff 0%, #fffdf7 100%)",
      format: (v) => v,
    },
  ],

  employee: [
    {
      key: "totalEmployees",
      label: "Total Employees",
      icon: PeopleIcon,
      gradient:
        "radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.16), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
      format: (v) => v,
    },
    {
      key: "totalDepartments",
      label: "Departments",
      icon: BusinessIcon,
      gradient:
        "radial-gradient(circle at 100% 0%, rgba(56, 189, 248, 0.16), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f7fbff 100%)",
      format: (v) => v,
    },
    {
      key: "activeProjects",
      label: "Active Projects",
      icon: WorkIcon,
      gradient:
        "radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.14), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f7fffb 100%)",
      format: (v) => v,
    },
    {
      key: "todayPresent",
      label: "Present Today",
      icon: CheckIcon,
      gradient:
        "radial-gradient(circle at 0% 0%, rgba(20, 184, 166, 0.14), transparent 55%), linear-gradient(135deg, #ffffff 0%, #f7fffd 100%)",
      format: (v) => v,
    },
  ],
};

const KpiCard = ({ label, value, icon: Icon, loading, gradient }) => (
  <Card
    sx={{
      borderRadius: "8px",
      minHeight: 130,
      background: gradient || "#ffffff",
      border: "1px solid",
      borderColor: "#e5e7eb",
      boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",

      transition: "transform 0.25s ease, box-shadow 0.25s ease",

      "&:hover": {
        transform: "translateY(-6px) scale(1.015)",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.10)",
      },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      {loading ? (
        <>
          <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={80} height={40} />
        </>
      ) : (
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography
              fontSize={14}
              color="text.secondary"
              fontWeight={500}
              mb={1}
            >
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={600} color="text.primary">
              {value ?? "—"}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 1,
              background: "primary.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ color: "primary.main", fontSize: 28 }} />
          </Box>
        </Box>
      )}
    </CardContent>
  </Card>
);

const KpiCards = ({ data, loading, role }) => {
  const cards = CARD_DEFS[role] || CARD_DEFS.employee;

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.key}>
          <KpiCard
            label={card.label}
            value={loading ? null : card.format(data?.[card.key] ?? 0)}
            icon={card.icon}
            gradient={card.gradient}
            loading={loading}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default KpiCards;
