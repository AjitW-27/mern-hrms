import { Input as TextField, Button, Avatar, Badge as Chip } from "../../components/common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import React, { useState, useEffect } from "react";
import { Box, Typography, InputAdornment, Grid, Divider } from "@mui/material";
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
        background: themeColors.pageBg,
        // minHeight: "100vh",
        color: themeColors.navyDark,
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
              background: themeColors.textPrimary,

              "& fieldset": {
                border: "1px solid " + themeColors.secondaryDark,
              },

              "&:hover fieldset": {
                borderColor: themeColors.textMuted,
              },

              "&.Mui-focused fieldset": {
                borderColor: themeColors.purple,
              },
            },

            "& input": {
              color: themeColors.cardBg,
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
            background: themeColors.purple,
            color: themeColors.cardBg,
            textTransform: "none",
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: "nowrap",
            boxShadow: "none",

            "&:hover": {
              background: themeColors.purple,
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
                background: "linear-gradient(135deg," + themeColors.navyDark + "," + themeColors.primary + "," + themeColors.info + ")",
                border: "1px solid " + themeColors.secondaryDark,
                boxShadow:
                  "0 24px 44px -12px " + themeColors.overlay6 + ", 0 4px 16px -4px " + themeColors.overlay7,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  borderColor: themeColors.purple,
                  boxShadow:
                    "0 10px 15px -3px " + themeColors.overlay5 + ", 0 4px 6px -4px " + themeColors.overlay1,
                },
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    mr: 2,
                    bgcolor: themeColors.purple,
                    fontSize: 24,
                  }}
                >
                  {emp.fullName?.[0]}
                </Avatar>
                <Box>
                  <Typography
                    fontWeight="bold"
                    color={themeColors.border}
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

              <Divider sx={{ borderColor: themeColors.secondaryDark, my: 2 }} />

              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <BadgeIcon sx={{ fontSize: 18, color: "none" }} />
                  <Typography fontSize={13} color={themeColors.border}>
                    {emp.employeeId || "N/A"}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon sx={{ fontSize: 18, color: "none" }} />
                  <Typography fontSize={13} color={themeColors.border} noWrap>
                    {emp.email}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" gap={1} mt={3}>
                <Chip
                  label={emp.department}
                  size="small"
                  sx={{
                    bgcolor: themeColors.overlay31,
                    color: themeColors.border,
                    fontWeight: "bold",
                  }}
                />
                <Chip
                  label={emp.role}
                  size="small"
                  sx={{
                    bgcolor: themeColors.overlay32,
                    color: themeColors.textLight,
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
