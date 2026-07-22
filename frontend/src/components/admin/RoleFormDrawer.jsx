import React, { useEffect, useState } from "react";

import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
} from "@mui/material";

import PermissionMatrix from "./PermissionMatrix";

const RoleFormDrawer = ({
  open,
  onClose,
  role,
  permissions,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    permissions: [],
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || "",
        code: role.code || "",
        description: role.description || "",
        permissions:
          role.permissions?.map((permission) => permission._id || permission) ||
          [],
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        permissions: [],
      });
    }
  }, [role]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const generateCode = (value) => {
    return value
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 700,
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          {role ? "Edit Role" : "Create Role"}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={3}>
          <TextField
            label="Role Name"
            fullWidth
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
                code: generateCode(e.target.value),
              })
            }
          />

          <TextField
            label="Role Code"
            fullWidth
            value={formData.code}
            onChange={(e) =>
              setFormData({
                ...formData,
                code: e.target.value,
              })
            }
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
          />

          <PermissionMatrix
            permissions={permissions}
            selectedPermissions={formData.permissions}
            onChange={(updated) =>
              setFormData({
                ...formData,
                permissions: updated,
              })
            }
          />
        </Stack>

        <Box
          sx={{
            mt: "auto",
            pt: 3,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {role ? "Update Role" : "Create Role"}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default RoleFormDrawer;
