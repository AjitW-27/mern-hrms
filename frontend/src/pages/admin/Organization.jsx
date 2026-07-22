import React, { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import api from "../../lib/api";
import PageHeader from "../../components/common/PageHeader";

const Organization = () => {
  const [form, setForm] = useState({ name: "", legalName: "", code: "", industry: "", email: "", phone: "", website: "", address: "", timezone: "Asia/Kolkata" });

  useEffect(() => {
    api.get("/admin/organization").then(({ data }) => data.data && setForm((prev) => ({ ...prev, ...data.data }))).catch(() => {});
  }, []);

  const save = async () => {
    await api.put("/admin/organization", form);
  };

  return (
    <Box>
      <PageHeader title="Organization" description="Manage company profile, contact details, and operational settings." />
      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={2}>
            {[
              ["name", "Organization Name"],
              ["legalName", "Legal Name"],
              ["code", "Code"],
              ["industry", "Industry"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["website", "Website"],
              ["timezone", "Timezone"]
            ].map(([key, label]) => (
              <Grid item xs={12} md={6} key={key}>
                <TextField fullWidth label={label} value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
              </Grid>
            ))}
            <Grid item xs={12}>
              <TextField fullWidth label="Address" multiline rows={4} value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={save}>Save organization</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Organization;
