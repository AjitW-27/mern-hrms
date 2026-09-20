import React from "react";
import { Card, CardContent, Stack, Typography, Box } from "@mui/material";

const StatCard = ({ title, value, icon: Icon, subtitle }) => {
  return (
    <Card
      sx={{
        borderRadius: 1,
        height: "100%",
        border: "1px solid #E2E8F0",
        background: "linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)",
        boxShadow:
          "0 4px 6px -1px rgba(15,23,42,.07), 0 2px 4px -2px rgba(15,23,42,.05)",
        transition: "transform .2s ease, box-shadow .2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow:
            "0 4px 6px -1px rgba(15,23,42,.07), 0 2px 4px -2px rgba(15,23,42,.05)",
        },
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {title}
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, mt: 0.5, color: "text.primary" }}
            >
              {value}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {Icon ? (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.light",
                color: "primary.main",
              }}
            >
              <Icon sx={{ fontSize: 24 }} />
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatCard;
