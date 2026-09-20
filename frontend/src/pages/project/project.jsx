import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  AvatarGroup,
  Divider,
} from "@mui/material";
import { Add as AddIcon, Business as ClientIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import execReq from "../../lib/execReq";

// Helper functions for UI styling
const getStatusStyles = (status) => {
  switch (status) {
    case "Completed":
      return { bg: "rgba(16,185,129,.12)", color: "#10b981" }; // Green
    case "In Progress":
      return { bg: "rgba(79,70,229,.125)", color: "#4F46E5" }; // Blue
    case "Delayed":
      return { bg: "rgba(239,68,68,.12)", color: "#ef4444" }; // Red
    case "On Hold":
      return { bg: "rgba(245,158,11,.12)", color: "#f59e0b" }; // Orange
    case "Not Started":
    default:
      return { bg: "rgba(100,116,139,.12)", color: "none" }; // Gray
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "Critical":
      return "#ef4444"; // Red
    case "High":
      return "#f59e0b"; // Orange
    case "Medium":
      return "#4F46E5"; // Blue
    case "Low":
    default:
      return "#10b981"; // Green
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
        background: "#FFFFFF",
        minHeight: "100vh",
        color: "#0F172A",
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
            background: "#0E8F9A",
            textTransform: "none",
            borderRadius: "4px",
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": { background: "#0B7480", boxShadow: "none" },
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
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow:
                    "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  "&:hover": {
                    borderColor: "#0E8F9A",
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
                    <Typography fontSize={12} color="#64748B" fontWeight={700}>
                      {project.code || "PRJ-0000"}
                    </Typography>
                    <Typography
                      fontSize={18}
                      fontWeight={700}
                      noWrap
                      sx={{ maxWidth: "200px", color: "#0F172A" }}
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
                    color="#64748B"
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
                    <Typography fontSize={13} color="#64748B">
                      Progress
                    </Typography>
                    <Typography fontSize={13} color="#0F172A" fontWeight={700}>
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
                      backgroundColor: "#F1F5F9",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: statusStyle.color, // Progress bar matches status color
                        borderRadius: "4px",
                      },
                    }}
                  />
                </Box>

                <Divider sx={{ borderColor: "#E2E8F0", mb: 2 }} />

                {/* Footer: Team & Dates */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography fontSize={12} color="#64748B">
                      Deadline
                    </Typography>
                    <Typography
                      fontSize={14}
                      fontWeight="bold"
                      color={
                        dayjs(project.deadline).isBefore(dayjs()) &&
                        project.status !== "Completed"
                          ? "#ef4444"
                          : "#475569"
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
                        borderColor: "#FFFFFF",
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
