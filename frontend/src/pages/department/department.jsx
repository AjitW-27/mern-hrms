import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Grid,
  Button,
  Avatar,
  AvatarGroup,
  IconButton,
  Divider,
} from "@mui/material";

import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

const Department = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/departments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      setDepartments(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        background: "#f8fafc",
        color: "#0f172a",
        minHeight: "100vh",
      }}
    >
      {/* ================= HEADER ================= */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,

          "@media (max-width: 600px)": {
            flexDirection: "column",
            alignItems: "stretch",
            gap: 2,
          },
        }}
      >
        {/* Title */}
        <Box>
          <Typography fontSize={20} fontWeight={700} color="#0f172a">
            Departments
          </Typography>

          <Typography fontSize={14} color="#64748b" mt={0.5}>
            Manage your organization's departments and teams
          </Typography>
        </Box>

        {/* Add Department Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/dashboard/add-department")}
          sx={{
            height: 44,
            px: 2.5,

            background: "#8b5cf6",

            textTransform: "none",
            fontSize: 14,
            fontWeight: 600,

            borderRadius: "8px",

            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.20)",

            "&:hover": {
              background: "#7c3aed",
              boxShadow: "0 6px 16px rgba(139, 92, 246, 0.25)",
            },
          }}
        >
          Add Department
        </Button>
      </Box>

      {/* ================= DEPARTMENT GRID ================= */}
      <Grid container spacing={3}>
        {departments.map((dept) => {
          const color = dept.color || "#8b5cf6";

          return (
            <Grid item xs={12} sm={6} md={4} key={dept._id}>
              {/* ================= CARD ================= */}
              <Box
                sx={{
                  p: 3,

                  borderRadius: "8px",

                  /*
                   * Soft pastel gradient
                   * Department color is used only
                   * as a very light background glow.
                   */
                  background: `
                    radial-gradient(
                      circle at 0% 0%,
                      ${color}18 0%,
                      transparent 55%
                    ),
                    linear-gradient(
                      135deg,
                      #ffffff 0%,
                      #f8fafc 100%
                    )
                  `,

                  border: "1px solid #e5e7eb",

                  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",

                  transition:
                    "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",

                  "&:hover": {
                    transform: "translateY(-6px) scale(1.015)",

                    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.10)",

                    borderColor: `${color}55`,
                  },
                }}
              >
                {/* ================= CARD HEADER ================= */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 3,
                  }}
                >
                  {/* Department Name */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {/* Folder Icon */}
                    <Box
                      sx={{
                        width: 40,
                        height: 40,

                        borderRadius: "8px",

                        background: `${color}15`,

                        color: color,

                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",

                        mr: 2,

                        border: `1px solid ${color}20`,
                      }}
                    >
                      <FolderIcon fontSize="small" />
                    </Box>

                    {/* Department Name */}
                    <Typography fontSize={18} fontWeight={600} color="#0f172a">
                      {dept.name}
                    </Typography>
                  </Box>

                  {/* More Button */}
                  <IconButton
                    size="small"
                    sx={{
                      color: "#64748b",

                      "&:hover": {
                        background: `${color}10`,
                        color: color,
                      },
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* ================= HEAD OF DEPARTMENT ================= */}
                <Box mb={3}>
                  <Typography
                    fontSize={12}
                    color="#64748b"
                    textTransform="uppercase"
                    fontWeight={600}
                    letterSpacing={0.5}
                    mb={0.5}
                  >
                    Head of Department
                  </Typography>

                  <Typography fontSize={15} color="#334155" fontWeight={500}>
                    {dept.head || "Not Assigned"}
                  </Typography>
                </Box>

                {/* ================= DIVIDER ================= */}
                <Divider
                  sx={{
                    borderColor: "#e5e7eb",
                    mb: 2,
                  }}
                />

                {/* ================= CARD FOOTER ================= */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* Employee Count */}
                  <Box>
                    <Typography
                      fontSize={20}
                      fontWeight={700}
                      color="#0f172a"
                      lineHeight={1.2}
                    >
                      {dept.count || 0}
                    </Typography>

                    <Typography fontSize={13} color="#64748b">
                      Employees
                    </Typography>
                  </Box>

                  {/* Members */}
                  <AvatarGroup
                    max={4}
                    sx={{
                      "& .MuiAvatar-root": {
                        width: 32,
                        height: 32,
                        fontSize: 14,

                        borderColor: "#ffffff",
                        borderWidth: 2,

                        background: "#e2e8f0",
                        color: "#475569",
                      },
                    }}
                  >
                    {(dept.members || []).map((initial, index) => (
                      <Avatar
                        key={index}
                        sx={{
                          bgcolor: index === 0 ? color : "#e2e8f0",

                          color: index === 0 ? "#ffffff" : "#475569",

                          fontWeight: 600,
                        }}
                      >
                        {initial}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </Box>
              </Box>
            </Grid>
          );
        })}

        {/* ================= EMPTY STATE ================= */}
        {departments.length === 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "#64748b",
              }}
            >
              <FolderIcon
                sx={{
                  fontSize: 48,
                  color: "#cbd5e1",
                  mb: 1,
                }}
              />

              <Typography fontSize={15} fontWeight={500}>
                No departments found
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Department;
