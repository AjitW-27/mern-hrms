import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Box, Typography } from "@mui/material";

// Expanded data points to accurately recreate the complex wavy curve from the image
const data = [
  { name: "Apr 23", value: 50 },
  { name: "Apr 25", value: 68 }, // intermediate
  { name: "Apr 27", value: 57 }, // intermediate
  { name: "Apr 30", value: 86 },
  { name: "May 3", value: 77 }, // intermediate
  { name: "May 7", value: 114 },
  { name: "May 10", value: 104 }, // intermediate
  { name: "May 14", value: 115 },
  { name: "May 18", value: 112 }, // intermediate
  { name: "May 21", value: 128 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: "#6d28d9",
          padding: "6px 16px",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.4)",
          border: "none",
        }}
      >
        <Typography
          sx={{
            fontWeight: "bold",
            fontSize: "16px",
            color: "#fff",
            lineHeight: 1.2,
          }}
        >
          {payload[0].value}
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "#e9d5ff" }}>
          {label}
        </Typography>
      </Box>
    );
  }
  return null;
};

const EmployeeChart = () => {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "16px",
        backgroundColor: "#131826",
        color: "#fff",
        fontFamily: "sans-serif",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Area */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography sx={{ fontSize: "1.1rem", fontWeight: "bold", ml: 1 }}>
          Employee Overview
        </Typography>

        {/* Styled Dropdown Mimic */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#161b28",
            padding: "8px 14px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            cursor: "pointer",
            border: "1px solid #1e293b",
          }}
        >
          This Month
          <svg
            style={{ marginLeft: 10, width: 14, height: 14, color: "#94a3b8" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Box>
      </Box>

      {/* Chart Area */}
      <Box sx={{ flexGrow: 1, minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            /* FIXED MARGIN: Changed left from -20 to 0 so the Y-axis has room to render */
            margin={{ top: 0, right: 15, left: -15, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6d28d9" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6d28d9" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Solid horizontal lines instead of dashed */}
            <CartesianGrid vertical={false} stroke="#1e293b" />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 13 }}
              dy={15}
              ticks={["Apr 23", "Apr 30", "May 7", "May 14", "May 21"]}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 13 }}
              /* REMOVED dx={-10} here to prevent text squishing */
              domain={[0, 150]}
              ticks={[0, 30, 60, 90, 120, 150]}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#6d28d9", strokeWidth: 1 }}
            />

            <Area
              type="natural"
              dataKey="value"
              stroke="#7c3aed"
              strokeWidth={3}
              fill="url(#colorValue)"
              activeDot={{ r: 6, fill: "#7c3aed", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default EmployeeChart;
