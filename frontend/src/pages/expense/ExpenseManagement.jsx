import React from "react";
import { Button, Stack } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ModulePage from "../../components/common/ModulePage";
import { expenseConfig } from "../../config/moduleConfigs";
import execReq from "../../lib/execReq";
import useAuthStore from "../../strore/authStore";
export default function ExpenseManagement() {
  const user = useAuthStore((s) => s.user);
  const role = String(user?.role || "employee").toLowerCase();
  const canApprove = [
    "superadmin",
    "super_admin",
    "admin",
    "hr",
    "manager",
  ].includes(role);
  const config = {
    ...expenseConfig,
    endpoint: canApprove ? "/expenses" : "/expenses/my-expenses",
    createEndpoint: "/expenses/apply",
    canEdit: false,
    canDelete: false,
    fields: canApprove
      ? expenseConfig.fields
      : expenseConfig.fields.filter((f) => f.name !== "status"),
  };
  const update = async (id, status, refresh) => {
    await execReq.put(`/expenses/${id}/status`, { status });
    await refresh();
  };
  return (
    <ModulePage
      config={config}
      extraActions={(row, refresh) =>
        canApprove && String(row.status || "Pending") === "Pending" ? (
          <Stack direction="row" spacing={0.5}>
            <Button
              size="small"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={() => update(row._id, "Approved", refresh)}
            >
              Approve
            </Button>
            <Button
              size="small"
              startIcon={<CancelOutlinedIcon />}
              onClick={() => update(row._id, "Rejected", refresh)}
            >
              Reject
            </Button>
          </Stack>
        ) : null
      }
    />
  );
}
