import React, { useState } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#a855f7", "#ef4444", "#22c55e", "#f97316"];

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <Box sx={{ bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", p: 1.5 }}>
        <Typography fontSize={13} color="#f1f5f9" fontWeight={600}>{payload[0].name}</Typography>
        <Typography fontSize={12} color="#94a3b8">{payload[0].value} employees</Typography>
      </Box>
    );
  }
  return null;
};

const DepartmentPieChart = ({ data, loading }) => {
  const [activeIndex, setActiveIndex] = useState(0);
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
        Employees by Department
      </Typography>
      <Typography fontSize={12} color="#64748b" mb={2}>
        Distribution across departments
      </Typography>

      {loading ? (
        <Skeleton variant="circular" width={160} height={160} sx={{ bgcolor: "#1e293b", mx: "auto" }} />
      ) : !data?.length ? (
        <Box display="flex" alignItems="center" justifyContent="center" height={160}>
          <Typography color="#475569" fontSize={13}>No department data</Typography>
        </Box>
      ) : (
        <>
          <Box position="relative" width={170} height={170} mx="auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={2}
                  dataKey="value"
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, idx) => setActiveIndex(idx)}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} style={{ cursor: "pointer" }} />
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
              <Typography fontSize={10} color="#64748b">Total</Typography>
            </Box>
          </Box>

          {/* Legend */}
          <Box display="flex" flexWrap="wrap" gap={1.2} mt={2} justifyContent="center">
            {data.map((d, i) => (
              <Box key={d.name} display="flex" alignItems="center" gap={0.6}
                sx={{ cursor: "pointer" }} onClick={() => setActiveIndex(i)}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: COLORS[i % COLORS.length], flexShrink: 0 }} />
                <Typography fontSize={11} color={activeIndex === i ? "#f1f5f9" : "#94a3b8"} fontWeight={activeIndex === i ? 600 : 400}>
                  {d.name}: {d.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default DepartmentPieChart;
