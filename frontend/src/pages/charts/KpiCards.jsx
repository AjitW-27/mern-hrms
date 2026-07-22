import React from "react";
import { Grid, Card, CardContent, Typography, Box, Skeleton } from "@mui/material";
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
    { key: "totalEmployees", label: "Total Employees", icon: PeopleIcon, gradient: "linear-gradient(135deg, #7c3aed, #6366f1)", format: (v) => v },
    { key: "totalDepartments", label: "Departments", icon: BusinessIcon, gradient: "linear-gradient(135deg, #0ea5e9, #06b6d4)", format: (v) => v },
    { key: "activeProjects", label: "Active Projects", icon: WorkIcon, gradient: "linear-gradient(135deg, #10b981, #22c55e)", format: (v) => v },
    { key: "totalPayroll", label: "Monthly Payroll", icon: WalletIcon, gradient: "linear-gradient(135deg, #f59e0b, #f97316)", format: (v) => `₹${Number(v || 0).toLocaleString("en-IN")}` },
    { key: "todayPresent", label: "Present Today", icon: CheckIcon, gradient: "linear-gradient(135deg, #059669, #10b981)", format: (v) => v },
    { key: "todayAbsent", label: "Absent Today", icon: ScheduleIcon, gradient: "linear-gradient(135deg, #dc2626, #ef4444)", format: (v) => v },
    { key: "pendingLeaves", label: "Pending Leaves", icon: PendingIcon, gradient: "linear-gradient(135deg, #d97706, #f59e0b)", format: (v) => v },
    { key: "newJoineesThisMonth", label: "New Joinings", icon: PersonAddIcon, gradient: "linear-gradient(135deg, #7c3aed, #a855f7)", format: (v) => v },
  ],
  hr: [
    { key: "totalEmployees", label: "Total Employees", icon: PeopleIcon, gradient: "linear-gradient(135deg, #7c3aed, #6366f1)", format: (v) => v },
    { key: "totalDepartments", label: "Departments", icon: BusinessIcon, gradient: "linear-gradient(135deg, #0ea5e9, #06b6d4)", format: (v) => v },
    { key: "todayPresent", label: "Present Today", icon: CheckIcon, gradient: "linear-gradient(135deg, #059669, #10b981)", format: (v) => v },
    { key: "pendingLeaves", label: "Pending Leaves", icon: PendingIcon, gradient: "linear-gradient(135deg, #d97706, #f59e0b)", format: (v) => v },
    { key: "newJoineesThisMonth", label: "New Joinings", icon: PersonAddIcon, gradient: "linear-gradient(135deg, #7c3aed, #a855f7)", format: (v) => v },
    { key: "activeProjects", label: "Active Projects", icon: WorkIcon, gradient: "linear-gradient(135deg, #10b981, #22c55e)", format: (v) => v },
  ],
  manager: [
    { key: "totalEmployees", label: "Team Members", icon: PeopleIcon, gradient: "linear-gradient(135deg, #7c3aed, #6366f1)", format: (v) => v },
    { key: "activeProjects", label: "Active Projects", icon: WorkIcon, gradient: "linear-gradient(135deg, #10b981, #22c55e)", format: (v) => v },
    { key: "todayPresent", label: "Present Today", icon: CheckIcon, gradient: "linear-gradient(135deg, #059669, #10b981)", format: (v) => v },
    { key: "pendingLeaves", label: "Pending Leaves", icon: PendingIcon, gradient: "linear-gradient(135deg, #d97706, #f59e0b)", format: (v) => v },
  ],
  employee: [
    { key: "totalEmployees", label: "Total Employees", icon: PeopleIcon, gradient: "linear-gradient(135deg, #7c3aed, #6366f1)", format: (v) => v },
    { key: "totalDepartments", label: "Departments", icon: BusinessIcon, gradient: "linear-gradient(135deg, #0ea5e9, #06b6d4)", format: (v) => v },
    { key: "activeProjects", label: "Active Projects", icon: WorkIcon, gradient: "linear-gradient(135deg, #10b981, #22c55e)", format: (v) => v },
    { key: "todayPresent", label: "Present Today", icon: CheckIcon, gradient: "linear-gradient(135deg, #059669, #10b981)", format: (v) => v },
  ],
};

const KpiCard = ({ label, value, icon: Icon, gradient, loading }) => (
  <Card
    sx={{
      borderRadius: "16px",
      minHeight: 130,
      background: "linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.95))",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      color: "#fff",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.12)",
      },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      {loading ? (
        <>
          <Skeleton variant="text" width={120} height={20} sx={{ bgcolor: "#1e293b", mb: 1 }} />
          <Skeleton variant="text" width={80} height={40} sx={{ bgcolor: "#1e293b" }} />
        </>
      ) : (
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography fontSize={13} color="#94a3b8" fontWeight={500} mb={1}>
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={700} color="#f1f5f9">
              {value ?? "—"}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "14px",
              background: gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <Icon sx={{ color: "#fff", fontSize: 28 }} />
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
