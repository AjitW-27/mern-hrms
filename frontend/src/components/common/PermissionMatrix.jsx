import React from "react";
import { Box, Checkbox, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

const actions = ["create", "read", "update", "delete", "approve", "export"];

const PermissionMatrix = ({ value = {}, onChange }) => {
  const modules = Object.keys(value);

  const toggle = (moduleKey, action) => {
    const next = {
      ...value,
      [moduleKey]: {
        ...value[moduleKey],
        [action]: !value[moduleKey]?.[action]
      }
    };
    onChange(next);
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
      <Box sx={{ px: 2, py: 1.5, bgcolor: "background.paper" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          Permissions
        </Typography>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
            {actions.map((action) => (
              <TableCell key={action} align="center" sx={{ fontWeight: 700, textTransform: "capitalize" }}>
                {action}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {modules.map((moduleKey) => (
            <TableRow key={moduleKey} hover>
              <TableCell sx={{ fontWeight: 600 }}>{moduleKey}</TableCell>
              {actions.map((action) => (
                <TableCell key={action} align="center">
                  <Checkbox checked={Boolean(value[moduleKey]?.[action])} onChange={() => toggle(moduleKey, action)} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default PermissionMatrix;
