import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";

const PageHeader = ({
  title,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  breadcrumbs = [],
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      mb: 3,
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      {breadcrumbs.length > 0 && (
        <Stack direction="row" spacing={0.75} sx={{ mb: 0.75 }}>
          {breadcrumbs.map((item, index) => (
            <Typography
              key={`${item}-${index}`}
              sx={{
                fontSize: 12,
                lineHeight: "16px",
                color: index === breadcrumbs.length - 1 ? "#475569" : "none",
              }}
            >
              {item}
              {index < breadcrumbs.length - 1 ? " /" : ""}
            </Typography>
          ))}
        </Stack>
      )}
      <Typography
        component="h1"
        sx={{
          fontSize: 28,
          lineHeight: "36px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "#0F172A",
        }}
      >
        {title}
      </Typography>
    </Box>
    {onAction && actionLabel ? (
      <Button
        variant="contained"
        onClick={onAction}
        startIcon={ActionIcon ? <ActionIcon sx={{ fontSize: 20 }} /> : null}
        sx={{
          flexShrink: 0,
          background: "linear-gradient(135deg,#0E8F9A,#0B7480)",
        }}
      >
        {actionLabel}
      </Button>
    ) : null}
  </Box>
);

export default PageHeader;
