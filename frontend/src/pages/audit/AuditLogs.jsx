import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Chip } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import DataGrid from "../../components/common/DataGrid";
import execReq from "../../lib/execReq";

const AuditLogs = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    execReq("/audit-logs")
      .then(({ data }) => setRows(Array.isArray(data) ? data : data.data || []))
      .catch(() => setRows([]));
  }, []);

  return (
    <Box>
      <PageHeader title="Audit Logs" description="Review security and operational activity captured by the backend audit middleware." />
      <Card sx={{ borderRadius: "4px" }}>
        <CardContent sx={{ p: 0 }}>
          <DataGrid minWidth={820} rows={rows} emptyMessage="No audit logs available." columns={[
            { field: "user", headerName: "User", valueGetter: (row) => row.user?.name || row.user?.email || row.user || "System" },
            { field: "method", headerName: "Method", renderCell: (row) => <Chip size="small" label={row.method || row.action || "ACTION"} /> },
            { field: "path", headerName: "Path", valueGetter: (row) => row.path || row.resource || row.endpoint || "-" },
            { field: "status", headerName: "Status", valueGetter: (row) => row.statusCode || row.status || "-" },
            { field: "ip", headerName: "IP", valueGetter: (row) => row.ip || row.ipAddress || "-" },
            { field: "createdAt", headerName: "Time", valueGetter: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-" },
          ]} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuditLogs;
