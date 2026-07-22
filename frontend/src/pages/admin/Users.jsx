import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
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
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import api from "../../lib/api";
import PageHeader from "../../components/common/PageHeader";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
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
    setForm({
      name: "",
      email: "",
      mobileNo: "",
      password: "",
      role: roles[0]?._id || "",
      organization: organizations[0]?._id || "",
      status: "active",
    });
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || "",
      email: item.email || "",
      mobileNo: item.mobileNo || "",
      password: "",
      role: item.role?._id || item.role || "",
      organization: item.organization?._id || item.organization || "",
      status: item.status || "active",
    });
    setOpen(true);
  };

  const submit = async () => {
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    if (editing?._id) await api.put(`/admin/users/${editing._id}`, payload);
    else await api.post("/admin/users", payload);
    await load();
    setOpen(false);
  };

  const remove = async (id) => {
    await api.delete(`/admin/users/${id}`);
    await load();
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
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    bgcolor: "rgba(185, 202, 243, 0.72)",
                    borderBottom: "1px solid rgba(148,163,184,.2)",
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
                        color: "#fff",
                        backgroundColor: user.isActive ? "#2E7D32" : "#D32F2F",
                        "& .MuiChip-label": {
                          color: "#fff",
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

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editing ? "Edit User" : "Add User"}
        </DialogTitle>
        <DialogContent>
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
                  <MenuItem key={role._id} value={role._id}>
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
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
