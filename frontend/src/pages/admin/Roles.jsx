import React, { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import api from "../../lib/api";
import PageHeader from "../../components/common/PageHeader";
import PermissionMatrix from "../../components/common/PermissionMatrix";


const clonePermissions = (permissions) => JSON.parse(JSON.stringify(permissions));

const defaultPermissions = {
  dashboard: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  employees: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  departments: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  projects: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  attendance: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  payroll: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  onboarding: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  training: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  performance: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  goals: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  assets: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  expenses: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  reports: { create: false, read: true, update: false, delete: false, approve: false, export: true },
  auditLogs: { create: false, read: false, update: false, delete: false, approve: false, export: false },
  branches: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  shifts: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  leavePolicies: { create: false, read: true, update: false, delete: false, approve: false, export: false },
  admin: { create: false, read: false, update: false, delete: false, approve: false, export: false }
};

const RoleEditor = ({ roles, onRefresh }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", permissions: clonePermissions(defaultPermissions) });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", permissions: clonePermissions(defaultPermissions) });
    setOpen(true);
  };

  const openEdit = (role) => {
    const permissions = clonePermissions(defaultPermissions);
    const incoming = role.permissions || {};
    Object.keys(incoming).forEach((key) => {
      permissions[key] = { ...permissions[key], ...(incoming[key] || {}) };
    });
    setEditing(role);
    setForm({ name: role.name || "", description: role.description || "", permissions });
    setOpen(true);
  };

  const submit = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      permissions: form.permissions
    };
    if (editing?._id) await api.put(`/admin/roles/${editing._id}`, payload);
    else await api.post("/admin/roles", payload);
    await onRefresh();
    setOpen(false);
  };

  const remove = async (id) => {
    await api.delete(`/admin/roles/${id}`);
    await onRefresh();
  };

  return (
    <Box>
      <PageHeader title="Admin Roles" description="Define structured permission sets for every user group." actionLabel="Add Role" onAction={openCreate} actionIcon={AddRoundedIcon} />
      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role._id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{role.name}</TableCell>
                  <TableCell>{role.description || "—"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => openEdit(role)} size="small"><EditRoundedIcon fontSize="inherit" /></IconButton>
                      <IconButton onClick={() => remove(role._id)} size="small"><DeleteRoundedIcon fontSize="inherit" /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle sx={{ fontWeight: 800 }}>{editing ? "Edit Role" : "Add Role"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1, mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Role Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </Grid>
          </Grid>
          <PermissionMatrix value={form.permissions} onChange={(permissions) => setForm((p) => ({ ...p, permissions }))} />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit}>Save</Button>
        </DialogActions>
      </Dialog>
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
