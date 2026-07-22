import React, { useMemo, useState } from "react";
import { Box, Button, CircularProgress, MenuItem, Stack, TextField } from "@mui/material";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import CrudPage from "../../components/common/CrudPage";
import { payrollConfig } from "../../config/moduleConfigs";
import api from "../../lib/api";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const Payroll = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [generating, setGenerating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const config = useMemo(() => ({
    ...payrollConfig,
    endpoint: `${payrollConfig.endpoint}?month=${month}&year=${year}&refresh=${refreshKey}`,
    mutationEndpoint: payrollConfig.endpoint,
    description: `${payrollConfig.description} Current cycle: ${months[month - 1]} ${year}.`
  }), [month, refreshKey, year]);

  const runPayroll = async () => {
    if (!window.confirm(`Generate payroll for ${months[month - 1]} ${year}?`)) return;
    setGenerating(true);
    try {
      await api.post(`${payrollConfig.endpoint}/generate`, { month, year });
      setRefreshKey((value) => value + 1);
    } finally {
      setGenerating(false);
    }
  };

  const approvePayroll = async (id, refresh) => {
    await api.put(`${payrollConfig.endpoint}/${id}/approve`);
    await refresh();
  };

  const markPaid = async (id, refresh) => {
    await api.put(`${payrollConfig.endpoint}/${id}/mark-paid`, { paymentMode: "Bank Transfer" });
    await refresh();
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="flex-end" sx={{ px: { xs: 1.5, md: 2.5 }, pt: { xs: 1.5, md: 2 } }}>
        <TextField select size="small" label="Month" value={month} onChange={(event) => setMonth(Number(event.target.value))} sx={{ minWidth: 160 }}>
          {months.map((name, index) => <MenuItem key={name} value={index + 1}>{name}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Year" value={year} onChange={(event) => setYear(Number(event.target.value))} sx={{ minWidth: 120 }}>
          {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <Button variant="contained" startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <PaymentsRoundedIcon />} disabled={generating} onClick={runPayroll}>
          {generating ? "Generating..." : "Run Payroll"}
        </Button>
      </Stack>

      <CrudPage
        config={config}
        extraActions={(row, refresh) => (
          <>
            {["Pending", "Draft"].includes(row.status) ? (
              <Button size="small" startIcon={<CheckCircleRoundedIcon />} onClick={() => approvePayroll(row._id, refresh)}>
                Approve
              </Button>
            ) : null}
            {row.status === "Approved" ? (
              <Button size="small" color="success" startIcon={<AccountBalanceWalletRoundedIcon />} onClick={() => markPaid(row._id, refresh)}>
                Paid
              </Button>
            ) : null}
          </>
        )}
      />
    </Box>
  );
};

export default Payroll;
