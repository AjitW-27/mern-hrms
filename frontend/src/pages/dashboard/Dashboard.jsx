import React, { useEffect, useState, useCallback } from "react";
import { Box, Grid, Typography, Alert, Fade } from "@mui/material";
import { NotificationsActive as NotificationsActiveIcon } from "@mui/icons-material";
import useAuthStore from "../../strore/authStore";

import KpiCards from "../charts/KpiCards";
import AttendanceTrendChart from "../charts/AttendanceTrendChart";
import DepartmentPieChart from "../charts/DepartmentPieChart";
import AnnouncementsWidget from "../charts/AnnouncementsWidget";
import RecentActivities from "../charts/recentActivity";
import UpcomingHolidays from "../charts/UpcomingHolidays";
import PayrollTrendChart from "../charts/PayrollTrendChart";
import LeaveDistributionChart from "../charts/LeaveDistributionChart";
import ProjectStatusChart from "../charts/ProjectStatusChart";
import AttendanceSummaryBar from "../charts/AttendanceSummaryBar";

const Dashboard = () => {
  const { token, user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Notification States
  const [latestNotification, setLatestNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`http://localhost:5000/api/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch dashboard data");

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch Latest Notification
  const fetchLatestNotification = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const json = await res.json();

      if (json.success && json.data.length > 0) {
        // Find the most recent UNREAD notification
        const unread = json.data.find((n) => !n.isRead);

        if (unread) {
          setLatestNotification(unread);
          setShowNotification(true);

          // Hide notification and show Name after 1 minute (60,000 ms)
          setTimeout(() => {
            setShowNotification(false);
          }, 60000);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notification for dashboard header", err);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchLatestNotification(); // Call it when component loads

    const interval = setInterval(fetchDashboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboard, fetchLatestNotification]);

  const role = user?.role || "employee";
  const isAdminOrHr = ["admin", "hr"].includes(role);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          sx={{
            bgcolor: "#1e1e2e",
            color: "#f87171",
            border: "1px solid #ef4444",
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: "100vh" }}>
     
      <Box mb={3} sx={{ minHeight: "80px" }}>
        {showNotification && latestNotification ? (
          <Fade in={showNotification}>
            <Alert
              icon={<NotificationsActiveIcon fontSize="inherit" />}
              severity="info"
              sx={{
                bgcolor: "rgba(59, 130, 246, 0.15)",
                color: "#60a5fa",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "12px",
                alignItems: "center",
                py: 1.5,
                px: 3,
                boxShadow: "0 4px 20px rgba(59, 130, 246, 0.1)",
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                {latestNotification.title}
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                {latestNotification.message}
              </Typography>
            </Alert>
          </Fade>
        ) : (
          <Fade in={!showNotification}>
            <Box>
              <Typography
                variant="h4"
                color="#f1f5f9"
                fontWeight={700}
                fontFamily="'Poppins', sans-serif"
              >
                {getGreeting()}, {user?.name || "Admin"} 👋
              </Typography>
              <Typography color="#64748b" mt={0.5} fontSize={14}>
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {" · "}
                {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
              </Typography>
            </Box>
          </Fade>
        )}
      </Box>

      <Grid container spacing={2.5}>
        {/* KPI Cards */}
        <Grid item xs={12}>
          <KpiCards data={data?.kpis} loading={loading} role={role} />
        </Grid>

        {/* Attendance Trend */}
        <Grid item xs={12} lg={8}>
          <AttendanceTrendChart
            data={data?.charts?.attendanceTrend}
            loading={loading}
          />
        </Grid>

        {/* Attendance Summary */}
        <Grid item xs={12} lg={4}>
          <AttendanceSummaryBar kpis={data?.kpis} loading={loading} />
        </Grid>

        {/* Department Pie */}
        <Grid item xs={12} md={6} lg={4}>
          <DepartmentPieChart
            data={data?.charts?.departmentDistribution}
            loading={loading}
          />
        </Grid>

        {/* Leave Distribution */}
        <Grid item xs={12} md={6} lg={4}>
          <LeaveDistributionChart
            data={data?.charts?.leaveTypeDistribution}
            loading={loading}
          />
        </Grid>

        {/* Project Status */}
        <Grid item xs={12} md={6} lg={4}>
          <ProjectStatusChart
            data={data?.charts?.projectStatusDistribution}
            loading={loading}
          />
        </Grid>

        {/* Payroll Trend - Admin/HR only */}
        {isAdminOrHr && (
          <Grid item xs={12} lg={7}>
            <PayrollTrendChart
              data={data?.charts?.payrollTrend}
              loading={loading}
            />
          </Grid>
        )}

        {/* Announcements */}
        <Grid item xs={12} md={6} lg={isAdminOrHr ? 5 : 6}>
          <AnnouncementsWidget
            announcements={data?.feed?.announcements}
            loading={loading}
          />
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6} lg={6}>
          <RecentActivities
            activities={data?.feed?.recentActivities}
            loading={loading}
          />
        </Grid>

        {/* Upcoming Holidays */}
        <Grid item xs={12} md={6} lg={6}>
          <UpcomingHolidays
            holidays={data?.feed?.upcomingHolidays}
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
