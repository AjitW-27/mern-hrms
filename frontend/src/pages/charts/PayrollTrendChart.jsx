import React from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <Box sx={{ bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", p: 1.5 }}>
        <Typography fontSize={13} color="#f1f5f9" fontWeight={600} mb={0.5}>{label}</Typography>
        {payload.map((p) => (
          <Box key={p.name} display="flex" justifyContent="space-between" gap={2}>
            <Typography fontSize={12} color={p.color}>{p.name}</Typography>
            <Typography fontSize={12} color="#f1f5f9" fontWeight={600}>
              {p.name === "Total Payroll" ? `₹${Number(p.value).toLocaleString("en-IN")}` : p.value}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

const PayrollTrendChart = ({ data, loading }) => {
  return (
    <Box sx={{
      p: 2.5, borderRadius: "16px",
      background: "linear-gradient(135deg, rgba(19,24,38,0.95), rgba(15,23,42,0.98))",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      height: "100%", minHeight: 300,
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography fontSize={16} fontWeight={700} color="#f1f5f9" mb={0.3}>
            Payroll Trend
          </Typography>
          <Typography fontSize={12} color="#64748b">
            Last 6 months net payroll
          </Typography>
        </Box>
        <Box sx={{
          px: 1.5, py: 0.5, borderRadius: "6px",
          background: "linear-gradient(135deg, #f59e0b22, #f9731622)",
          border: "1px solid #f59e0b44",
        }}>
          <Typography fontSize={11} color="#f59e0b" fontWeight={600}>Admin/HR Only</Typography>
        </Box>
      </Box>

      {loading ? (
        <Skeleton variant="rectangular" height={200} sx={{ bgcolor: "#1e293b", borderRadius: "8px" }} />
      ) : !data?.length ? (
        <Box display="flex" alignItems="center" justifyContent="center" height={200}>
          <Typography color="#475569" fontSize={13}>No payroll data yet</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis
              axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8", paddingTop: 12 }} iconType="circle" />
            <Bar dataKey="total" name="Total Payroll" fill="#6366f1" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
            <Line type="monotone" dataKey="count" name="Employees Paid" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default PayrollTrendChart;
