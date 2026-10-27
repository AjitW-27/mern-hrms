import { Button, Modal as Dialog, Input as TextField } from "../../components/common/UI";
import React, { useEffect, useState } from "react";
import { Alert, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Typography } from "@mui/material";
import execReq from "../../lib/execReq";

export default function LinkEmployeeDialog({ user, onClose, onLinked }) {
  const [search, setSearch] = useState(""), [employees, setEmployees] = useState([]), [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setSelected(""); setError("");
    const timer = setTimeout(() => { if (user) execReq("/employees", { params: { search, limit: 50 } }).then(({ data }) => { if (active) setEmployees(data.data || []); }).catch(() => { if (active) setError("Unable to load employee records."); }); }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [user, search]);
  const save = async () => {
    setBusy(true); setError("");
    try { const { data } = await execReq.put("/users/" + user._id + "/employee", { employeeRef: selected }); if (!data.success) throw new Error(); await onLinked(); onClose(); }
    catch (err) { setError(err?.response?.data?.message || "Could not link the employee. Please retry."); }
    finally { setBusy(false); }
  };
  return <Dialog open={Boolean(user)} onClose={() => { if (!busy) onClose(); }} fullWidth maxWidth="sm"><DialogTitle>Link employee profile</DialogTitle><DialogContent><Typography variant="body2" sx={{ mb: 2 }}>Link {user?.name} ({user?.email}) to their employee record. Existing links to other accounts cannot be overwritten.</Typography><Stack spacing={2}><TextField label="Search employees by name, email or number" value={search} onChange={event => setSearch(event.target.value)} /><TextField select label="Employee profile" value={selected} onChange={event => setSelected(event.target.value)}>{employees.map(employee => <MenuItem key={employee._id} value={employee._id}>{employee.fullName} · {employee.employeeId} · {employee.email}</MenuItem>)}</TextField>{error && <Alert severity="error">{error}</Alert>}</Stack></DialogContent><DialogActions><Button disabled={busy} onClick={onClose}>Cancel</Button><Button variant="contained" disabled={!selected || busy} onClick={save}>{busy ? "Linking…" : "Link employee"}</Button></DialogActions></Dialog>;
}
