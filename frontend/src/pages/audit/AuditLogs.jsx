import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../lib/api";

const AuditLogs = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api
      .get("/audit-logs")
      .then(({ data }) => setRows(Array.isArray(data) ? data : data.data || []))
      .catch(() => setRows([]));
  }, []);

  return (
    <Box>
      <PageHeader title="Audit Logs" description="Review security and operational activity captured by the backend audit middleware." />
      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 820 }}>
              <TableHead>
                <TableRow>
                  {["User", "Method", "Path", "Status", "IP", "Time"].map((head) => (
                    <TableCell key={head} sx={{ fontWeight: 700 }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell>{row.user?.name || row.user?.email || row.user || "System"}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.method || row.action || "ACTION"} />
                    </TableCell>
                    <TableCell>{row.path || row.resource || row.endpoint || "-"}</TableCell>
                    <TableCell>{row.statusCode || row.status || "-"}</TableCell>
                    <TableCell>{row.ip || row.ipAddress || "-"}</TableCell>
                    <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}</TableCell>
                  </TableRow>
                ))}
                {!rows.length && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      No audit logs available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuditLogs;
