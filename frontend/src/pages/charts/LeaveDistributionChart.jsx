import React from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <Box sx={{ bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", p: 1.5 }}>
        <Typography fontSize={13} color="#f1f5f9" fontWeight={600}>{label}</Typography>
        <Typography fontSize={12} color="#94a3b8">{payload[0].value} leaves</Typography>
      </Box>
    );
  }
  return null;
};

const LeaveDistributionChart = ({ data, loading }) => {
  return (
    <Box sx={{
      p: 2.5, borderRadius: "16px",
      background: "linear-gradient(135deg, rgba(19,24,38,0.95), rgba(15,23,42,0.98))",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      height: "100%", minHeight: 320,
    }}>
      <Typography fontSize={16} fontWeight={700} color="#f1f5f9" mb={0.3}>
        Leave Distribution
      </Typography>
      <Typography fontSize={12} color="#64748b" mb={2}>
        By leave type
      </Typography>

      {loading ? (
        <Skeleton variant="rectangular" height={220} sx={{ bgcolor: "#1e293b", borderRadius: "8px" }} />
      ) : !data?.length ? (
        <Box display="flex" alignItems="center" justifyContent="center" height={200}>
          <Typography color="#475569" fontSize={13}>No leave data yet</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default LeaveDistributionChart;
