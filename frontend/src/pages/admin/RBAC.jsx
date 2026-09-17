import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
  Alert,
} from "@mui/material";

import PageHeader from "../../components/common/PageHeader";
import PermissionMatrix from "../../components/common/PermissionMatrix";
import api from "../../lib/api";

import useAuthStore from "../../strore/authStore";

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const Access = () => {
  const { user, setUser } = useAuthStore();

  const [roles, setRoles] = useState([]);

  const [roleId, setRoleId] = useState("");

  const [permissions, setPermissions] = useState({});

  const [rbacEnabled, setRbacEnabled] = useState(false);

  const [saving, setSaving] = useState(false);

  const [savingSetting, setSavingSetting] = useState(false);

  const [loadingRoles, setLoadingRoles] = useState(true);

  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const selectedRole = roles.find(
    (role) => String(role._id) === String(roleId),
  );

  /*
  |--------------------------------------------------------------------------
  | Load Roles
  |--------------------------------------------------------------------------
  */

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      setError("");

      const response = await api.get("/admin/roles");

      const roleList = response?.data?.data || response?.data?.roles || [];

      setRoles(roleList);

      /*
      |--------------------------------------------------------------------------
      | Select first role if nothing selected
      |--------------------------------------------------------------------------
      */

      if (roleList.length > 0) {
        setRoleId((currentId) => {
          if (currentId) {
            const exists = roleList.some(
              (role) => String(role._id) === String(currentId),
            );

            if (exists) {
              return currentId;
            }
          }

          return roleList[0]._id;
        });
      }
    } catch (err) {
      console.error("Failed to load roles:", err);

      setError(err?.response?.data?.message || "Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Load Settings
  |--------------------------------------------------------------------------
  */

  const loadSettings = async () => {
    try {
      const response = await api.get("/settings");

      const enabled =
        response?.data?.data?.rbacEnabled === true ||
        response?.data?.rbacEnabled === true;

      setRbacEnabled(enabled);

      /*
      |--------------------------------------------------------------------------
      | Cache RBAC state
      |--------------------------------------------------------------------------
      */

      localStorage.setItem("hrms_rbac_enabled", String(enabled));
    } catch (err) {
      console.error("Failed to load RBAC settings:", err);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Load Selected Role Permissions
  |--------------------------------------------------------------------------
  */

  const loadRole = async (id) => {
    if (!id) {
      setPermissions({});
      return;
    }

    try {
      setLoadingPermissions(true);
      setError("");

      const response = await api.get(`/rbac/roles/${id}`);

      const roleData =
        response?.data?.data || response?.data?.role || response?.data || {};

      const rolePermissions = roleData?.permissions || {};

      setPermissions(rolePermissions);
    } catch (err) {
      console.error("Failed to load role permissions:", err);

      setError(
        err?.response?.data?.message || "Failed to load role permissions",
      );

      setPermissions({});
    } finally {
      setLoadingPermissions(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    Promise.all([loadRoles(), loadSettings()]);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load Permissions When Role Changes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (roleId) {
      loadRole(roleId);
    }
  }, [roleId]);

  /*
  |--------------------------------------------------------------------------
  | Save Permissions
  |--------------------------------------------------------------------------
  */

  const save = async () => {
    if (!roleId) {
      setError("Please select a role");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      /*
      |--------------------------------------------------------------------------
      | Save to Backend
      |--------------------------------------------------------------------------
      */

      const response = await api.patch(`/rbac/roles/${roleId}/permissions`, {
        permissions,
      });

      /*
      |--------------------------------------------------------------------------
      | Get permissions returned by backend
      |--------------------------------------------------------------------------
      */

      const savedPermissions =
        response?.data?.data?.permissions ||
        response?.data?.permissions ||
        permissions;

      /*
      |--------------------------------------------------------------------------
      | Update Permission Matrix UI
      |--------------------------------------------------------------------------
      */

      setPermissions(savedPermissions);

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT:
      | Update logged-in user's permissions immediately
      |--------------------------------------------------------------------------
      |
      | If the role being edited is the currently logged-in
      | user's role, update Zustand + localStorage.
      |
      | This makes Sidebar re-render immediately.
      |
      */

      const currentUserRole = normalizeRole(user?.role);

      const selectedRoleCode = normalizeRole(
        selectedRole?.code || selectedRole?.name || selectedRole?.role,
      );

      if (
        currentUserRole &&
        selectedRoleCode &&
        currentUserRole === selectedRoleCode
      ) {
        const updatedUser = {
          ...user,
          rolePermissions: savedPermissions,
        };

        setUser(updatedUser);
      }

      /*
      |--------------------------------------------------------------------------
      | Store RBAC state
      |--------------------------------------------------------------------------
      */

      localStorage.setItem("hrms_rbac_enabled", String(rbacEnabled));

      /*
      |--------------------------------------------------------------------------
      | Tell Sidebar that permissions changed
      |--------------------------------------------------------------------------
      |
      | Sidebar listens to this event and immediately
      | recalculates its menu.
      |
      */

      window.dispatchEvent(new CustomEvent("hrms-rbac-updated"));

      setMessage("Permissions updated successfully.");
    } catch (err) {
      console.error("Failed to save permissions:", err);

      setError(err?.response?.data?.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RBAC Enable / Disable
  |--------------------------------------------------------------------------
  */

  const changeRbacMode = async (event) => {
    const enabled = event.target.checked;

    try {
      setSavingSetting(true);
      setError("");
      setMessage("");

      const response = await api.put("/settings", {
        rbacEnabled: enabled,
      });

      /*
      |--------------------------------------------------------------------------
      | Use backend response if available
      |--------------------------------------------------------------------------
      */

      const nextEnabled =
        response?.data?.data?.rbacEnabled !== undefined
          ? response.data.data.rbacEnabled === true
          : response?.data?.rbacEnabled !== undefined
            ? response.data.rbacEnabled === true
            : enabled;

      /*
      |--------------------------------------------------------------------------
      | Update local UI
      |--------------------------------------------------------------------------
      */

      setRbacEnabled(nextEnabled);

      /*
      |--------------------------------------------------------------------------
      | Cache value
      |--------------------------------------------------------------------------
      */

      localStorage.setItem("hrms_rbac_enabled", String(nextEnabled));

      /*
      |--------------------------------------------------------------------------
      | Immediately notify Sidebar
      |--------------------------------------------------------------------------
      */

      window.dispatchEvent(new CustomEvent("hrms-rbac-updated"));

      setMessage(
        nextEnabled
          ? "RBAC enabled successfully."
          : "RBAC disabled successfully.",
      );
    } catch (err) {
      console.error("Failed to update RBAC mode:", err);

      setError(err?.response?.data?.message || "Failed to update RBAC mode");
    } finally {
      setSavingSetting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Permission Change
  |--------------------------------------------------------------------------
  */

  const handlePermissionChange = (nextPermissions) => {
    setPermissions(nextPermissions);

    /*
    |--------------------------------------------------------------------------
    | Clear old messages
    |--------------------------------------------------------------------------
    */

    if (message) {
      setMessage("");
    }

    if (error) {
      setError("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loadingRoles) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <Box>
      <PageHeader
        title="Access Control"
        subtitle="Manage role-based access and permissions"
      />

      {/* Alerts */}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {/* RBAC Settings */}

      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                Role Based Access Control
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Enable or disable permission based access throughout the HRMS.
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={rbacEnabled}
                  onChange={changeRbacMode}
                  disabled={savingSetting}
                />
              }
              label={rbacEnabled ? "Enabled" : "Disabled"}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Role Selection */}

      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 600,
            }}
          >
            Select Role
          </Typography>

          <FormControl
            fullWidth
            sx={{
              maxWidth: 400,
            }}
          >
            <Select
              value={roleId}
              onChange={(event) => setRoleId(event.target.value)}
              displayEmpty
            >
              {roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name || role.code || role.role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Permission Matrix */}

      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                }}
              >
                Permissions
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Configure module access for the selected role.
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={save}
              disabled={saving || loadingPermissions || !roleId}
            >
              {saving ? (
                <>
                  <CircularProgress size={18} sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : (
                "Save Permissions"
              )}
            </Button>
          </Box>

          {loadingPermissions ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 5,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <PermissionMatrix
              value={permissions}
              onChange={handlePermissionChange}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Access;
