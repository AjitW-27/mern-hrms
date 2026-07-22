import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { Box, Typography, Button } from "@mui/material";

// Data ordered for the Pie Chart rendering
const chartData = [
  { name: "Engineering", value: 45, color: "#1a73e8" }, // Blue
  { name: "Marketing", value: 25, color: "#10b981" }, // Green
  { name: "Sales", value: 20, color: "#f97316" }, // Orange
  { name: "HR", value: 20, color: "#0ea5e9" }, // Light Blue
  { name: "Finance", value: 18, color: "#a855f7" }, // Purple
];

// Data ordered specifically for the Legend to match the image exactly
const legendData = [
  { name: "Engineering", value: 45, color: "#1a73e8" },
  { name: "Marketing", value: 25, color: "#10b981" },
  { name: "HR", value: 20, color: "#0ea5e9" },
  { name: "Finance", value: 18, color: "#a855f7" },
  { name: "Sales", value: 20, color: "#f97316" },
];

const DepartmentChartWidget = () => {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "16px",
        backgroundColor: "#131826", // Dark blue-grey background
        color: "#fff",
        fontFamily: "sans-serif",
        width: "100%",
        maxWidth: 500,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography sx={{ fontSize: "1.1rem", fontWeight: "bold", mr: 4 ,}}>
          Employees by Department
        </Typography>

        {/* Changed to flex column to put chart on top and legend below */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          {/* Chart Container */}
          <Box position="relative" width={190} height={190}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <filter
                    id="shadow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="4"
                      stdDeviation="6"
                      floodColor="#000"
                      floodOpacity="0.4"
                    />
                  </filter>
                </defs>

                <Pie
                  data={chartData}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={1}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={6}
                  activeIndex={0} // 👈 enables hover behavior
                  activeShape={(props) => {
                    const RADIAN = Math.PI / 180;
                    const {
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      startAngle,
                      endAngle,
                      fill,
                    } = props;

                    const sin = Math.sin(-RADIAN * midAngle);
                    const cos = Math.cos(-RADIAN * midAngle);

                    return (
                      <g>
                        {/* Main slice (slightly bigger on hover) */}
                        <Sector
                          cx={cx}
                          cy={cy}
                          innerRadius={innerRadius}
                          outerRadius={outerRadius + 5} // 👈 expand on hover
                          startAngle={startAngle}
                          endAngle={endAngle}
                          fill={fill}
                          style={{ filter: "url(#shadow)" }}
                        />
                      </g>
                    );
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        filter: "url(#shadow)",
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Centered Text inside Donut */}
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <Typography
                sx={{ fontWeight: "bold", fontSize: "1.5rem", lineHeight: 1.1 }}
              >
                128
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                Total
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Legend Container - Now arranged below in a flex row */}
        <Box
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          justifyContent="center"
          gap={2.5}
          mt={4}
          width="100%"
        >
          {legendData.map((item, index) => (
            <Box key={index} display="flex" alignItems="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: item.color,
                  mr: 1,
                }}
              />
              <Typography
                sx={{ fontSize: "0.9rem", color: "#e2e8f0", mr: 0.5 }}
              >
                {item.name}:
              </Typography>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* <Button
        fullWidth
        disableElevation
        variant="contained"
        sx={{
          backgroundColor: "#1e2433",
          color: "#e2e8f0",
          textTransform: "none",
          fontWeight: 500,
          borderRadius: "8px",
          py: 1,
          mt: 4,
          "&:hover": {
            backgroundColor: "#2a3143",
          },
        }}
      >
        View All Departments
      </Button> */}
    </Box>
  );
};

export default DepartmentChartWidget;
