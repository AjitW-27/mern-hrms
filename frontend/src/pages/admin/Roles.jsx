import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Drawer,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import api from "../../lib/api";
import PageHeader from "../../components/common/PageHeader";

const defaultRoleForm = { name: "", isActive: true };

const RoleEditor = ({ roles, onRefresh }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultRoleForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setError("");
    setForm(defaultRoleForm);
    setOpen(true);
  };

  const openEdit = (role) => {
    setEditing(role);
    setError("");
    setForm({
      name: role.name || "",
      isActive: role.isActive !== false,
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    setError("");
  };

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const name = form.name.trim();
      const payload = {
        name,
        isActive: form.isActive !== false,
      };
      if (editing?._id) {
        if (editing.isSystemRole) {
          await api.patch(`/admin/roles/${editing._id}/status`, { isActive: payload.isActive });
        } else {
          await api.put(`/admin/roles/${editing._id}`, payload);
        }
      } else await api.post("/admin/roles", payload);
      await onRefresh();
      close();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save role.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (role, value) => {
    const isActive = value === "active";
    try {
      await api.patch(`/admin/roles/${role._id}/status`, { isActive });
      await onRefresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update role status.");
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/admin/roles/${id}`);
      await onRefresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to deactivate role.");
    }
  };

  return (
    <Box>
      <PageHeader
        title="Roles"
        description="Create and manage role names and role status. Access permissions are managed separately."
        actionLabel="Add Role"
        onAction={openCreate}
        actionIcon={AddRoundedIcon}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Card>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 280 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role._id} hover>
                  <TableCell sx={{ fontWeight: 700, textTransform: "capitalize" }}>
                    {role.name}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <TextField
                        select
                        size="small"
                        value={role.isActive !== false ? "active" : "inactive"}
                        onChange={(e) => updateStatus(role, e.target.value)}
                        sx={{ minWidth: 125 }}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </TextField>
                      <IconButton onClick={() => openEdit(role)} size="small" aria-label="Edit role">
                        <EditRoundedIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton onClick={() => remove(role._id)} size="small" color="error" aria-label="Deactivate role">
                        <DeleteRoundedIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Drawer
        anchor="right"
        open={open}
        onClose={close}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 520 },
            p: 0,
            borderLeft: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ p: 2.25, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                {editing ? "Edit Role" : "Add Role"}
              </Typography>
              <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 13 }}>
                {editing ? "Update the existing role details." : "Create a new role."}
              </Typography>
            </Box>
            <IconButton onClick={close} size="small" aria-label="Close drawer">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={form.isActive ? "active" : "inactive"}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === "active" }))}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, p: 2.25, borderTop: "1px solid", borderColor: "divider" }}>
            <Button onClick={close}>Cancel</Button>
            <Button variant="contained" onClick={submit} disabled={saving || !form.name.trim()}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

const Roles = () => {
  const [roles, setRoles] = useState([]);

  const load = async () => {
    const { data } = await api.get("/admin/roles");
    setRoles(data.data || []);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return <RoleEditor roles={roles} onRefresh={load} />;
};

export default Roles;
