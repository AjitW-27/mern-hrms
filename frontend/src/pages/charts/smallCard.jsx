import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

const getAccent = (color) => {
  if (typeof color === "string" && color.includes("linear-gradient")) return color;
  return "linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)";
};

const KpiCard = ({ title, value, change, icon, color }) => {
  return (
    <Card
      sx={{
        borderRadius: "4px",
        minHeight: 130,
        display: "flex",
        alignItems: "center",
        background: getAccent(color),
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 6px -1px rgba(15,23,42,.07), 0 2px 4px -2px rgba(15,23,42,.05)",
        transition: "transform .2s ease, box-shadow .2s ease",
        color: "text.primary",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 15px -3px rgba(15,23,42,.10), 0 4px 6px -4px rgba(15,23,42,.06)",
        },
      }}
    >
      <CardContent sx={{ width: "100%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography fontSize={14} color="text.secondary" fontWeight={600}>
              {title || "--"}
            </Typography>
            <Typography variant="h5" fontWeight={700} mt={1} color="text.primary">
              {value ?? "0"}
            </Typography>
            <Typography
              fontSize={13}
              mt={1}
              color={change?.includes("+") ? "success.main" : change?.includes("-") ? "error.main" : "text.secondary"}
            >
              {change ? `${change} from last month` : "No data"}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "4px",
              background: color || "linear-gradient(135deg,#EEF0FF,#F0F9FF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)",
            }}
          >
            {React.cloneElement(icon, { sx: { ...(icon?.props?.sx || {}), color: icon?.props?.sx?.color || "#0A5C67", fontSize: 36 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
