import { Button, Badge as Chip, Avatar } from "../../components/common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, LinearProgress, AvatarGroup, Divider } from "@mui/material";
import { Add as AddIcon, Business as ClientIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import execReq from "../../lib/execReq";

// Helper functions for UI styling
const getStatusStyles = (status) => {
  switch (status) {
    case "Completed":
      return { bg: themeColors.overlay16, color: themeColors.success }; // Green
    case "In Progress":
      return { bg: themeColors.overlay20, color: themeColors.info }; // Blue
    case "Delayed":
      return { bg: themeColors.overlay17, color: themeColors.primary }; // Red
    case "On Hold":
      return { bg: themeColors.overlay18, color: themeColors.warning };
    case "Not Started":
    default:
      return { bg: themeColors.overlay34, color: "none" }; // Gray
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "Critical":
      return themeColors.primary; // Red
    case "High":
      return themeColors.warning;
    case "Medium":
      return themeColors.info; // Blue
    case "Low":
    default:
      return themeColors.success; // Green
  }
};

const Project = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await execReq("/projects");
        const data = response.data;
        setProjects(Array.isArray(data) ? data : data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        background: themeColors.cardBg,
        minHeight: "100vh",
        color: themeColors.navyDark,
      }}
    >
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        mb={2.5}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/dashboard/add-project")}
          sx={{
            background: themeColors.primary,
            textTransform: "none",
            borderRadius: "4px",
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": { background: themeColors.primary, boxShadow: "none" },
          }}
        >
          New Project
        </Button>
      </Box>

      <Grid container spacing={3}>
        {projects.map((project) => {
          const statusStyle = getStatusStyles(project.status);
          const priorityColor = getPriorityColor(project.priority);

          return (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: "4px",
                  background: themeColors.cardBg,
                  border: "1px solid " + themeColors.border,
                  boxShadow:
                    "0 1px 2px " + themeColors.overlay1 + ", 0 1px 3px " + themeColors.overlay2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  "&:hover": {
                    borderColor: themeColors.primary,
                    transition: "0.3s ease-in-out",
                  },
                }}
              >
                {/* Header: Code & Status */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={2}
                >
                  <Box>
                    <Typography fontSize={12} color={themeColors.textMuted} fontWeight={700}>
                      {project.code || "PRJ-0000"}
                    </Typography>
                    <Typography
                      fontSize={18}
                      fontWeight={700}
                      noWrap
                      sx={{ maxWidth: "200px", color: themeColors.navyDark }}
                    >
                      {project.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={project.status}
                    size="small"
                    sx={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      fontWeight: "bold",
                      borderRadius: "4px",
                    }}
                  />
                </Box>

                {/* Client & Priority */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={0.5}
                    color={themeColors.textMuted}
                  >
                    <ClientIcon fontSize="small" />
                    <Typography fontSize={13}>
                      {project.client || "Internal"}
                    </Typography>
                  </Box>
                  <Chip
                    variant="outlined"
                    size="small"
                    label={`${project.priority} Priority`}
                    sx={{
                      borderColor: priorityColor,
                      color: priorityColor,
                      fontSize: "11px",
                      height: "20px",
                    }}
                  />
                </Box>

                {/* Progress Bar */}
                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography fontSize={13} color={themeColors.textMuted}>
                      Progress
                    </Typography>
                    <Typography fontSize={13} color={themeColors.navyDark} fontWeight={700}>
                      {project.progress || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(
                      Math.max(Number(project.progress) || 0, 0),
                      100,
                    )}
                    sx={{
                      height: 8,
                      borderRadius: "4px",
                      backgroundColor: themeColors.tableHeader,
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: statusStyle.color, // Progress bar matches status color
                        borderRadius: "4px",
                      },
                    }}
                  />
                </Box>

                <Divider sx={{ borderColor: themeColors.border, mb: 2 }} />

                {/* Footer: Team & Dates */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography fontSize={12} color={themeColors.textMuted}>
                      Deadline
                    </Typography>
                    <Typography
                      fontSize={14}
                      fontWeight="bold"
                      color={
                        dayjs(project.deadline).isBefore(dayjs()) &&
                        project.status !== "Completed"
                          ? themeColors.primary
                          : themeColors.textMuted
                      }
                    >
                      {project.deadline
                        ? dayjs(project.deadline).format("DD MMM YYYY")
                        : "N/A"}
                    </Typography>
                  </Box>

                  {/* Mock Avatars - In a real app, map over project.teamMembers */}
                  <AvatarGroup
                    max={3}
                    sx={{
                      "& .MuiAvatar-root": {
                        width: 30,
                        height: 30,
                        fontSize: 12,
                        borderColor: themeColors.cardBg,
                      },
                    }}
                  >
                    <Avatar
                      alt="Remy Sharp"
                      src="https://i.pravatar.cc/150?img=11"
                    />
                    <Avatar
                      alt="Travis Howard"
                      src="https://i.pravatar.cc/150?img=12"
                    />
                    <Avatar
                      alt="Agnes Walker"
                      src="https://i.pravatar.cc/150?img=13"
                    />
                  </AvatarGroup>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Project;
