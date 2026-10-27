import React from "react";
import { Box } from "@mui/material";
import { StatCard } from "../common/UI";
const metricsConfig = [["totalEmployees", "Total Employees"], ["activeProjects", "Active Projects"], ["totalDepartments", "Departments"], ["todayPresent", "Present Today"], ["todayAbsent", "Absent Today"], ["pendingLeaves", "Pending Leave Requests"], ["newJoineesThisMonth", "New Hires This Month"], ["totalLeaveRequests", "Leave Requests"]];
export function KpiMetricsGrid({ metrics = {}, loading = false }) { return <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" }, gap: 2 }}>{metricsConfig.map(([key, title]) => <StatCard key={key} title={title} value={metrics[key]} loading={loading} />)}</Box>; }
export default KpiMetricsGrid;
