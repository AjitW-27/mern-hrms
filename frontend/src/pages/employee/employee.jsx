import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Grid,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import execReq from "../../lib/execReq";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const response = await execReq("/employees");
      const result = response.data;
      if (result.success && Array.isArray(result.data)) {
        setEmployees(result.data);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees based on search
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      emp.department?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box
      sx={{
        p: { xs: 1, md: 1 },
        background: "#F4F7FA",
        // minHeight: "100vh",
        color: "#0F172A",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
          width: "100%",
        }}
      >
        {/* Search - Left */}
        <TextField
          placeholder="Search by name, ID, or department..."
          variant="outlined"
          size="medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "none", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: "100%",
            maxWidth: "520px",

            "& .MuiOutlinedInput-root": {
              height: 44,
              borderRadius: "4px",
              background: "#1E293B",

              "& fieldset": {
                border: "1px solid #334155",
              },

              "&:hover fieldset": {
                borderColor: "#64748B",
              },

              "&.Mui-focused fieldset": {
                borderColor: "#8b5cf6",
              },
            },

            "& input": {
              color: "#FFFFFF",
              fontSize: 14,
            },

            "& input::placeholder": {
              color: "none",
              opacity: 1,
            },
          }}
        />

        {/* Button - Right */}
        <Button
          variant="contained"
          size="medium"
          startIcon={<AddIcon />}
          onClick={() => navigate("/dashboard/add-employee")}
          sx={{
            height: 44,
            px: 2.5,
            borderRadius: "4px",
            background: "#8b5cf6",
            color: "#FFFFFF",
            textTransform: "none",
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: "nowrap",
            boxShadow: "none",

            "&:hover": {
              background: "#8B5CF6",
              boxShadow: "none",
            },
          }}
        >
          Add Employee
        </Button>
      </Box>

      {/* Employee Grid */}
      <Grid container spacing={3}>
        {filteredEmployees.map((emp) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={emp._id}>
            <Box
              onClick={() => navigate(`/dashboard/employee/${emp._id}`)}
              sx={{
                p: 3,
                borderRadius: "4px",
                background: "linear-gradient(135deg,#062B31,#0B7480,#4F46E5)",
                border: "1px solid #334155",
                boxShadow:
                  "0 24px 44px -12px rgba(15,23,42,.22), 0 4px 16px -4px rgba(15,23,42,.08)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  borderColor: "#8b5cf6",
                  boxShadow:
                    "0 10px 15px -3px rgba(15,23,42,.10), 0 4px 6px -4px rgba(15,23,42,.06)",
                },
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    mr: 2,
                    bgcolor: "#8b5cf6",
                    fontSize: 24,
                  }}
                >
                  {emp.fullName?.[0]}
                </Avatar>
                <Box>
                  <Typography
                    fontWeight="bold"
                    color="#E2E8F0"
                    fontSize={18}
                    noWrap
                  >
                    {emp.fullName}
                  </Typography>
                  <Typography fontSize={13} color="none" noWrap>
                    {emp.designation}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "#334155", my: 2 }} />

              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <BadgeIcon sx={{ fontSize: 18, color: "none" }} />
                  <Typography fontSize={13} color="#C7CDFE">
                    {emp.employeeId || "N/A"}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon sx={{ fontSize: 18, color: "none" }} />
                  <Typography fontSize={13} color="#C7CDFE" noWrap>
                    {emp.email}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" gap={1} mt={3}>
                <Chip
                  label={emp.department}
                  size="small"
                  sx={{
                    bgcolor: "rgba(139, 92, 246, 0.15)",
                    color: "#C7CDFE",
                    fontWeight: "bold",
                  }}
                />
                <Chip
                  label={emp.role}
                  size="small"
                  sx={{
                    bgcolor: "rgba(14, 165, 233, 0.15)",
                    color: "#55C0C9",
                    textTransform: "capitalize",
                  }}
                />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Employee;
