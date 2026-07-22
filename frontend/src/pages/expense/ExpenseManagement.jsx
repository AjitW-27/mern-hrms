import React from "react";
import { Button, Stack } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CrudPage from "../../components/common/CrudPage";
import { expenseConfig } from "../../config/moduleConfigs";
import api from "../../lib/api";
import useAuthStore from "../../strore/authStore";

const ExpenseManagement = () => {
  const { user } = useAuthStore();
  const role = user?.role || "employee";
  const canApprove = ["superadmin", "admin", "hr", "manager"].includes(role);

  const config = {
    ...expenseConfig,
    endpoint: canApprove ? "/expenses" : "/expenses/my-expenses",
    createEndpoint: "/expenses/apply",
    fields: canApprove ? expenseConfig.fields : expenseConfig.fields.filter((field) => field.name !== "status")
  };

  const updateStatus = async (id, status, refresh) => {
    await api.put(`/expenses/${id}/status`, { status });
    await refresh();
  };

  return (
    <CrudPage
      config={config}
      extraActions={(row, refresh) =>
        canApprove && String(row.status || "Pending") === "Pending" ? (
          <Stack direction="row" spacing={0.75}>
            <Button size="small" color="success" startIcon={<CheckCircleRoundedIcon />} onClick={() => updateStatus(row._id, "Approved", refresh)}>
              Approve
            </Button>
            <Button size="small" color="error" startIcon={<CancelRoundedIcon />} onClick={() => updateStatus(row._id, "Rejected", refresh)}>
              Reject
            </Button>
          </Stack>
        ) : null
      }
    />
  );
};

export default ExpenseManagement;
