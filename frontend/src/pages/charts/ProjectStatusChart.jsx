import React from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const STATUS_COLORS = {
  "In Progress": "#6366f1",
  "Completed": "#10b981",
  "Not Started": "#64748b",
  "On Hold": "#f59e0b",
  "Delayed": "#ef4444",
  "Cancelled": "#94a3b8",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <Box sx={{ bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", p: 1.5 }}>
        <Typography fontSize={13} color="#f1f5f9" fontWeight={600}>{payload[0].name}</Typography>
        <Typography fontSize={12} color="#94a3b8">{payload[0].value} projects</Typography>
      </Box>
    );
  }
  return null;
};

const ProjectStatusChart = ({ data, loading }) => {
  const total = data?.reduce((s, d) => s + d.value, 0) || 0;

  return (
    <Box sx={{
      p: 2.5, borderRadius: "16px",
      background: "linear-gradient(135deg, rgba(19,24,38,0.95), rgba(15,23,42,0.98))",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      height: "100%", minHeight: 320,
    }}>
      <Typography fontSize={16} fontWeight={700} color="#f1f5f9" mb={0.3}>
        Project Status
      </Typography>
      <Typography fontSize={12} color="#64748b" mb={2}>
        All projects overview
      </Typography>

      {loading ? (
        <Skeleton variant="circular" width={150} height={150} sx={{ bgcolor: "#1e293b", mx: "auto" }} />
      ) : !data?.length ? (
        <Box display="flex" alignItems="center" justifyContent="center" height={200}>
          <Typography color="#475569" fontSize={13}>No project data yet</Typography>
        </Box>
      ) : (
        <>
          <Box position="relative" width={160} height={160} mx="auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                  {data.map((d, i) => (
                    <Cell key={i} fill={STATUS_COLORS[d.name] || "#6366f1"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)", textAlign: "center",
            }}>
              <Typography fontSize={22} fontWeight={800} color="#f1f5f9" lineHeight={1}>{total}</Typography>
              <Typography fontSize={10} color="#64748b">Projects</Typography>
            </Box>
          </Box>

          {/* Legend */}
          <Box display="flex" flexDirection="column" gap={0.8} mt={2}>
            {data.map((d) => (
              <Box key={d.name} display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={0.8}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: STATUS_COLORS[d.name] || "#6366f1" }} />
                  <Typography fontSize={12} color="#94a3b8">{d.name}</Typography>
                </Box>
                <Typography fontSize={12} color="#f1f5f9" fontWeight={600}>{d.value}</Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ProjectStatusChart;
