import { Button, Avatar, IconButton } from "../../components/common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import React, { useEffect, useState } from "react";

import { Box, Typography, Grid, AvatarGroup, Divider } from "@mui/material";

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
        background: themeColors.hover,
        color: themeColors.navyDark,
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
          <Typography fontSize={20} fontWeight={700} color={themeColors.navyDark}>
            Departments
          </Typography>

          <Typography fontSize={14} color={themeColors.textMuted} mt={0.5}>
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

            background: themeColors.purple,

            textTransform: "none",
            fontSize: 14,
            fontWeight: 600,

            borderRadius: "4px",

            boxShadow: "0 4px 6px -1px " + themeColors.overlay3 + ", 0 2px 4px -2px " + themeColors.overlay2,

            "&:hover": {
              background: themeColors.purple,
              boxShadow: "0 4px 6px -1px " + themeColors.overlay3 + ", 0 2px 4px -2px " + themeColors.overlay2,
            },
          }}
        >
          Add Department
        </Button>
      </Box>

      {/* ================= DEPARTMENT GRID ================= */}
      <Grid container spacing={3}>
        {departments.map((dept) => {
          const color = dept.color || themeColors.purple;

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
                  background: "linear-gradient(135deg," + themeColors.pageBg + "," + themeColors.infoSoft + ")",

                  border: "1px solid " + themeColors.border,

                  boxShadow: "0 1px 2px " + themeColors.overlay1 + ", 0 1px 3px " + themeColors.overlay2,

                  transition:
                    "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",

                  "&:hover": {
                    transform: "translateY(-6px) scale(1.015)",

                    boxShadow: "0 4px 6px -1px " + themeColors.overlay3 + ", 0 2px 4px -2px " + themeColors.overlay2,

                    borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
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
                    <Typography fontSize={18} fontWeight={600} color={themeColors.navyDark}>
                      {dept.name}
                    </Typography>
                  </Box>

                  {/* More Button */}
                  <IconButton
                    size="small"
                    sx={{
                      color: themeColors.textMuted,

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
                    color={themeColors.textMuted}
                    textTransform="uppercase"
                    fontWeight={600}
                    letterSpacing={0.5}
                    mb={0.5}
                  >
                    Head of Department
                  </Typography>

                  <Typography fontSize={15} color={themeColors.secondaryDark} fontWeight={500}>
                    {dept.head || "Not Assigned"}
                  </Typography>
                </Box>

                {/* ================= DIVIDER ================= */}
                <Divider
                  sx={{
                    borderColor: themeColors.border,
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
                      color={themeColors.navyDark}
                      lineHeight={1.2}
                    >
                      {dept.count || 0}
                    </Typography>

                    <Typography fontSize={13} color={themeColors.textMuted}>
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

                        borderColor: themeColors.cardBg,
                        borderWidth: 2,

                        background: themeColors.border,
                        color: themeColors.textMuted,
                      },
                    }}
                  >
                    {(dept.members || []).map((initial, index) => (
                      <Avatar
                        key={index}
                        sx={{
                          bgcolor: index === 0 ? color : themeColors.border,

                          color: index === 0 ? themeColors.cardBg : themeColors.textMuted,

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
                color: themeColors.textMuted,
              }}
            >
              <FolderIcon
                sx={{
                  fontSize: 48,
                  color: themeColors.border,
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
