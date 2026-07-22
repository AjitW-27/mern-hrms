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

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await response.json();
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
        <Typography fontSize={28} fontWeight="bold">
          Employees Details
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/dashboard/add-employee")}
          sx={{
            background: "#8b5cf6",
            textTransform: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            px: 3,
            "&:hover": { background: "#7c3aed" },
          }}
        >
          Add Employee
        </Button>
      </Box>

      {/* Search */}
      <Box mb={4}>
        <TextField
          fullWidth
          placeholder="Search by name, ID, or department..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            background: "#1e293b",
            borderRadius: "12px",
            input: { color: "#fff" },
            "& fieldset": { border: "1px solid #334155" },
            "&:hover fieldset": { borderColor: "#64748b" },
            "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
          }}
        />
      </Box>

      {/* Employee Grid */}
      <Grid container spacing={3}>
        {filteredEmployees.map((emp) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={emp._id}>
            <Box
              onClick={() => navigate(`/dashboard/employee/${emp._id}`)}
              sx={{
                p: 3,
                borderRadius: "16px",
                background: "linear-gradient(145deg, #1e293b, #131826)",
                border: "1px solid #334155",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  borderColor: "#8b5cf6",
                  boxShadow: "0 15px 35px rgba(139, 92, 246, 0.2)",
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
                  <Typography fontWeight="bold" fontSize={18} noWrap>
                    {emp.fullName}
                  </Typography>
                  <Typography fontSize={13} color="#94a3b8" noWrap>
                    {emp.designation}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "#334155", my: 2 }} />

              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <BadgeIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                  <Typography fontSize={13} color="#cbd5f5">
                    {emp.employeeId || "N/A"}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                  <Typography fontSize={13} color="#cbd5f5" noWrap>
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
                    color: "#c4b5fd",
                    fontWeight: "bold",
                  }}
                />
                <Chip
                  label={emp.role}
                  size="small"
                  sx={{
                    bgcolor: "rgba(56, 189, 248, 0.15)",
                    color: "#7dd3fc",
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
