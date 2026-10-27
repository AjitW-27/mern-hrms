import React, { useState } from "react";
import { Stack } from "@mui/material";
import { Button, Select } from "../../components/common/UI";
import DataTable from "../../components/common/DataTable";
import execReq from "../../lib/execReq";
const reportTypes = [{ label: "Attendance Report", value: "attendance" }, { label: "Payroll Report", value: "payroll" }, { label: "Leave Report", value: "leave" }, { label: "HR Summary", value: "hr-summary" }];
export default function Reports() {
 const [type, setType] = useState("attendance"), [result, setResult] = useState(null), [loading, setLoading] = useState(false), [error, setError] = useState("");
 const runReport = async () => { setLoading(true); setError(""); try { const { data } = await execReq(type === "hr-summary" ? "/enterprise/reports/hr-summary" : `/reports/${type}`); setResult(data.data ?? data); } catch (err) { setError(err?.response?.data?.message || "Could not load this report."); } finally { setLoading(false); } };
 const entries = Array.isArray(result) ? result : result ? Object.entries(result).map(([metric, value]) => ({ metric, value })) : [];
 const columns = [...new Set(entries.flatMap(row => Object.keys(row)))].filter(key => key !== "_id" && key !== "__v").map(field => ({ field, headerName: field, renderCell: row => typeof row[field] === "object" && row[field] !== null ? JSON.stringify(row[field]) : String(row[field] ?? "") }));
 return <Stack spacing={2}><Stack direction="row" spacing={1}><Select label="Report Type" value={type} options={reportTypes} onChange={event => { setType(event.target.value); setResult(null); setError(""); }} sx={{ maxWidth: 360 }} /><Button variant="primary" loading={loading} onClick={runReport}>Run Report</Button></Stack><DataTable rows={entries} columns={columns.length ? columns : [{ field: "metric", headerName: "Metric" }, { field: "value", headerName: "Value" }]} loading={loading} error={error} onRetry={runReport} onRefresh={runReport} emptyMessage="Run a report to view authorized records." /></Stack>;
}
