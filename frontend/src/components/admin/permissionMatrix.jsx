import React, { useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
} from "@mui/material";

const ACTIONS = ["create", "read", "update", "delete", "approve", "export"];

const PermissionMatrix = ({
  permissions = [],
  selectedPermissions = [],
  onChange,
}) => {
  const groupedPermissions = useMemo(() => {
    const modules = {};

    permissions.forEach((permission) => {
      if (!modules[permission.module]) {
        modules[permission.module] = {};
      }

      modules[permission.module][permission.action] = permission._id;
    });

    return modules;
  }, [permissions]);

  const handlePermissionToggle = (permissionId) => {
    if (selectedPermissions.includes(permissionId)) {
      onChange(selectedPermissions.filter((id) => id !== permissionId));
    } else {
      onChange([...selectedPermissions, permissionId]);
    }
  };

  const handleModuleToggle = (modulePermissions) => {
    const permissionIds = Object.values(modulePermissions);

    const allSelected = permissionIds.every((id) =>
      selectedPermissions.includes(id),
    );

    if (allSelected) {
      onChange(selectedPermissions.filter((id) => !permissionIds.includes(id)));
    } else {
      const merged = [...new Set([...selectedPermissions, ...permissionIds])];

      onChange(merged);
    }
  };

  return (
    <Paper elevation={0}>
      <Box p={2}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Permission Matrix
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Module</strong>
                </TableCell>

                {ACTIONS.map((action) => (
                  <TableCell key={action} align="center">
                    <strong>{action.toUpperCase()}</strong>
                  </TableCell>
                ))}

                <TableCell align="center">
                  <strong>ALL</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {Object.entries(groupedPermissions).map(
                ([module, modulePermissions]) => (
                  <TableRow key={module}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {module}
                    </TableCell>

                    {ACTIONS.map((action) => {
                      const permissionId = modulePermissions[action];

                      return (
                        <TableCell key={action} align="center">
                          {permissionId ? (
                            <Checkbox
                              checked={selectedPermissions.includes(
                                permissionId,
                              )}
                              onChange={() =>
                                handlePermissionToggle(permissionId)
                              }
                            />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      );
                    })}

                    <TableCell align="center">
                      <Checkbox
                        checked={Object.values(modulePermissions).every((id) =>
                          selectedPermissions.includes(id),
                        )}
                        onChange={() => handleModuleToggle(modulePermissions)}
                      />
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default PermissionMatrix;
