import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import execReq from "../../lib/execReq";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [organizations, setOrganizations] = useState([]);
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
    const [u, r, o] = await Promise.all([
      execReq("/admin/users"),
      execReq("/admin/roles"),
      execReq("/admin/organization"),
    ]);
    setUsers(u.data.data || []);
    setRoles(r.data.data || []);
    setOrganizations(o.data.data ? [o.data.data] : []);
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
      role: roles.find((item) => item.isActive !== false)?.code || "employee",
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
      role: item.role?.code || item.role || "employee",
      organization: item.organization?._id || item.organization || "",
      status: item.status || "active",
    });
    setOpen(true);
  };

  const submit = async () => {
    try {
      const payload = { ...form, isActive: form.status === "active" };
      delete payload.status;
      if (!payload.password) delete payload.password;
      if (editing?._id) await execReq.put(`/admin/users/${editing._id}`, payload);
      else await execReq.post("/admin/users", payload);
      await load();
      setOpen(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save user.");
    }
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
        actionLabel="Add User"
        onAction={openCreate}
        actionIcon={AddRoundedIcon}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid rows={users} columns={[
            { field: "name", headerName: "Name" }, { field: "email", headerName: "Email" },
            { field: "mobileNo", headerName: "Mobile" }, { field: "department", headerName: "Department" },
            { field: "role", headerName: "Role", valueGetter: (user) => user.role?.name || user.role || "-" },
            { field: "isActive", headerName: "Status", renderCell: (user) => <Chip label={user.isActive ? "Active" : "Inactive"} size="small" color={user.isActive ? "success" : "error"} /> },
          ]} actions={(user) => <>
            <IconButton color="primary" onClick={() => openEdit(user)} size="small" aria-label="Edit user"><EditRoundedIcon fontSize="small" /></IconButton>
            <IconButton color="error" onClick={() => remove(user._id)} size="small" aria-label="Delete user"><DeleteRoundedIcon fontSize="small" /></IconButton>
          </>} />
        </CardContent>
      </Card>

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
                {roles.filter((role) => role.isActive !== false || role.code === form.role).map((role) => (
                  <MenuItem key={role._id} value={role.code || role._id}>
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
                {organizations.map((organization) => (
                  <MenuItem key={organization._id} value={organization._id}>
                    {organization.name}
                  </MenuItem>
                ))}
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
          <Button variant="contained" onClick={submit}>
            Save
          </Button>
        </DialogActions>
      </Drawer>
    </Box>
  );
};

export default Users;
