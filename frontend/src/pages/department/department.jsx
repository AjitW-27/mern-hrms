import React, { useEffect } from "react";
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
  const [departments, setDepartments] = React.useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/departments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();
        setDepartments(Array.isArray(data) ? data : data.departments || []);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
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
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography fontSize={24} fontWeight="bold" color="#fff">
            Departments
          </Typography>
          <Typography fontSize={14} color="#94a3b8" mt={0.5}>
            Manage your organization's departments and teams
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/dashboard/add-department")}
          sx={{
            background: "#8b5cf6",
            textTransform: "none",
            fontWeight: "bold",
            borderRadius: "10px",
            px: 3,
            py: 1,
            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
            "&:hover": {
              background: "#7c3aed",
            },
          }}
        >
          Add Department
        </Button>
      </Box>

      {/* Grid */}
      <Grid container spacing={3}>
        {departments.map((dept) => {
          const color = dept.color || "#8b5cf6";

          return (
            <Grid item xs={12} sm={6} md={4} key={dept._id}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  background: "#131826",
                  border: "1px solid #1e293b",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                    borderColor: color,
                  },
                }}
              >
                {/* Header */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={3}
                >
                  <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        background: `${color}20`,
                        color: color,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mr: 2,
                      }}
                    >
                      <FolderIcon fontSize="small" />
                    </Box>
                    <Typography fontSize={18} fontWeight="bold">
                      {dept.name}
                    </Typography>
                  </Box>
                  <IconButton sx={{ color: "#94a3b8" }} size="small">
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {/* Head */}
                <Box mb={3}>
                  <Typography
                    fontSize={12}
                    color="#64748b"
                    textTransform="uppercase"
                    fontWeight="bold"
                    letterSpacing={0.5}
                    mb={0.5}
                  >
                    Head of Department
                  </Typography>
                  <Typography fontSize={15} color="#e2e8f0" fontWeight={500}>
                    {dept.head || "Not Assigned"}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: "#1e293b", mb: 2 }} />

                {/* Footer */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      fontSize={20}
                      fontWeight="bold"
                      color="#fff"
                      lineHeight={1.2}
                    >
                      {dept.count || 0}
                    </Typography>
                    <Typography fontSize={13} color="#94a3b8">
                      Employees
                    </Typography>
                  </Box>

                  <AvatarGroup
                    max={4}
                    sx={{
                      "& .MuiAvatar-root": {
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        borderColor: "#131826",
                        borderWidth: 2,
                        background: "#334155",
                      },
                    }}
                  >
                    {(dept.members || []).map((initial, index) => (
                      <Avatar
                        key={index}
                        sx={{
                          bgcolor: index === 0 ? color : "#334155",
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
      </Grid>
    </Box>
  );
};

export default Department;
