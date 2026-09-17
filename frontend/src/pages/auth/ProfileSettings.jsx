import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Grid, TextField, Typography } from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import PageHeader from "../../components/common/PageHeader";
import api from "../../lib/api";
import useAuthStore from "../../strore/authStore";

const ProfileSettings = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const storedUser = useAuthStore((state) => state.user);
  const [form, setForm] = useState({ name: "", email: "", mobileNo: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/auth/profile")
      .then(({ data }) => {
        const user = data?.user || storedUser || {};
        setForm({ name: user.name || "", email: user.email || "", mobileNo: user.mobileNo || "" });
      })
      .catch((err) => setError(err?.response?.data?.message || "Unable to load your profile."))
      .finally(() => setLoading(false));
  }, [storedUser]);

  const save = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.put("/auth/profile", { name: form.name, mobileNo: form.mobileNo });
      const user = { ...storedUser, ...data.user };
      setAuth({ user, token: useAuthStore.getState().token || localStorage.getItem("hrms_token") || localStorage.getItem("token") });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 2.5 }, maxWidth: 900 }}>
      <PageHeader title="My Profile" description="Keep your account contact details up to date." />
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Full name" value={form.name} disabled={loading} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Email address" value={form.email} disabled helperText="Email changes are managed by an administrator." /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Mobile number" value={form.mobileNo} disabled={loading} onChange={(event) => setForm((current) => ({ ...current, mobileNo: event.target.value }))} /></Grid>
            <Grid item xs={12}><Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={save} disabled={loading || saving || !form.name.trim()}>{saving ? "Saving..." : "Save profile"}</Button></Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfileSettings;
