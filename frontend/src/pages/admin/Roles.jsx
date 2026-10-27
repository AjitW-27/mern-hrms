import { Button, Card, IconButton, Input as TextField } from "../../components/common/UI";
import { colors as themeColors } from "../../theme/designTokens";
import React, { useEffect, useState } from "react";
import { Alert, Box, Drawer, Grid, MenuItem, Stack, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import execReq from "../../lib/execReq";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";

const defaultRoleForm = { name: "", code: "", description: "" };

const RoleEditor = ({ roles, onRefresh, loading, loadError }) => {
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
      code: role.code || "",
      description: role.description || "",
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    setError("");
  };

  const generateCode = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const name = form.name.trim();
      const payload = {
        name,
        code: form.code.trim(),
        description: form.description.trim(),
      };
      if (editing?._id) {
        if (editing.isSystemRole) {
          throw new Error("System roles can only have their status changed from the table.");
        } else {
          await execReq.put(`/admin/roles/${editing._id}`, payload);
        }
      } else await execReq.post("/admin/roles", payload);
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
      await execReq.patch(`/admin/roles/${role._id}/status`, { isActive });
      await onRefresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update role status.");
    }
  };

  const remove = async (id) => {
    try {
      await execReq.delete(`/admin/roles/${id}`);
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
      />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Card>
        <DataGrid
          loading={loading} error={loadError} onRetry={onRefresh} onRefresh={onRefresh} addBtn="Add Role" onAddClick={openCreate}
          minWidth={900}
          rows={roles}
          columns={[
            { field: "name", headerName: "Role Name", renderCell: (role) => <Typography fontWeight={700} textTransform="capitalize">{role.name}</Typography> },
            { field: "code", headerName: "Role Code" },
            { field: "description", headerName: "Description", nowrap: false, valueGetter: (role) => role.description || "—" },
            { field: "status", headerName: "Status", valueGetter: (role) => role.isActive !== false ? "Active" : "Inactive", renderCell: (role) => <Typography sx={{ fontSize: 12, fontWeight: 700, color: role.isActive !== false ? themeColors.secondaryDark : themeColors.primary }}>{role.isActive !== false ? "Active" : "Inactive"}</Typography> },
          ]}
          actions={(role) => <>
            <TextField select size="small" value={role.isActive !== false ? "active" : "inactive"} onChange={(e) => updateStatus(role, e.target.value)} sx={{ minWidth: 108 }} aria-label="Role status"><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem></TextField>
            {!role.isSystemRole && <IconButton onClick={() => openEdit(role)} size="small" aria-label="Edit role"><EditRoundedIcon fontSize="inherit" /></IconButton>}
            <IconButton onClick={() => remove(role._id)} size="small" color="error" aria-label="Deactivate role"><DeleteRoundedIcon fontSize="inherit" /></IconButton>
          </>}
        />
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
                  label="Role Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      name: e.target.value,
                      code: p.code || generateCode(e.target.value),
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role Code"
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  placeholder="hr_manager"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  minRows={4}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the purpose of this role."
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, p: 2.25, borderTop: "1px solid", borderColor: "divider" }}>
            <Button onClick={close}>Cancel</Button>
            <Button variant="contained" onClick={submit} disabled={saving || !form.name.trim() || !form.code.trim()}>
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
  const [loading, setLoading] = useState(true), [loadError, setLoadError] = useState("");

  const load = async () => { setLoading(true); setLoadError(""); try { const { data } = await execReq("/admin/roles"); setRoles(data.data || []); } catch (err) { setLoadError(err?.response?.data?.message || "Unable to load roles."); } finally { setLoading(false); } };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return <RoleEditor roles={roles} onRefresh={load} loading={loading} loadError={loadError} />;
};

export default Roles;
