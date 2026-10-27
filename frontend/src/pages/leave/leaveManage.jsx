import React, { useCallback, useEffect, useState } from "react";
import { Alert, Box, Stack } from "@mui/material";
import { useLocation } from "react-router-dom";
import { Badge, Button, ConfirmDialog, DatePicker, EmptyState, ErrorState, Input, Modal, Select, StatCard, Tabs } from "../../components/common/UI";
import DataTable from "../../components/common/DataTable";
import execReq from "../../lib/execReq";
import { fetchCollection } from "../../lib/collections";
import useAuthStore from "../../strore/authStore";
import LeaveApprovals from "./LeaveApprovals";

const initialForm = { leaveType: "", managerId: "", fromDate: "", toDate: "", reason: "", supportingDocument: null };
const idOf = value => String(value?._id || value?.id || value || "");
export default function LeaveManagement() {
  const user = useAuthStore(state => state.user), location = useLocation();
  const role = String(user?.role?.code || user?.role || "employee").toLowerCase();
  const canReview = ["admin", "hr", "manager", "superadmin", "super_admin"].includes(role), canSelect = ["admin", "hr", "superadmin", "super_admin"].includes(role);
  const [tab, setTab] = useState(location.state?.approvals && canReview ? "approvals" : "my"), [rows, setRows] = useState([]), [employees, setEmployees] = useState([]), [employeeId, setEmployeeId] = useState("");
  const [rosterError, setRosterError] = useState("");
  const selectedEmployee = employees.find(item => idOf(item) === employeeId);
  const [balances, setBalances] = useState({}), [loading, setLoading] = useState(true), [error, setError] = useState(""), [unlinked, setUnlinked] = useState(false);
  const [open, setOpen] = useState(false), [form, setForm] = useState(initialForm), [saving, setSaving] = useState(false), [formError, setFormError] = useState(""), [cancel, setCancel] = useState(null);
  const load = useCallback(async () => {
    setLoading(true); setError(""); setUnlinked(false);
    try {
      if (employeeId && canSelect) { const all = await fetchCollection("/leaves"); setRows(all.filter(leave => idOf(leave.employee) === employeeId)); setBalances(selectedEmployee?.leaveBalance || {}); }
      else { const response = await execReq("/leaves/my"); setUnlinked(response.data?.employeeLinked === false); setRows(response.data?.data || []); setBalances(response.data?.leaveBalance || {}); }
    } catch (err) {
      const message = err?.response?.data?.message || "Could not load leave history.";
      if (/employee.*(not found|profile|link)|no.*employee|not.*linked/i.test(message)) { setUnlinked(true); setRows([]); setBalances({}); }
      else setError(message);
    } finally { setLoading(false); }
  }, [employeeId, canSelect, selectedEmployee]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (location.state?.approvals && canReview) setTab("approvals"); }, [location.key, location.state?.approvals, canReview]);
  const canReadEmployees = canSelect || user?.rolePermissions?.employees?.read === true;
  const loadEmployees = useCallback(async () => { if (!canReadEmployees) return; setRosterError(""); try { setEmployees(await fetchCollection("/employees")); } catch (err) { setRosterError(err?.response?.data?.message || "Unable to load employees."); } }, [canReadEmployees]);
  useEffect(() => { loadEmployees(); }, [loadEmployees]);
  const submit = async event => {
    event.preventDefault(); setFormError("");
    if (!form.leaveType || !form.fromDate || !form.toDate || !form.reason.trim()) return setFormError("Complete the required fields.");
    if (form.toDate < form.fromDate) return setFormError("End date must be on or after the start date.");
    setSaving(true);
    try { const payload = new FormData(); Object.entries(form).forEach(([key, value]) => { if (value) payload.append(key, value); }); const response = await execReq.post("/leaves/apply", payload); if (!response.data?.success) throw new Error(response.data?.message || "Could not apply for leave."); setOpen(false); setForm(initialForm); await load(); }
    catch (err) { setFormError(err?.response?.data?.message || err.message); } finally { setSaving(false); }
  };
  const date = value => value ? new Date(value).toLocaleDateString("en-GB") : "\u2014";
  const columns = [{ field: "leaveType", headerName: "Leave Type" }, { field: "fromDate", headerName: "From", renderCell: row => date(row.fromDate) }, { field: "toDate", headerName: "To", renderCell: row => date(row.toDate) }, { field: "totalDays", headerName: "Days" }, { field: "reason", headerName: "Reason" }, { field: "status", headerName: "Status", renderCell: row => <Badge label={row.status} /> }, { field: "comment", headerName: "Decision Comment" }];
  return <Stack spacing={2}>
    <Tabs value={tab} onChange={(_, value) => setTab(value)} options={[{ value: "my", label: "My Leave" }, ...(canReview ? [{ value: "approvals", label: "Approvals" }] : [])]} />
    {tab === "approvals" ? <LeaveApprovals /> : <>
      {rosterError && <ErrorState error={rosterError} onRetry={loadEmployees} />}
      {canSelect && <Select label="Employee" value={employeeId} options={[{ value: "", label: "My employee profile" }, ...employees.map(employee => ({ value: idOf(employee), label: `${employee.fullName} (${employee.employeeId || employee.email || ""})` }))]} onChange={event => setEmployeeId(event.target.value)} sx={{ maxWidth: 360 }} />}
      {unlinked ? <EmptyState title="Employee profile required" description="Your account is not linked to an employee profile. Please contact HR." /> : <>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" }, gap: 2 }}>{Object.entries(balances).map(([key, value]) => <StatCard key={key} title={`${key.charAt(0).toUpperCase() + key.slice(1)} Leave`} value={typeof value === "object" ? value?.remaining ?? 0 : value} subtitle="Days remaining" loading={loading} />)}<StatCard title="Pending Requests" value={rows.filter(row => row.status === "pending").length} loading={loading} /></Box>
        <DataTable rows={rows} columns={columns} loading={loading} error={error} onRetry={load} onRefresh={load} addBtn={!employeeId ? "Add Leave Request" : undefined} onAddClick={() => { setFormError(""); setOpen(true); }} filterFields={[{ field: "status", label: "Status", options: ["pending", "approved", "rejected", "cancelled"] }]} actions={!employeeId ? row => row.status === "pending" ? <Button variant="outline" size="small" onClick={() => setCancel(row)}>Cancel Request</Button> : null : undefined} />
      </>}
    </>}
    <Modal open={open} onClose={saving ? undefined : () => setOpen(false)} title="Apply for Leave"><Box component="form" onSubmit={submit}><Stack spacing={2} sx={{ pt: 1 }}>
      {formError && <Alert severity="error">{formError}</Alert>}
      <Select required label="Leave Type" value={form.leaveType} onChange={event => setForm({ ...form, leaveType: event.target.value })} options={[{ value: "", label: "Select leave type" }, ...["casual", "sick", "earned", "unpaid"].map(value => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }))]} />
      <Select label="Approver" value={form.managerId} onChange={event => setForm({ ...form, managerId: event.target.value })} options={[{ value: "", label: "Assigned reporting manager" }, ...employees.map(employee => ({ value: idOf(employee), label: employee.fullName }))]} />
      <DatePicker required label="From Date" value={form.fromDate} onChange={event => setForm({ ...form, fromDate: event.target.value })} /><DatePicker required label="To Date" value={form.toDate} onChange={event => setForm({ ...form, toDate: event.target.value })} inputProps={{ min: form.fromDate }} />
      <Input required label="Reason" multiline minRows={3} value={form.reason} onChange={event => setForm({ ...form, reason: event.target.value })} />
      <Input type="file" label="Supporting Document" InputLabelProps={{ shrink: true }} onChange={event => setForm({ ...form, supportingDocument: event.target.files?.[0] || null })} />
      <Stack direction="row" justifyContent="flex-end" spacing={1}><Button variant="outline" disabled={saving} onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" variant="primary" loading={saving}>Submit Request</Button></Stack>
    </Stack></Box></Modal>
    <ConfirmDialog open={Boolean(cancel)} onClose={() => setCancel(null)} title="Cancel Leave Request" message="Cancel this pending leave request?" onConfirm={async () => { const response = await execReq.put(`/leaves/${cancel._id}/cancel`); if (!response.data?.success) throw new Error(response.data?.message || "Cancellation failed."); await load(); }} />
  </Stack>;
}
