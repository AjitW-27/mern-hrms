import React from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";

const StatCard = ({ title, value, icon: Icon, subtitle }) => {
  return (
    <Card sx={{ borderRadius: 4, height: "100%", boxShadow: "0 14px 40px rgba(15,23,42,.18)" }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <div>
            <Typography variant="body2" color="text.secondary" sx={{ color: "#9ca3af" }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: "#edededd8" }}>
              {value}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" color="text.secondary" sx={{ color: "#9ca3af" }}>
                {subtitle}
              </Typography>
            ) : null}
          </div>
          {Icon ? <Icon sx={{ fontSize: 38, opacity: 0.9 }} /> : null}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatCard;
