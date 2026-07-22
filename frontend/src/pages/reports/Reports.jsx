import React, { useState } from "react";
import { Box, Button, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../lib/api";

const reportTypes = [
  { label: "Attendance Report", value: "attendance" },
  { label: "Payroll Report", value: "payroll" },
  { label: "Leave Report", value: "leave" },
  { label: "HR Summary", value: "hr-summary", enterprise: true }
];

const Reports = () => {
  const [type, setType] = useState("attendance");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runReport = async () => {
    setLoading(true);
    try {
      const endpoint = type === "hr-summary" ? "/enterprise/reports/hr-summary" : `/reports/${type}`;
      const { data } = await api.get(endpoint);
      setResult(data.data || data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Reports" description="Run attendance, payroll, leave, and HR summary reports from backend endpoints." />
      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField fullWidth select label="Report Type" value={type} onChange={(e) => setType(e.target.value)}>
                {reportTypes.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button fullWidth variant="contained" onClick={runReport} disabled={loading}>
                {loading ? "Running..." : "Run Report"}
              </Button>
            </Grid>
          </Grid>

          <Stack sx={{ mt: 3, p: 2, borderRadius: 3, bgcolor: "rgba(15,23,42,.06)", overflowX: "auto" }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800 }}>
              Result
            </Typography>
            <Typography component="pre" sx={{ m: 0, fontSize: 13, whiteSpace: "pre-wrap" }}>
              {result ? JSON.stringify(result, null, 2) : "Run a report to preview backend data here."}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
