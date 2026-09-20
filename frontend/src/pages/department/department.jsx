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
import execReq from "../../lib/execReq";

const Department = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await execReq("/departments");
      const data = response.data;

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
        background: "#F8FAFC",
        color: "#0F172A",
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
          <Typography fontSize={20} fontWeight={700} color="#0F172A">
            Departments
          </Typography>

          <Typography fontSize={14} color="#64748B" mt={0.5}>
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

            borderRadius: "4px",

            boxShadow: "0 4px 6px -1px rgba(15,23,42,.07), 0 2px 4px -2px rgba(15,23,42,.05)",

            "&:hover": {
              background: "#8B5CF6",
              boxShadow: "0 4px 6px -1px rgba(15,23,42,.07), 0 2px 4px -2px rgba(15,23,42,.05)",
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

                  borderRadius: "4px",

                  /*
                   * Soft pastel gradient
                   * Department color is used only
                   * as a very light background glow.
                   */
                  background: "linear-gradient(135deg,#F5F6FF,#E0E4FF)",

                  border: "1px solid #E2E8F0",

                  boxShadow: "0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.05)",

                  transition:
                    "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",

                  "&:hover": {
                    transform: "translateY(-6px) scale(1.015)",

                    boxShadow: "0 4px 6px -1px rgba(15,23,42,.07), 0 2px 4px -2px rgba(15,23,42,.05)",

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

                        borderRadius: "4px",

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
                    <Typography fontSize={18} fontWeight={600} color="#0F172A">
                      {dept.name}
                    </Typography>
                  </Box>

                  {/* More Button */}
                  <IconButton
                    size="small"
                    sx={{
                      color: "#64748B",

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
                    color="#64748B"
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
                    borderColor: "#E2E8F0",
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
                      color="#0F172A"
                      lineHeight={1.2}
                    >
                      {dept.count || 0}
                    </Typography>

                    <Typography fontSize={13} color="#64748B">
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

                        borderColor: "#FFFFFF",
                        borderWidth: 2,

                        background: "#E2E8F0",
                        color: "#475569",
                      },
                    }}
                  >
                    {(dept.members || []).map((initial, index) => (
                      <Avatar
                        key={index}
                        sx={{
                          bgcolor: index === 0 ? color : "#E2E8F0",

                          color: index === 0 ? "#FFFFFF" : "#475569",

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
                color: "#64748B",
              }}
            >
              <FolderIcon
                sx={{
                  fontSize: 48,
                  color: "#CBD5E1",
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
