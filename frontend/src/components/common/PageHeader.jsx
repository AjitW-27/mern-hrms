import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AppButton } from "./AppUi";

const PageHeader = ({
  title,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  breadcrumbs = [],
  onBreadcrumbClick,
}) => {
  const navigate = useNavigate();

  // If no breadcrumbs are explicitly passed, default to [title]
  const resolvedBreadcrumbs =
    breadcrumbs.length > 0 ? breadcrumbs : title ? [title] : [];

  const handleBreadcrumbClick = (crumb, index) => {
    // If it's the current/active page (last item), do nothing
    if (index === resolvedBreadcrumbs.length - 1) return;

    // 1. If crumb is an object with a custom onClick (e.g., setView("dashboard"))
    if (typeof crumb === "object" && crumb.onClick) {
      crumb.onClick();
      return;
    }

    // 2. If crumb is an object with a path (e.g., path: "/leaves")
    if (typeof crumb === "object" && crumb.path) {
      navigate(crumb.path);
      return;
    }

    // 3. If parent provided onBreadcrumbClick callback
    if (onBreadcrumbClick) {
      onBreadcrumbClick(crumb, index);
      return;
    }

    // 4. Fallback: navigate one step back in history
    navigate(-1);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 2.5,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {/* Top Breadcrumb Trail */}
        {resolvedBreadcrumbs.length > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{ mb: 0.5 }}
          >
            {resolvedBreadcrumbs.map((crumb, index) => {
              const isLast = index === resolvedBreadcrumbs.length - 1;
              const label = typeof crumb === "object" ? crumb.label : crumb;

              return (
                <Stack
                  key={`${label}-${index}`}
                  direction="row"
                  alignItems="center"
                  spacing={0.75}
                >
                  <Typography
                    onClick={() => handleBreadcrumbClick(crumb, index)}
                    sx={{
                      fontSize: 12,
                      lineHeight: "16px",
                      cursor: isLast ? "default" : "pointer",
                      fontWeight: isLast ? 600 : 400,
                      color: isLast ? "#64748B" : "#0F172A",
                      transition: "color 0.15s ease",
                      "&:hover": {
                        color: isLast ? "#64748B" : "#FD5622",
                        textDecoration: isLast ? "none" : "underline",
                      },
                    }}
                  >
                    {label}
                  </Typography>

                  {!isLast && (
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#94A3B8",
                        userSelect: "none",
                      }}
                    >
                      /
                    </Typography>
                  )}
                </Stack>
              );
            })}
          </Stack>
        )}

        {/* Large Main Heading Title */}
        {title && (
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 20, sm: 26 },
              lineHeight: 1.25,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#0F172A",
            }}
          >
            {title}
          </Typography>
        )}
      </Box>

      {/* Optional Top Right Button (if passed) */}
      {onAction && actionLabel ? (
        <AppButton
          variant="contained"
          onClick={onAction}
          startIcon={ActionIcon ? <ActionIcon sx={{ fontSize: 20 }} /> : null}
          sx={{
            flexShrink: 0,
            backgroundColor: "#FD5622",
            "&:hover": { backgroundColor: "#E04818" },
          }}
        >
          {actionLabel}
        </AppButton>
      ) : null}
    </Box>
  );
};

export default PageHeader;
