import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PageHeader from "../../components/common/PageHeader";
import ModulePage from "../../components/common/ModulePage";
import { payrollConfig } from "../../config/moduleConfigs";
import execReq from "../../lib/execReq";
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
  "December",
];
export default function Payroll() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [generating, setGenerating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const config = useMemo(
    () => ({
      ...payrollConfig,
      endpoint: `${payrollConfig.endpoint}?month=${month}&year=${year}&refresh=${refreshKey}`,
      mutationEndpoint: payrollConfig.endpoint,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    }),
    [month, year, refreshKey],
  );
  const run = async () => {
    if (!window.confirm(`Generate payroll for ${months[month - 1]} ${year}?`))
      return;
    setGenerating(true);
    try {
      await execReq.post(`${payrollConfig.endpoint}/generate`, { month, year });
      setRefreshKey((v) => v + 1);
    } finally {
      setGenerating(false);
    }
  };
  const approve = async (id, refresh) => {
    await execReq.put(`${payrollConfig.endpoint}/${id}/approve`);
    await refresh();
  };
  const paid = async (id, refresh) => {
    await execReq.put(`${payrollConfig.endpoint}/${id}/mark-paid`, {
      paymentMode: "Bank Transfer",
    });
    await refresh();
  };
  return (
    <Box>
      <PageHeader
        title="Payroll"
        actionLabel={generating ? "Generating..." : "Run Payroll"}
        onAction={run}
        actionIcon={PaymentsOutlinedIcon}
      />
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{ mb: 2 }}
      >
        <TextField
          select
          size="small"
          label="Month"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          sx={{ width: 160 }}
        >
          {months.map((m, i) => (
            <MenuItem key={m} value={i + 1}>
              {m}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ width: 120 }}
        >
          {[
            today.getFullYear() - 1,
            today.getFullYear(),
            today.getFullYear() + 1,
          ].map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <ModulePage
        config={config}
        hideHeader
        extraActions={(row, refresh) => (
          <>
            {["Pending", "Draft"].includes(row.status) && (
              <Button
                size="small"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={() => approve(row._id, refresh)}
              >
                Approve
              </Button>
            )}
            {row.status === "Approved" && (
              <Button
                size="small"
                startIcon={<AccountBalanceWalletOutlinedIcon />}
                onClick={() => paid(row._id, refresh)}
              >
                Paid
              </Button>
            )}
          </>
        )}
      />
    </Box>
  );
}
