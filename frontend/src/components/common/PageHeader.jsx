import React from "react";
import { Box, Breadcrumbs, Button, Stack, Typography } from "@mui/material";

const PageHeader = ({ title, description, actionLabel, onAction, actionIcon: ActionIcon }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75, color: "#edededd8" }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720, color: "#9ca3af" }}>
          {description}
        </Typography>
      </Box>
      {actionLabel ? (
        <Button variant="contained" onClick={onAction} startIcon={ActionIcon ? <ActionIcon /> : null} sx={{ borderRadius: 3, px: 2.25, py: 1.2 }}>
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  );
};

export default PageHeader;
