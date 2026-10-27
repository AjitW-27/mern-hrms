import { Button, Card, Badge as Chip, IconButton, Input as TextField } from "../../components/common/UI";
import React, { useEffect, useState } from "react";
import { Box, CardContent, Drawer, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Stack, Typography, Alert } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { fetchCollection } from "../../lib/collections";
import { referenceId, roleValue, userPayload, friendlyUserError } from "../../lib/userForm";
import execReq from "../../lib/execReq";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import LinkEmployeeDialog from "./LinkEmployeeDialog";
import LinkIcon from "@mui/icons-material/Link";

const Users = () => {
  const [loading, setLoading] = useState(true);
  const [linkingUser, setLinkingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [employees, setEmployees] = useState([]), [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNo: "",
    password: "",
    role: "",
    organization: "",
    status: "active",
  });

  const load = async () => {
    setLoading(true); setError("");
    try { const [u, r, o, e] = await Promise.all([
      fetchCollection("/admin/users"), fetchCollection("/admin/roles"), fetchCollection("/organizations"), fetchCollection("/employees")
    ]);
    setUsers(u.map(item => ({ ...item, roleCode: roleValue(item.role, r) }))); setRoles(r); setOrganizations(o); setEmployees(e);
    } catch (err) { setError(friendlyUserError(err, "Unable to load users.")); } finally { setLoading(false); }
  };

  useEffect(() => {
    load().catch(() => {});
    try {
      const current = JSON.parse(localStorage.getItem("hrms_admin_recent") || "[]");
      const next = [{ name: "Users", category: "People & Access", path: "/dashboard/admin/users", time: Date.now() }, ...current.filter((item) => item.path !== "/dashboard/admin/users")].slice(0, 4);
      localStorage.setItem("hrms_admin_recent", JSON.stringify(next));
    } catch {}
  }, []);

  const openCreate = () => {
    setEditing(null);
    setError("");
    setForm({
      name: "",
      email: "",
      mobileNo: "",
      password: "",
      role: roles.find(item => item.code === "employee")?.code || roles.find(item => item.isActive !== false)?.code || "",
      employeeRef: "",
      organization: organizations[0]?._id || "",
      status: "active",
    });
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setError("");
    setForm({
      name: item.name || "",
      email: item.email || "",
      mobileNo: item.mobileNo || "",
      password: "",
      role: roleValue(item.role, roles),
      employeeRef: referenceId(item.employeeRef),
      organization: referenceId(item.organization),
      status: item.isActive === false ? "inactive" : "active",
    });
    setOpen(true);
  };

  const submit = async () => {
    if (saving) return;
    setSaving(true); setError("");
    try {
      const payload = userPayload(form, editing, roles);
      if (editing?._id) await execReq.put(`/admin/users/${editing._id}`, payload);
      else await execReq.post("/admin/users", payload);
      await load();
      setOpen(false);
    } catch (err) {
      setError(friendlyUserError(err));
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    try {
      await execReq.delete(`/admin/users/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to deactivate user.");
    }
  };

  return (
    <Box>
      <PageHeader
        title="Users"
        breadcrumbs={["Administration", "People & Access", "Users"]}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid filterFields={[{ field: "roleCode", label: "Role", options: roles.map(role => ({ value: role.code || role._id, label: role.name })) }]} loading={loading} error={!open ? error : ""} onRetry={load} onRefresh={load} addBtn="Add User" onAddClick={openCreate} rows={users} columns={[
            { field: "name", headerName: "Name" }, { field: "email", headerName: "Email" },
            { field: "mobileNo", headerName: "Mobile" }, { field: "department", headerName: "Department" },
            { field: "role", headerName: "Role", valueGetter: user => roles.find(role => (role.code || role._id) === roleValue(user.role, roles))?.name || roleValue(user.role, roles) || "-" },
            { field: "isActive", headerName: "Status", renderCell: (user) => <Chip label={user.isActive ? "Active" : "Inactive"} size="small" color={user.isActive ? "success" : "error"} /> },
          ]} actions={(user) => <>
            <IconButton size="small" aria-label="Link employee profile" title="Link employee" onClick={() => setLinkingUser(user)}><LinkIcon fontSize="small" /></IconButton>
            <IconButton color="primary" onClick={() => openEdit(user)} size="small" aria-label="Edit user"><EditRoundedIcon fontSize="small" /></IconButton>
            <IconButton color="error" onClick={() => remove(user._id)} size="small" aria-label="Delete user"><DeleteRoundedIcon fontSize="small" /></IconButton>
          </>} />
        </CardContent>
      </Card>
      <LinkEmployeeDialog user={linkingUser} onClose={() => setLinkingUser(null)} onLinked={load} />

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 460 },
            maxWidth: "100%",
            borderLeft: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            {editing ? "Edit User" : "Add User"}
            <Typography sx={{ mt: 0.5, fontSize: 13, fontWeight: 400, color: "text.secondary" }}>
              {editing ? "Update the existing user details." : "Create a new user account."}
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small" aria-label="Close drawer">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ flex: 1, overflowY: "auto" }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile No"
                value={form.mobileNo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, mobileNo: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Role"
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
              >
                {roles.map((role) => (
                  <MenuItem key={role._id} value={role.code || role._id} disabled={role.isActive === false && (role.code || role._id) !== form.role}>
                    {role.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Organization"
                value={form.organization}
                onChange={(e) =>
                  setForm((p) => ({ ...p, organization: e.target.value }))
                }
              >
                <MenuItem value="">Not assigned</MenuItem>
                {organizations.map((organization) => (
                  <MenuItem key={organization._id} value={organization._id}>
                    {organization.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select label="Employee Profile" value={form.employeeRef || ""} helperText="Employee accounts need a profile; matching email addresses link automatically." onChange={event => setForm(previous => ({ ...previous, employeeRef: event.target.value }))}>
                <MenuItem value="">Match by email</MenuItem>
                {employees.filter(employee => !employee.userId || referenceId(employee.userId) === referenceId(editing) || referenceId(employee) === form.employeeRef).map(employee => <MenuItem key={employee._id} value={employee._id}>{employee.fullName} ({employee.employeeId || employee.email})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
              >
                {["active", "inactive"].map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} loading={saving}>
            Save
          </Button>
        </DialogActions>
      </Drawer>
    </Box>
  );
};

export default Users;
