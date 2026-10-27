import { Button, Badge as Chip, Modal as Dialog, Input as TextField } from "../../components/common/UI";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Box, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import DataGrid from "../../components/common/DataGrid";
import { fetchCollection } from "../../lib/collections";
import execReq from "../../lib/execReq";

export default function LeaveApprovals() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const all = await fetchCollection("/leaves");
      setRows(all); setTotal(all.length);
    } catch (err) { setError(err?.response?.data?.message || "Could not load leave requests."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const submit = async () => {
    setSaving(true); setError("");
    try {
      const { data } = await execReq.put("/leaves/" + decision.row._id + "/status", { status: decision.status, comment });
      if (!data.success) throw new Error("Decision could not be saved.");
      setDecision(null); setComment(""); await load();
    } catch (err) { setError(err?.response?.data?.message || "Decision could not be saved."); }
    finally { setSaving(false); }
  };
  return <Box>
    <Typography variant="body2" sx={{ mb: 2 }}>Review leave requests assigned to you. HR and administrators can review all requests.</Typography>
    
    <DataGrid rows={rows.filter(row => [row.employee?.fullName, row.employee?.employeeId, row.leaveType, row.status].join(" ").toLowerCase().includes(search.toLowerCase()))}
      error={!decision ? error : ""} loading={loading} searchValue={search} searchPlaceholder="Search requests…" onSearchChange={setSearch}
      page={page} rowsPerPage={20} totalCount={total} onPageChange={(_, next) => setPage(next)} rowsPerPageOptions={[20]}
      config={{ onRefreshClick: load }} columns={[
        { field: "employee", headerName: "Employee", valueGetter: row => row.employee?.fullName || "Unavailable profile" },
        { field: "leaveType", headerName: "Leave type" },
        { field: "fromDate", headerName: "From", valueGetter: row => new Date(row.fromDate).toLocaleDateString("en-IN") },
        { field: "toDate", headerName: "To", valueGetter: row => new Date(row.toDate).toLocaleDateString("en-IN") },
        { field: "totalDays", headerName: "Days" },
        { field: "reason", headerName: "Reason" },
        { field: "status", headerName: "Status", renderCell: row => <Chip size="small" label={row.status} color={row.status === "approved" ? "success" : row.status === "rejected" ? "error" : "default"} /> },
        { field: "comment", headerName: "Decision comment" },
      ]} actions={row => row.status === "pending" ? <Stack direction="row" spacing={1}><Button size="small" onClick={() => { setComment(""); setDecision({ row, status: "approved" }); }}>Approve</Button><Button size="small" color="error" onClick={() => { setComment(""); setDecision({ row, status: "rejected" }); }}>Reject</Button></Stack> : <Typography variant="caption">Processed</Typography>} />
    <Dialog open={Boolean(decision)} onClose={() => { if (!saving) setDecision(null); }} fullWidth maxWidth="sm">
      <DialogTitle>{decision?.status === "approved" ? "Approve leave" : "Reject leave"}</DialogTitle>
      <DialogContent><Typography variant="body2" sx={{ mb: 2 }}>{decision?.row.employee?.fullName} · {decision?.row.leaveType} leave</Typography><TextField autoFocus fullWidth multiline minRows={3} label="Decision comment" value={comment} onChange={event => setComment(event.target.value)} inputProps={{ maxLength: 2000 }} />{error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}</DialogContent>
      <DialogActions><Button disabled={saving} onClick={() => setDecision(null)}>Cancel</Button><Button disabled={saving} variant="contained" onClick={submit}>{saving ? "Saving…" : "Confirm decision"}</Button></DialogActions>
    </Dialog>
  </Box>;
}
