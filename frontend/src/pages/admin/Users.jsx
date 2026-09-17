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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import api from "../../lib/api";
import PageHeader from "../../components/common/PageHeader";

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
      api.get("/admin/users"),
      api.get("/admin/roles"),
      api.get("/admin/organization"),
    ]);
    setUsers(u.data.data || []);
    setRoles(r.data.data || []);
    setOrganizations(o.data.data ? [o.data.data] : []);
  };

  useEffect(() => {
    load().catch(() => {});
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
      if (editing?._id) await api.put(`/admin/users/${editing._id}`, payload);
      else await api.post("/admin/users", payload);
      await load();
      setOpen(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save user.");
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to deactivate user.");
    }
  };

  return (
    <Box>
      <PageHeader
        title="Admin Users"
        description="Manage user accounts, organization mapping, and access assignment."
        actionLabel="Add User"
        onAction={openCreate}
        actionIcon={AddRoundedIcon}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                  bgcolor: "background.default",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mobile</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>{user.name || "-"}</TableCell>

                  <TableCell>{user.email || "-"}</TableCell>

                  <TableCell>{user.mobileNo || "-"}</TableCell>

                  <TableCell>{user.department || "-"}</TableCell>

                  <TableCell sx={{ textTransform: "capitalize" }}>
                    {user.role?.name || user.role || "-"}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={user.isActive ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        minWidth: 90,
                        fontWeight: 600,
                        color: "primary.contrastText",
                        backgroundColor: user.isActive ? "success.main" : "error.main",
                        "& .MuiChip-label": {
                          color: "primary.contrastText",
                          px: 2,
                        },
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        color="primary"
                        onClick={() => openEdit(user)}
                        size="small"
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => remove(user._id)}
                        size="small"
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
