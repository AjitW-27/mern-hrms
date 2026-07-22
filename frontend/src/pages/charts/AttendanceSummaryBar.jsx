import React from "react";
import { Box, Typography, Skeleton, LinearProgress } from "@mui/material";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";

const AttendanceSummaryBar = ({ kpis, loading }) => {
  const present = kpis?.todayPresent || 0;
  const absent = kpis?.todayAbsent || 0;
  const late = kpis?.todayLate || 0;
  const total = kpis?.totalEmployees || 1;
  const rate = Math.round((present / total) * 100);

  const stats = [
    { label: "Present", value: present, color: "#10b981", pct: Math.round((present / total) * 100) },
    { label: "Absent", value: absent, color: "#ef4444", pct: Math.round((absent / total) * 100) },
    { label: "Late", value: late, color: "#f59e0b", pct: Math.round((late / total) * 100) },
  ];

  const radialData = [
    { name: "Present", value: rate, fill: "#10b981" },
  ];

  return (
    <Box sx={{
      p: 2.5, borderRadius: "16px",
      background: "linear-gradient(135deg, rgba(19,24,38,0.95), rgba(15,23,42,0.98))",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      height: "100%", minHeight: 320,
      display: "flex", flexDirection: "column",
    }}>
      <Typography fontSize={16} fontWeight={700} color="#f1f5f9" mb={0.3}>
        Today's Attendance
      </Typography>
      <Typography fontSize={12} color="#64748b" mb={2}>
        {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
      </Typography>

      {loading ? (
        <Skeleton variant="circular" width={140} height={140} sx={{ bgcolor: "#1e293b", mx: "auto", my: 2 }} />
      ) : (
        <Box position="relative" width={160} height={160} mx="auto" mb={1}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="65%"
              outerRadius="100%"
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "#1e293b" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <Box sx={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", textAlign: "center",
          }}>
            <Typography fontSize={28} fontWeight={800} color="#f1f5f9" lineHeight={1}>
              {rate}%
            </Typography>
            <Typography fontSize={11} color="#64748b">Rate</Typography>
          </Box>
        </Box>
      )}

      {/* Stats */}
      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {stats.map((s) => (
          <Box key={s.label}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Box display="flex" alignItems="center" gap={0.8}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.color }} />
                <Typography fontSize={12} color="#94a3b8">{s.label}</Typography>
              </Box>
              <Typography fontSize={12} color="#f1f5f9" fontWeight={600}>
                {loading ? "—" : s.value}
              </Typography>
            </Box>
            {!loading && (
              <LinearProgress
                variant="determinate"
                value={s.pct}
                sx={{
                  height: 4, borderRadius: 2,
                  bgcolor: "#1e293b",
                  "& .MuiLinearProgress-bar": { bgcolor: s.color, borderRadius: 2 },
                }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AttendanceSummaryBar;
