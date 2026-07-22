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

// Helper functions for UI styling
const getStatusStyles = (status) => {
  switch (status) {
    case "Completed":
      return { bg: "#10b98120", color: "#10b981" }; // Green
    case "In Progress":
      return { bg: "#3b82f620", color: "#3b82f6" }; // Blue
    case "Delayed":
      return { bg: "#ef444420", color: "#ef4444" }; // Red
    case "On Hold":
      return { bg: "#f59e0b20", color: "#f59e0b" }; // Orange
    case "Not Started":
    default:
      return { bg: "#64748b20", color: "#94a3b8" }; // Gray
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "Critical":
      return "#ef4444"; // Red
    case "High":
      return "#f59e0b"; // Orange
    case "Medium":
      return "#3b82f6"; // Blue
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
        const response = await fetch("http://localhost:5000/api/projects", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
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
        p: { xs: 2, md: 4 },
        background: "#0f172a",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography fontSize={28} fontWeight="bold">
          Projects Overview
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/dashboard/add-project")}
          sx={{
            background: "#8b5cf6",
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            "&:hover": { background: "#7c3aed" },
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
                  borderRadius: "16px",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  "&:hover": {
                    borderColor: "#8b5cf6",
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
                    <Typography fontSize={12} color="#94a3b8" fontWeight="bold">
                      {project.code || "PRJ-0000"}
                    </Typography>
                    <Typography
                      fontSize={20}
                      fontWeight="bold"
                      noWrap
                      sx={{ maxWidth: "200px", color: "#f8fafc" }}
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
                      borderRadius: "6px",
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
                    color="#94a3b8"
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
                    <Typography fontSize={13} color="#94a3b8">
                      Progress
                    </Typography>
                    <Typography fontSize={13} color="#fff" fontWeight="bold">
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
                      borderRadius: 5,
                      backgroundColor: "#0f172a",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: statusStyle.color, // Progress bar matches status color
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>

                <Divider sx={{ borderColor: "#334155", mb: 2 }} />

                {/* Footer: Team & Dates */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography fontSize={12} color="#64748b">
                      Deadline
                    </Typography>
                    <Typography
                      fontSize={14}
                      fontWeight="bold"
                      color={
                        dayjs(project.deadline).isBefore(dayjs()) &&
                        project.status !== "Completed"
                          ? "#ef4444"
                          : "#e2e8f0"
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
                        borderColor: "#1e293b",
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
