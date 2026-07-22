import { Grid } from "@mui/material";
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from "@mui/icons-material";
import KpiCard from "./smallCard";

const SmallChart = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          title="Total Employees"
          value="128"
          change="+12%"
          icon={<PeopleIcon sx={{ color: "#fff", fontSize: 45  }} />}
          color="linear-gradient(135deg, #7c3aed, #6366f1)"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          title="Departments"
          value="8"
          change="0%"
          icon={<BusinessIcon sx={{ color: "#fff", fontSize: 45  }} />}
          color="linear-gradient(135deg, #3b82f6, #06b6d4)"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          title="Active Projects"
          value="15"
          change="+8%"
          icon={<WorkIcon sx={{ color: "#fff", fontSize: 45  }} />}
          color="linear-gradient(135deg, #10b981, #22c55e)"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          title="Payroll"
          value="₹48,760"
          change="+15%"
          icon={<AccountBalanceWalletIcon sx={{ color: "#fff", fontSize: 45 }} />}
          color="linear-gradient(135deg, #f59e0b, #f97316)"
        />
      </Grid>
    </Grid>
  );
};

export default SmallChart;
