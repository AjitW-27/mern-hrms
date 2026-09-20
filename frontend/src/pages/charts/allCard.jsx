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
          icon={<PeopleIcon sx={{ color: "#FFFFFF", fontSize: 45  }} />}
          color="#8B5CF6"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          title="Departments"
          value="8"
          change="0%"
          icon={<BusinessIcon sx={{ color: "#FFFFFF", fontSize: 45  }} />}
          color="linear-gradient(135deg, #4F46E5, #26A8B3)"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          title="Active Projects"
          value="15"
          change="+8%"
          icon={<WorkIcon sx={{ color: "#FFFFFF", fontSize: 45  }} />}
          color="#10B981"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KpiCard
          title="Payroll"
          value="₹48,760"
          change="+15%"
          icon={<AccountBalanceWalletIcon sx={{ color: "#FFFFFF", fontSize: 45 }} />}
          color="#F59E0B"
        />
      </Grid>
    </Grid>
  );
};

export default SmallChart;
