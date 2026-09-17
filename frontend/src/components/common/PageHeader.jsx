import React from "react";
import { Box, Breadcrumbs, Button, Stack, Typography } from "@mui/material";

const PageHeader = ({ title, description, actionLabel, onAction, actionIcon: ActionIcon }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 3 }}>
      <Box>
        {description ? <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
          {description}
        </Typography> : null}
      </Box>
      {actionLabel ? (
        <Button variant="contained" onClick={onAction} startIcon={ActionIcon ? <ActionIcon /> : null} sx={{ px: 2, py: 0.9 }}>
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  );
};

export default PageHeader;
