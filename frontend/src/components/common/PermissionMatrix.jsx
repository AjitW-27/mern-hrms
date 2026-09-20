import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const actions = [
  "create",
  "read",
  "update",
  "delete",
  "approve",
  "export",
  "manage",
];

const moduleLabels = {
  dashboard: "Dashboard",
  employees: "Employees",
  departments: "Departments",
  projects: "Projects",
  attendance: "Attendance",
  leave: "Leave Management",
  payroll: "Payroll",
  assets: "Assets",
  expenses: "Expenses",
  recruitment: "Recruitment",
  onboarding: "Onboarding",
  training: "Training",
  performance: "Performance",
  goals: "Goals & KPI",
  users: "Users",
  roles: "Roles",
  organizations: "Organizations",
  notifications: "Notifications",
  settings: "System Settings",
  reports: "Reports",
  audit: "Audit Logs",
  communication: "Communication",
  announcements: "Announcements",
  holidays: "Holidays",
};

const PermissionMatrix = ({ value = {}, onChange }) => {
  /*
   * Always show all available modules.
   * Previously Object.keys(value) was used, which meant that
   * when permissions was empty, no module rows were displayed.
   */
  const modules = Object.keys(moduleLabels);

  const toggle = (moduleKey, action) => {
    const next = {
      ...value,
      [moduleKey]: {
        ...(value?.[moduleKey] || {}),
        [action]: !Boolean(value?.[moduleKey]?.[action]),
      },
    };

    onChange(next);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Access Permissions
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
          }}
        >
          Click ✓ or × to allow or deny access for the selected role.
        </Typography>
      </Box>

      <TableContainer
        sx={{
          overflowX: "auto",
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 900,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  minWidth: 180,
                  position: "sticky",
                  left: 0,
                  zIndex: 2,
                  backgroundColor: "background.paper",
                }}
              >
                Module
              </TableCell>

              {actions.map((action) => (
                <TableCell
                  key={action}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    textTransform: "capitalize",
                    minWidth: 90,
                  }}
                >
                  {action}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {modules.map((moduleKey) => (
              <TableRow key={moduleKey} hover>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    position: "sticky",
                    left: 0,
                    zIndex: 1,
                    backgroundColor: "background.paper",
                  }}
                >
                  {moduleLabels[moduleKey]}
                </TableCell>

                {actions.map((action) => {
                  const allowed = Boolean(value?.[moduleKey]?.[action]);

                  return (
                    <TableCell
                      key={action}
                      align="center"
                      onClick={() => toggle(moduleKey, action)}
                      sx={{
                        cursor: "pointer",
                        userSelect: "none",
                        py: 1,
                        transition: "background-color 0.15s ease",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                      title={
                        allowed
                          ? `Click to remove ${action} access`
                          : `Click to grant ${action} access`
                      }
                    >
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 28,
                          height: 28,
                          borderRadius: "4px",
                        }}
                      >
                        {allowed ? (
                          <CheckRoundedIcon
                            sx={{
                              fontSize: 21,
                            }}
                            aria-label="Allowed"
                          />
                        ) : (
                          <CloseRoundedIcon
                            sx={{
                              fontSize: 21,
                              opacity: 0.55,
                            }}
                            aria-label="Denied"
                          />
                        )}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PermissionMatrix;
