import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import api from "../../lib/api";

const settingCards = [
  {
    title: "Organization Profile",
    description:
      "Company identity, branches, timezone, and contact information.",
    icon: BusinessRoundedIcon,
    path: "/dashboard/admin/organization",
  },
  {
    title: "Security & Roles",
    description:
      "Role permissions, admin users, audit controls, and access policies.",
    icon: SecurityRoundedIcon,
    path: "/dashboard/admin/roles",
  },
  {
    title: "Notifications",
    description: "Payroll, expense, attendance, and goal alert preferences.",
    icon: NotificationsActiveRoundedIcon,
    path: "/dashboard/audit-logs",
  },
];

const Settings = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    timezone: "Asia/Kolkata",
    fiscalYearStart: "April",
    payrollCutoffDay: 25,
    attendanceGraceMinutes: 10,
    emailNotifications: true,
    payrollAlerts: true,
    expenseApprovals: true,
  });

  useEffect(() => {
    api
      .get("/admin/settings")
      .then(({ data }) => {
        if (data?.data) setForm((prev) => ({ ...prev, ...data.data }));
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    await api.put("/admin/settings", form).catch(() => {});
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
      <PageHeader
        title="Settings"
        description="A central control panel for enterprise HRMS operations, security, payroll, notifications, and governance."
      />

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {settingCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} md={4} key={card.title}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  border: "1px solid rgba(148,163,184,.15)",
                  background:
                    "linear-gradient(135deg, rgba(65, 249, 203, 0.33), rgba(15,23,42,.92))",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 3,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "rgba(56,189,248,.14)",
                        color: "#38bdf8",
                      }}
                    >
                      <Icon />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={900}>
                        {card.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.75 }}
                      >
                        {card.description}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(card.path)}
                      sx={{
                        alignSelf: "flex-start",
                        color: "#eef6d59a",
                        borderColor:
                          "linear-gradient(135deg, #eef6d5f2, rgba(15,23,42,.92))",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                    >
                      Open
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Card sx={{ borderRadius: 4, border: "1px solid rgba(148,163,184,.15)" }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography variant="h5" fontWeight={900}>
                Operational Defaults
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tune common HRMS defaults used across payroll, attendance, and
                approvals.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              onClick={save}
            >
              Save Settings
            </Button>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Timezone"
                value={form.timezone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, timezone: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                size="small"
                label="Fiscal Year Start"
                value={form.fiscalYearStart}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fiscalYearStart: e.target.value }))
                }
              >
                {["January", "April", "July", "October"].map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Payroll Cutoff Day"
                value={form.payrollCutoffDay}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    payrollCutoffDay: Number(e.target.value),
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Attendance Grace Minutes"
                value={form.attendanceGraceMinutes}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    attendanceGraceMinutes: Number(e.target.value),
                  }))
                }
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            {[
              [
                "emailNotifications",
                "Email Notifications",
                "Send important HRMS workflow updates by email.",
              ],
              [
                "payrollAlerts",
                "Payroll Alerts",
                "Notify approvers and employees during payroll processing.",
              ],
              [
                "expenseApprovals",
                "Expense Approval Alerts",
                "Notify managers when reimbursement claims need action.",
              ],
            ].map(([key, title, description]) => (
              <Grid item xs={12} md={4} key={key}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid rgba(148,163,184,.15)",
                  }}
                >
                  <Box>
                    <Typography fontWeight={900}>{title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {description}
                    </Typography>
                  </Box>
                  <Switch
                    checked={Boolean(form[key])}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [key]: e.target.checked }))
                    }
                  />
                </Stack>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
